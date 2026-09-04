"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests, studioAccess } from "@/lib/db/schema";

export type ApplyState = { error?: string; ok?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public: submit an application for Studio access. No auth. */
export async function submitAccessRequest(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const intent = String(formData.get("intent") ?? "").trim();

  if (name.length < 2) return { error: "Add your name." };
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (intent.length < 20) {
    return { error: "Tell us a bit more about what you want to build (20+ characters)." };
  }

  const alreadyIn = await db.query.studioAccess.findFirst({
    where: eq(studioAccess.email, email),
    columns: { id: true },
  });
  if (alreadyIn) {
    return { ok: "You already have Studio access — just sign in." };
  }

  const existing = await db.query.accessRequests.findFirst({
    where: eq(accessRequests.email, email),
  });
  if (existing?.status === "pending") {
    return { ok: "You've already applied. We'll be in touch." };
  }
  if (existing?.status === "approved") {
    return { ok: "You're approved — sign in to Studio." };
  }

  await db
    .insert(accessRequests)
    .values({ name, email, intent: intent.slice(0, 2000) })
    .onConflictDoUpdate({
      target: accessRequests.email,
      set: {
        name,
        intent: intent.slice(0, 2000),
        status: "pending",
        reviewedAt: null,
        reviewedBy: null,
        createdAt: new Date(),
      },
    });

  return { ok: "Application received. We'll email you when you're in." };
}
