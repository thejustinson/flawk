"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next,
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="squircle border border-border bg-surface p-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>.
          Open it on this device to continue.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-accent hover:text-accent-hover"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="squircle border border-border bg-surface p-8"
    >
      <h1 className="text-xl font-semibold tracking-tight">Sign in to Studio</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Enter your email and we&rsquo;ll send you a sign-in link.
      </p>

      <label
        htmlFor="email"
        className="mt-6 block text-xs font-semibold uppercase tracking-wide text-muted"
      >
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="mt-2 w-full squircle-sm border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
      />

      {status === "error" && (
        <p className="mt-3 text-sm text-red-600">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full squircle-sm bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send sign-in link"}
      </button>

      <p className="mt-6 text-center text-xs text-muted">
        <Link href="/" className="hover:text-foreground">
          ← Back to flawk.com
        </Link>
      </p>
    </form>
  );
}
