"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getOrCreateAccount } from "@/lib/accounts";
import { db } from "@/lib/db";
import { accessRequests, studioAccess } from "@/lib/db/schema";

export type AdminActionState = { error?: string; ok?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Add an email to the Studio allowlist. */
export async function grantAccess(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { user } = await requireAdmin();
  const admin = await getOrCreateAccount(user);

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

  await db
    .insert(studioAccess)
    .values({ email, grantedBy: admin.id })
    .onConflictDoNothing({ target: studioAccess.email });

  revalidatePath("/studio/admin");
  return { ok: `${email} can now access Studio.` };
}

/** Remove an email from the Studio allowlist. */
export async function revokeAccess(formData: FormData): Promise<void> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return;

  await db.delete(studioAccess).where(eq(studioAccess.email, email));
  revalidatePath("/studio/admin");
}

/** Approve or reject an access request. Approving also grants access. */
export async function reviewRequest(formData: FormData): Promise<void> {
  const { user } = await requireAdmin();
  const admin = await getOrCreateAccount(user);

  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!id || (decision !== "approve" && decision !== "reject")) return;

  const request = await db.query.accessRequests.findFirst({
    where: eq(accessRequests.id, id),
  });
  if (!request) return;

  await db
    .update(accessRequests)
    .set({
      status: decision === "approve" ? "approved" : "rejected",
      reviewedAt: new Date(),
      reviewedBy: admin.id,
    })
    .where(eq(accessRequests.id, id));

  if (decision === "approve") {
    await db
      .insert(studioAccess)
      .values({ email: request.email, grantedBy: admin.id })
      .onConflictDoNothing({ target: studioAccess.email });
  }

  revalidatePath("/studio/admin");
}
