import { createGemini } from "./gemini";

export type { AgentDraft, LlmProvider } from "./types";

/** The active LLM provider. Phase 1: Gemini only. */
export const llm = createGemini(process.env.GEMINI_API_KEY);
