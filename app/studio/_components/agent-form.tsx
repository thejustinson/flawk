"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { AgentFormState } from "@/lib/agents/actions";

const inputClass =
  "w-full squircle-sm border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-muted";

export type AgentFormDefaults = {
  name?: string;
  slug?: string;
  purpose?: string;
  can?: string[];
  cannot?: string[];
  inputs?: string;
  outputs?: string;
  pricePerTask?: string;
  costCapPerTask?: string;
  payees?: string[];
};

type Action = (
  state: AgentFormState,
  formData: FormData,
) => Promise<AgentFormState>;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ListField({
  label,
  name,
  hint,
  placeholder,
  defaultItems,
}: {
  label: string;
  name: string;
  hint?: string;
  placeholder: string;
  defaultItems?: string[];
}) {
  const [items, setItems] = useState<string[]>(
    defaultItems && defaultItems.length ? defaultItems : [""],
  );

  const update = (i: number, value: string) =>
    setItems(items.map((x, j) => (j === i ? value : x)));
  const remove = (i: number) =>
    setItems(items.length === 1 ? [""] : items.filter((_, j) => j !== i));

  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <div className="mt-2 space-y-2">
        {items.map((value, i) => (
          <div key={i} className="flex gap-2">
            <input
              name={name}
              value={value}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove ${label} item`}
              className="grid size-10 shrink-0 place-items-center squircle-sm border border-border text-muted transition-colors hover:bg-surface-2"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems([...items, ""])}
        className="mt-2 text-sm font-medium text-accent hover:text-accent-hover"
      >
        + Add
      </button>
    </fieldset>
  );
}

export function AgentForm({
  action,
  defaults = {},
  submitLabel,
  hidden,
  showSlug = true,
}: {
  action: Action;
  defaults?: AgentFormDefaults;
  submitLabel: string;
  hidden?: Record<string, string>;
  showSlug?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-8 space-y-7">
      {hidden &&
        Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

      <Field label="Name" hint="What people will see this agent called.">
        <input
          name="name"
          required
          minLength={2}
          maxLength={60}
          defaultValue={defaults.name}
          placeholder="URL summarizer"
          className={inputClass}
        />
      </Field>

      {showSlug && (
        <Field
          label="Slug"
          hint="Optional. Used in the API path (/agents/your-slug/run). Leave blank to generate from the name."
        >
          <input
            name="slug"
            pattern="[a-z0-9-]+"
            defaultValue={defaults.slug}
            placeholder="url-summarizer"
            className={inputClass}
          />
        </Field>
      )}

      <Field label="Purpose" hint="One or two sentences on what the agent does.">
        <textarea
          name="purpose"
          required
          rows={3}
          defaultValue={defaults.purpose}
          placeholder="Takes a URL and returns a five-bullet summary of the page."
          className={inputClass}
        />
      </Field>

      <ListField
        label="Can"
        name="can"
        hint="Tools and capabilities the agent is granted. The runner enforces this list."
        placeholder="fetch_url"
        defaultItems={defaults.can}
      />

      <ListField
        label="Cannot"
        name="cannot"
        hint="Actions the runner must refuse, whatever the model decides."
        placeholder="follow links off the given domain"
        defaultItems={defaults.cannot}
      />

      <Field label="Inputs" hint="What the caller provides.">
        <textarea
          name="inputs"
          rows={2}
          defaultValue={defaults.inputs}
          placeholder="A single public URL."
          className={inputClass}
        />
      </Field>

      <Field label="Outputs" hint="What the caller gets back.">
        <textarea
          name="outputs"
          rows={2}
          defaultValue={defaults.outputs}
          placeholder="A JSON array of five short strings."
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Price per task (USD)" hint="What you charge the caller.">
          <input
            name="pricePerTask"
            type="number"
            min="0"
            step="0.01"
            defaultValue={defaults.pricePerTask ?? "0"}
            className={inputClass}
          />
        </Field>
        <Field
          label="Cost cap per task (USD)"
          hint="Hard limit on what a single run may spend."
        >
          <input
            name="costCapPerTask"
            type="number"
            min="0"
            step="0.01"
            defaultValue={defaults.costCapPerTask ?? "0"}
            className={inputClass}
          />
        </Field>
      </div>

      <ListField
        label="Allowed payees"
        name="payee"
        hint="Optional. Solana addresses this agent's wallet may pay. Enforced by the wallet policy."
        placeholder="Solana address"
        defaultItems={defaults.payees}
      />

      {state.error && (
        <p className="squircle-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={pending}
          className="squircle-sm bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/studio"
          className="text-sm font-medium text-muted hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
