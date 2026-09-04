import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireStudioAuth } from "@/lib/auth";
import { getOrCreateAccount } from "@/lib/accounts";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { saveAgentEdit } from "@/lib/agents/actions";
import { nextVersion } from "@/lib/agents/versioning";
import { AgentForm } from "@/app/studio/_components/agent-form";

export const metadata = { title: "Edit agent — Flawk Studio" };

const trimZeros = (n: string) => Number(n).toString();

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user, hasAccess } = await requireStudioAuth();
  if (!hasAccess) return null;
  const account = await getOrCreateAccount(user);

  const agent = await db.query.agents.findFirst({
    where: eq(agents.slug, slug),
    with: { versions: { orderBy: (v, { asc }) => asc(v.createdAt) } },
  });
  if (!agent || agent.creatorId !== account.id) notFound();

  const latest = agent.versions[agent.versions.length - 1];
  if (!latest) notFound();

  const editingDraft = latest.status === "draft";
  const target = editingDraft ? latest.version : nextVersion(latest.version);

  return (
    <div className="max-w-2xl">
      <Link
        href={`/studio/${slug}`}
        className="text-sm font-medium text-muted hover:text-foreground"
      >
        ← {latest.name}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Edit agent</h1>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {editingDraft
          ? `Editing draft v${latest.version} in place.`
          : `v${latest.version} is published and immutable. Saving creates a new draft, v${target}.`}
      </p>

      <AgentForm
        action={saveAgentEdit}
        showSlug={false}
        hidden={{ agentId: agent.id }}
        submitLabel={editingDraft ? "Save draft" : `Save as v${target}`}
        defaults={{
          name: latest.name,
          purpose: latest.purpose,
          can: latest.allowedTools,
          cannot: latest.prohibitedActions,
          inputs: latest.inputs,
          outputs: latest.outputs,
          pricePerTask: trimZeros(latest.pricePerTask),
          costCapPerTask: trimZeros(latest.costCapPerTask),
          payees: latest.allowedPayees,
        }}
      />
    </div>
  );
}
