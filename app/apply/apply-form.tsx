"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitAccessRequest, type ApplyState } from "@/lib/access/actions";

const initial: ApplyState = {};
const inputClass =
  "w-full squircle-sm border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-muted";

export function ApplyForm() {
  const [state, action, pending] = useActionState(submitAccessRequest, initial);

  if (state.ok) {
    return (
      <div className="squircle border border-border bg-surface p-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Thanks</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{state.ok}</p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-accent hover:text-accent-hover"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="squircle border border-border bg-surface p-8 space-y-5"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Apply for Studio access
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Studio is invite-only while the creation flow is being hardened. Tell
          us what you&rsquo;d build and we&rsquo;ll get you in.
        </p>
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" name="name" required className={`mt-2 ${inputClass}`} />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={`mt-2 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="intent" className={labelClass}>
          What do you want to build?
        </label>
        <textarea
          id="intent"
          name="intent"
          required
          rows={4}
          minLength={20}
          placeholder="The agent(s) you have in mind and what you'd use them for."
          className={`mt-2 ${inputClass}`}
        />
      </div>

      {state.error && (
        <p className="squircle-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full squircle-sm bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Sending…" : "Submit application"}
      </button>

      <p className="text-center text-xs text-muted">
        <Link href="/" className="hover:text-foreground">
          ← Back to flawk.com
        </Link>
      </p>
    </form>
  );
}
