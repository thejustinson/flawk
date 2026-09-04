"use client";

import { useActionState, useEffect, useState } from "react";
import { AgentForm } from "@/app/studio/_components/agent-form";
import {
  createAgent,
  draftAgentFromPrompt,
  type DraftFromPromptState,
} from "@/lib/agents/actions";
import type { AgentDraft } from "@/lib/llm";

const initialState: DraftFromPromptState = {};

function tabClass(active: boolean) {
  return `squircle-pill px-4 py-1.5 text-sm font-medium transition-colors ${
    active ? "bg-accent text-white" : "text-muted hover:text-foreground"
  }`;
}

export function NewAgentClient({ llmAvailable }: { llmAvailable: boolean }) {
  const [mode, setMode] = useState<"describe" | "form">(
    llmAvailable ? "describe" : "form",
  );
  const [draft, setDraft] = useState<AgentDraft | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [state, formAction, pending] = useActionState(
    draftAgentFromPrompt,
    initialState,
  );

  useEffect(() => {
    if (state.draft) {
      setDraft(state.draft);
      setFormKey((k) => k + 1);
      setMode("form");
    }
  }, [state]);

  return (
    <div className="mt-6">
      <div className="inline-flex squircle-pill border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setMode("describe")}
          className={tabClass(mode === "describe")}
        >
          Describe
        </button>
        <button
          type="button"
          onClick={() => setMode("form")}
          className={tabClass(mode === "form")}
        >
          Form
        </button>
      </div>

      {mode === "describe" ? (
        <form action={formAction} className="mt-6">
          <label
            htmlFor="prompt"
            className="block text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Describe the agent
          </label>
          <textarea
            id="prompt"
            name="prompt"
            rows={5}
            required
            minLength={10}
            placeholder="An agent that takes a GitHub repo URL and returns a plain-English summary of what the project does, its stack, and how active it is."
            className="mt-2 w-full squircle-sm border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
          />

          {!llmAvailable && (
            <p className="mt-3 squircle-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Set <code className="font-mono">GEMINI_API_KEY</code> to use
              Describe mode. The Form tab works without it.
            </p>
          )}
          {state.error && (
            <p className="mt-3 squircle-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !llmAvailable}
            className="mt-4 squircle-sm bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {pending ? "Generating…" : "Generate draft"}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Gemini drafts the fields. You review and edit everything on the next
            step — nothing is created until you hit Save draft.
          </p>
        </form>
      ) : (
        <>
          {draft && (
            <p className="mt-4 squircle-sm border border-accent-soft bg-accent-soft px-4 py-3 text-sm text-accent">
              Draft generated. Check every field, then save.
            </p>
          )}
          <AgentForm
            key={formKey}
            action={createAgent}
            submitLabel="Save draft"
            defaults={
              draft
                ? {
                    name: draft.name,
                    purpose: draft.purpose,
                    can: draft.can,
                    cannot: draft.cannot,
                    inputs: draft.inputs,
                    outputs: draft.outputs,
                    pricePerTask: String(draft.pricePerTask),
                    costCapPerTask: String(draft.costCapPerTask),
                  }
                : undefined
            }
          />
        </>
      )}
    </div>
  );
}
