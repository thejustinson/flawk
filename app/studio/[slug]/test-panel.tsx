"use client";

import { useActionState } from "react";
import { testRunAgent, type TestRunState } from "@/lib/agents/actions";

const initial: TestRunState = {};

const STOP_LABEL: Record<string, string> = {
  completed: "completed",
  cost_cap: "hit cost cap",
  max_iterations: "max tool rounds",
  error: "errored",
};

export function TestPanel({ agentId }: { agentId: string }) {
  const [state, action, pending] = useActionState(testRunAgent, initial);
  const result = state.result;

  return (
    <section className="mt-10">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
        Test run
      </h2>
      <p className="mt-1 text-xs text-muted">
        Runs the serving version. The cost cap is enforced in code — the run
        stops the moment spend reaches it.
      </p>

      <form action={action} className="mt-3">
        <input type="hidden" name="agentId" value={agentId} />
        <textarea
          name="input"
          rows={3}
          required
          placeholder="Input to run the agent against."
          className="w-full squircle-sm border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-3 squircle-sm bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Running…" : "Run"}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 squircle-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {result && (
        <div className="mt-4 squircle-md border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span
              className={`squircle-pill px-2.5 py-0.5 font-semibold ${
                result.success
                  ? "bg-accent-soft text-accent"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {result.success ? "success" : "no output"}
            </span>
            <span className="text-muted">
              {STOP_LABEL[result.stopReason] ?? result.stopReason}
            </span>
            <span className="font-mono text-muted">
              cost ${result.cost.toFixed(4)}
            </span>
          </div>

          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-[13px] leading-relaxed">
            {result.output || "(no output)"}
          </pre>

          {result.toolCalls.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                Tool calls
              </div>
              <ol className="mt-2 space-y-2 text-xs">
                {result.toolCalls.map((tc, i) => (
                  <li
                    key={i}
                    className="squircle-sm border border-border bg-background p-3"
                  >
                    <div className="font-mono">
                      <span className="font-semibold">{tc.name}</span>(
                      {JSON.stringify(tc.args)}) · ${tc.cost.toFixed(4)} ·{" "}
                      {tc.ok ? "ok" : "fail"}
                    </div>
                    <div className="mt-1 line-clamp-4 whitespace-pre-wrap text-muted">
                      {tc.result}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
