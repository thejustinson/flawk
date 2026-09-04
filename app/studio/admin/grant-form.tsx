"use client";

import { useActionState } from "react";
import { grantAccess, type AdminActionState } from "@/lib/admin/actions";

const initial: AdminActionState = {};

export function GrantForm() {
  const [state, action, pending] = useActionState(grantAccess, initial);

  return (
    <div>
      <form action={action} className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="name@company.com"
          className="w-full squircle-sm border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 squircle-sm bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </form>
      {state.error && (
        <p className="mt-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.ok && <p className="mt-2 text-sm text-accent">{state.ok}</p>}
    </div>
  );
}
