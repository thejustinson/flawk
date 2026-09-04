import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireStudioAuth } from "@/lib/auth";
import { getOrCreateAccount } from "@/lib/accounts";
import { db } from "@/lib/db";
import { agents, type VersionStatus } from "@/lib/db/schema";
import {
  archiveAgentVersion,
  publishAgentVersion,
} from "@/lib/agents/actions";
import { TestPanel } from "./test-panel";

const STATUS_STYLES: Record<VersionStatus, string> = {
  draft: "bg-surface-2 text-muted",
  published: "bg-accent-soft text-accent",
  archived: "bg-surface-2 text-muted line-through",
};

export default async function AgentDetailPage({
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
  const published = agent.versions.filter((v) => v.status === "published");
  const serving = published[published.length - 1];
  const capIsZero = serving && Number(serving.costCapPerTask) === 0;

  return (
    <div className="max-w-3xl">
      <Link
        href="/studio"
        className="text-sm font-medium text-muted hover:text-foreground"
      >
        ← Your agents
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {latest?.name ?? agent.slug}
          </h1>
          <p className="mt-1 text-sm text-muted">/{agent.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/studio/${agent.slug}/edit`}
            className="squircle-sm border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            Edit
          </Link>
          {latest?.status === "draft" && (
            <form action={publishAgentVersion}>
              <input type="hidden" name="versionId" value={latest.id} />
              <button
                type="submit"
                className="squircle-sm bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Publish v{latest.version}
              </button>
            </form>
          )}
        </div>
      </div>

      {!latest && (
        <p className="mt-8 text-sm text-muted">This agent has no versions.</p>
      )}

      {latest && (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <Stat label="Price per task" value={`$${latest.pricePerTask}`} />
            <Stat
              label="Cost cap per task"
              value={`$${latest.costCapPerTask}`}
            />
          </section>

          {capIsZero && (
            <p className="mt-4 squircle-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              The serving version has a $0 cost cap. Once the runner exists, this
              agent will be allowed to spend nothing — free tools only.
            </p>
          )}

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <ListBlock title="Can" items={latest.allowedTools} accent />
            <ListBlock title="Cannot" items={latest.prohibitedActions} />
          </section>

          {latest.allowedPayees.length > 0 && (
            <section className="mt-6">
              <ListBlock
                title="Allowed payees"
                items={latest.allowedPayees}
                mono
              />
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              SKILL.md
            </h2>
            <pre className="mt-2 overflow-x-auto squircle-md border border-border bg-surface p-5 text-[13px] leading-relaxed">
              {latest.skillMd}
            </pre>
          </section>

          {serving && <TestPanel agentId={agent.id} />}

          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Versions
            </h2>
            <ul className="mt-2 divide-y divide-border squircle-md border border-border bg-surface">
              {[...agent.versions].reverse().map((v) => (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium">v{v.version}</span>
                    <span
                      className={`squircle-pill px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[v.status]}`}
                    >
                      {v.status}
                    </span>
                    {serving?.id === v.id && (
                      <span className="text-xs font-medium text-accent">
                        serving
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {v.publishedAt && (
                      <span className="text-xs text-muted">
                        published{" "}
                        {v.publishedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {v.status === "draft" && (
                      <form action={publishAgentVersion}>
                        <input type="hidden" name="versionId" value={v.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-accent hover:text-accent-hover"
                        >
                          Publish
                        </button>
                      </form>
                    )}
                    {v.status === "published" && (
                      <form action={archiveAgentVersion}>
                        <input type="hidden" name="versionId" value={v.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-muted hover:text-foreground"
                        >
                          Archive
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="squircle-md border border-border bg-surface px-5 py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold">{value}</div>
    </div>
  );
}

function ListBlock({
  title,
  items,
  accent,
  mono,
}: {
  title: string;
  items: string[];
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="squircle-md border border-border bg-surface px-5 py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">None</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className={accent ? "text-accent" : "text-muted"}>·</span>
              <span className={mono ? "break-all font-mono text-xs" : ""}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
