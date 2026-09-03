import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireStudioAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";

export const metadata = { title: "Your agents — Flawk Studio" };

export default async function StudioHome() {
  const { user, hasAccess } = await requireStudioAuth();
  if (!hasAccess) return null;

  const rows = await db.query.agents.findMany({
    where: eq(agents.creatorId, user.id),
    orderBy: desc(agents.createdAt),
    with: {
      versions: { columns: { version: true, status: true, name: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your agents</h1>
          <p className="mt-1 text-sm text-muted">
            Every agent is defined here — nothing is hardcoded.
          </p>
        </div>
        <Link
          href="/studio/new"
          className="squircle-sm bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          New agent
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 squircle border border-dashed border-border bg-surface p-12 text-center">
          <h2 className="text-lg font-semibold tracking-tight">No agents yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Create your first agent: give it a purpose, a Can/Cannot list, inputs
            and outputs, a price, and a hard cost cap. Publish it when it&rsquo;s
            ready.
          </p>
          <Link
            href="/studio/new"
            className="mt-6 inline-block squircle-sm bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Create an agent
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3">
          {rows.map((agent) => {
            const published = agent.versions.filter(
              (v) => v.status === "published",
            ).length;
            const latest =
              agent.versions[agent.versions.length - 1]?.name ?? agent.slug;
            return (
              <li key={agent.id}>
                <Link
                  href={`/studio/${agent.slug}`}
                  className="flex items-center justify-between squircle-md border border-border bg-surface px-5 py-4 transition-colors hover:bg-surface-2"
                >
                  <div>
                    <div className="font-medium">{latest}</div>
                    <div className="text-xs text-muted">/{agent.slug}</div>
                  </div>
                  <div className="text-xs text-muted">
                    {agent.versions.length} version
                    {agent.versions.length === 1 ? "" : "s"}
                    {published > 0 && ` · ${published} published`}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
