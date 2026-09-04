import type { AgentDraft, LlmProvider } from "./types";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const endpoint = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const SYSTEM = `You design agents for Flawk, a platform for single-task autonomous AI agents.
Given a short description, produce ONE agent definition.

Guidance:
- name: 2-4 words, no "Agent" suffix unless it reads naturally.
- purpose: one concrete sentence — what it does for the caller.
- can: 2-5 short capability/tool phrases, lowercase and verb-first (e.g. "fetch_url", "summarize text", "call the GitHub API").
- cannot: 2-4 real guardrails the runner must enforce. ALWAYS include an explicit per-task spend limit and a scope limit.
- inputs: one line — what the caller provides.
- outputs: one line — what the caller gets back.
- pricePerTask: realistic small USD number, 0 to 5. Free (0) is fine.
- costCapPerTask: USD hard limit for a single run. Must be > 0 and >= pricePerTask. Keep it tight, usually 0.01 to 2.
- Phase 1 reality: one task per call, triggered by a human. No agent-to-agent hiring, no autonomous payments, no orchestrating other agents.`;

const responseSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    purpose: { type: "string" },
    can: { type: "array", items: { type: "string" } },
    cannot: { type: "array", items: { type: "string" } },
    inputs: { type: "string" },
    outputs: { type: "string" },
    pricePerTask: { type: "number" },
    costCapPerTask: { type: "number" },
  },
  required: [
    "name",
    "purpose",
    "can",
    "cannot",
    "inputs",
    "outputs",
    "pricePerTask",
    "costCapPerTask",
  ],
  propertyOrdering: [
    "name",
    "purpose",
    "can",
    "cannot",
    "inputs",
    "outputs",
    "pricePerTask",
    "costCapPerTask",
  ],
};

function normalize(raw: Partial<AgentDraft>): AgentDraft {
  const arr = (x: unknown) =>
    Array.isArray(x)
      ? x.map((s) => String(s).trim()).filter(Boolean)
      : [];
  const num = (x: unknown) => {
    const n = Number(x);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const price = num(raw.pricePerTask);
  let cap = num(raw.costCapPerTask);
  if (cap <= 0) cap = Math.max(price, 0.25);
  if (cap < price) cap = price;

  return {
    name: String(raw.name ?? "Untitled agent").trim().slice(0, 60),
    purpose: String(raw.purpose ?? "").trim(),
    can: arr(raw.can),
    cannot: arr(raw.cannot),
    inputs: String(raw.inputs ?? "").trim(),
    outputs: String(raw.outputs ?? "").trim(),
    pricePerTask: price,
    costCapPerTask: cap,
  };
}

export function createGemini(apiKey: string | undefined): LlmProvider {
  return {
    available: Boolean(apiKey),

    async draftAgent(description: string): Promise<AgentDraft> {
      if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

      const body = JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: description }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.4,
        },
      });

      let res: Response | undefined;
      for (let attempt = 0; attempt < 3; attempt++) {
        res = await fetch(endpoint(MODEL), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body,
        });
        if (res.ok) break;
        if (res.status !== 429 && res.status !== 503) break;
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      }

      if (!res || !res.ok) {
        const text = res ? await res.text() : "no response";
        const status = res?.status ?? 0;
        if (status === 429 || status === 503) {
          throw new Error("Gemini is busy right now — try again in a moment.");
        }
        throw new Error(
          `Gemini request failed (${status}). ${text.slice(0, 300)}`,
        );
      }

      const data = await res.json();
      const text: string | undefined =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini returned no content.");

      let parsed: Partial<AgentDraft>;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("Gemini returned malformed JSON.");
      }
      return normalize(parsed);
    },
  };
}
