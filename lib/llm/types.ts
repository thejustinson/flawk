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

/** A tool the model may call, as a JSON-schema function declaration. */
export type ToolSpec = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type LlmToolCall = {
  name: string;
  args: Record<string, unknown>;
  /** Opaque Gemini 3 thinking token; must be echoed back when continuing. */
  thoughtSignature?: string;
};

export type LlmTurn =
  | { role: "user"; text: string }
  | { role: "model"; text?: string; toolCalls?: LlmToolCall[] }
  | { role: "tool"; name: string; response: string };

export type TokenUsage = { inputTokens: number; outputTokens: number };

export type LlmChatResult = {
  text: string | null;
  toolCalls: LlmToolCall[];
  usage: TokenUsage;
};

/**
 * Thin LLM provider seam. Phase 1 has one implementation (Gemini); keep callers
 * depending on this interface so the provider stays swappable.
 */
export interface LlmProvider {
  readonly available: boolean;
  /** USD per 1M tokens, used by the runner's cost counter. */
  readonly pricing: { inputPer1M: number; outputPer1M: number };
  draftAgent(description: string): Promise<AgentDraft>;
  chat(opts: {
    system: string;
    turns: LlmTurn[];
    tools?: ToolSpec[];
  }): Promise<LlmChatResult>;
}
