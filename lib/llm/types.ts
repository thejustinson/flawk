/** Structured agent draft produced from a freeform description. */
export type AgentDraft = {
  name: string;
  purpose: string;
  can: string[];
  cannot: string[];
  inputs: string;
  outputs: string;
  pricePerTask: number;
  costCapPerTask: number;
};

/**
 * Thin LLM provider seam. Phase 1 has one implementation (Gemini); keep callers
 * depending on this interface so the provider stays swappable.
 */
export interface LlmProvider {
  readonly available: boolean;
  draftAgent(description: string): Promise<AgentDraft>;
}
