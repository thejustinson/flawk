import { llm, type LlmTurn } from "@/lib/llm";
import { db } from "@/lib/db";
import { runs, type AgentVersion } from "@/lib/db/schema";
import { resolveTools, toolById, type Tool } from "./tools";

const MAX_ROUNDS = 6;

export type StopReason = "completed" | "cost_cap" | "max_iterations" | "error";

export type ToolCallLog = {
  name: string;
  args: Record<string, unknown>;
  result: string;
  cost: number;
  ok: boolean;
};

export type RunResult = {
  runId: string;
  output: string;
  success: boolean;
  costIncurred: number;
  stopReason: StopReason;
  toolCalls: ToolCallLog[];
  error?: string;
};

function buildSystem(version: AgentVersion, tools: Tool[]): string {
  const cannot =
    version.prohibitedActions.length > 0
      ? version.prohibitedActions.map((c) => `  - ${c}`).join("\n")
      : "  - (none specified)";
  const toolList =
    tools.length > 0
      ? tools.map((t) => `  - ${t.spec.name}: ${t.spec.description}`).join("\n")
      : "  - (none — answer from your own knowledge)";

  return `You are "${version.name}", an autonomous agent running on Flawk.

${version.skillMd}

## Hard rules (enforced outside your control)
- Total spend for this task is capped at $${Number(version.costCapPerTask).toFixed(2)}. Reasoning and tool calls cost money. When the cap is reached you are stopped immediately, mid-task, whatever you were doing.
- You must not do any of the following:
${cannot}

## Available tools
${toolList}

## How to respond
Do exactly what the Purpose / Inputs / Outputs describe. Call tools only when you need them. When finished, reply with only the final output — no preamble, no explanation of your process.`;
}

function costOf(usage: { inputTokens: number; outputTokens: number }): number {
  const { inputPer1M, outputPer1M } = llm.pricing;
  return (
    (usage.inputTokens / 1_000_000) * inputPer1M +
    (usage.outputTokens / 1_000_000) * outputPer1M
  );
}

/**
 * Run one task against a published agent version. Enforces cost_cap_per_task as
 * a hard counter in code — the loop stops the instant spend reaches the cap,
 * regardless of what the model wants to do next. Always writes a `runs` row.
 */
export async function runAgent({
  version,
  input,
}: {
  version: AgentVersion;
  input: string;
}): Promise<RunResult> {
  const cap = Number(version.costCapPerTask);
  const tools = resolveTools(version.allowedTools);
  const toolCalls: ToolCallLog[] = [];

  let spent = 0;
  let output = "";
  let stopReason: StopReason = "completed";
  let success = false;
  let error: string | undefined;

  if (!(cap > 0)) {
    return persist({
      version,
      input,
      output:
        "This version's cost cap is $0.00 — it cannot make any paid calls. Raise the cap and republish.",
      success: false,
      costIncurred: 0,
      stopReason: "cost_cap",
      toolCalls,
    });
  }

  try {
    const system = buildSystem(version, tools);
    const turns: LlmTurn[] = [{ role: "user", text: input }];

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const res = await llm.chat({
        system,
        turns,
        tools: tools.map((t) => t.spec),
      });
      spent += costOf(res.usage);

      if (spent >= cap) {
        stopReason = "cost_cap";
        output =
          res.text?.trim() ||
          "Stopped at the cost cap before producing a final answer.";
        break;
      }

      if (res.toolCalls.length === 0) {
        output = (res.text ?? "").trim();
        success = output.length > 0;
        stopReason = "completed";
        break;
      }

      turns.push({
        role: "model",
        text: res.text ?? undefined,
        toolCalls: res.toolCalls,
      });

      let hitCap = false;
      for (const call of res.toolCalls) {
        const tool = toolById(call.name);
        let result: string;
        let cost = 0;
        let ok = false;

        if (!tool || !tools.includes(tool)) {
          result = `Error: "${call.name}" is not available to this agent.`;
        } else if (spent + tool.cost > cap) {
          result = "Error: cost cap reached — tool call refused.";
          hitCap = true;
        } else {
          try {
            result = await tool.run(call.args);
            cost = tool.cost;
            spent += cost;
            ok = true;
          } catch (e) {
            result = `Error: ${e instanceof Error ? e.message : "tool failed"}`;
          }
        }

        toolCalls.push({
          name: call.name,
          args: call.args,
          result: result.slice(0, 2000),
          cost,
          ok,
        });
        turns.push({ role: "tool", name: call.name, response: result });
      }

      if (hitCap) {
        stopReason = "cost_cap";
        output = "Stopped at the cost cap while calling tools.";
        break;
      }

      if (round === MAX_ROUNDS - 1) {
        stopReason = "max_iterations";
        output = "Stopped after the maximum number of tool rounds.";
      }
    }
  } catch (e) {
    stopReason = "error";
    error = e instanceof Error ? e.message : "run failed";
    output = `Run failed: ${error}`;
    success = false;
  }

  return persist({
    version,
    input,
    output,
    success,
    costIncurred: spent,
    stopReason,
    toolCalls,
    error,
  });
}

async function persist(args: {
  version: AgentVersion;
  input: string;
  output: string;
  success: boolean;
  costIncurred: number;
  stopReason: StopReason;
  toolCalls: ToolCallLog[];
  error?: string;
}): Promise<RunResult> {
  const [row] = await db
    .insert(runs)
    .values({
      agentId: args.version.agentId,
      versionId: args.version.id,
      input: args.input,
      output: args.output,
      costIncurred: args.costIncurred.toFixed(4),
      toolCalls: args.toolCalls,
      success: args.success,
      stopReason: args.stopReason,
    })
    .returning({ id: runs.id });

  return {
    runId: row.id,
    output: args.output,
    success: args.success,
    costIncurred: args.costIncurred,
    stopReason: args.stopReason,
    toolCalls: args.toolCalls,
    error: args.error,
  };
}
