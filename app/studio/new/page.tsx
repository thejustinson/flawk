import Link from "next/link";
import { requireStudioAuth } from "@/lib/auth";
import { llm } from "@/lib/llm";
import { NewAgentClient } from "./new-agent-client";

export const metadata = { title: "New agent — Flawk Studio" };

export default async function NewAgentPage() {
  const { hasAccess } = await requireStudioAuth();
  if (!hasAccess) return null;

  return (
    <div className="max-w-2xl">
      <Link
        href="/studio"
        className="text-sm font-medium text-muted hover:text-foreground"
      >
        ← Your agents
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">New agent</h1>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Describe what you want and let Gemini draft it, or fill the form
        yourself. Either way it saves as a draft you publish when ready.
      </p>

      <NewAgentClient llmAvailable={llm.available} />
    </div>
  );
}
