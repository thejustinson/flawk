import Link from "next/link";
import { requireAdmin, studioAdmins } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewRequest, revokeAccess } from "@/lib/admin/actions";
import type { AccessRequestStatus } from "@/lib/db/schema";
import { GrantForm } from "./grant-form";

export const metadata = { title: "Admin — Flawk Studio" };

const REQUEST_STYLES: Record<AccessRequestStatus, string> = {
  pending: "bg-accent-soft text-accent",
  approved: "bg-surface-2 text-muted",
  rejected: "bg-surface-2 text-muted line-through",
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default async function AdminPage() {
  await requireAdmin();

  const admins = studioAdmins();
  const granted = await db.query.studioAccess.findMany({
    orderBy: (r, { desc }) => desc(r.createdAt),
  });
  const requests = await db.query.accessRequests.findMany({
    orderBy: (r, { asc, desc }) => [asc(r.status), desc(r.createdAt)],
  });

  return (
    <div className="max-w-3xl">
      <Link
        href="/studio"
        className="text-sm font-medium text-muted hover:text-foreground"
      >
        ← Studio
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-muted">
        Manage who can reach Studio and review access requests.
      </p>

      {/* Allowlist */}
      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Allowlist
        </h2>
        <div className="mt-3">
          <GrantForm />
        </div>

        <ul className="mt-4 divide-y divide-border squircle-md border border-border bg-surface">
          {admins.map((email) => (
            <li
              key={email}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span>{email}</span>
              <span className="squircle-pill bg-foreground px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                admin
              </span>
            </li>
          ))}
          {granted.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span>
                {row.email}
                <span className="ml-2 text-xs text-muted">
                  added {fmtDate(row.createdAt)}
                </span>
              </span>
              <form action={revokeAccess}>
                <input type="hidden" name="email" value={row.email} />
                <button
                  type="submit"
                  className="text-xs font-medium text-muted hover:text-foreground"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
          {granted.length === 0 && (
            <li className="px-5 py-3 text-sm text-muted">
              No one granted yet — approve a request or add an email above.
            </li>
          )}
        </ul>
      </section>

      {/* Requests */}
      <section className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Access requests
        </h2>

        {requests.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No applications yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {requests.map((r) => (
              <li
                key={r.id}
                className="squircle-md border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted">{r.email}</div>
                  </div>
                  <span
                    className={`squircle-pill px-2.5 py-0.5 text-xs font-semibold ${REQUEST_STYLES[r.status]}`}
                  >
                    {r.status}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {r.intent}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                  <span>applied {fmtDate(r.createdAt)}</span>
                  {r.reviewedAt && <span>reviewed {fmtDate(r.reviewedAt)}</span>}
                  {r.status === "pending" && (
                    <div className="ml-auto flex gap-3">
                      <form action={reviewRequest}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="decision" value="reject" />
                        <button
                          type="submit"
                          className="font-medium text-muted hover:text-foreground"
                        >
                          Reject
                        </button>
                      </form>
                      <form action={reviewRequest}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="decision" value="approve" />
                        <button
                          type="submit"
                          className="font-semibold text-accent hover:text-accent-hover"
                        >
                          Approve
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
