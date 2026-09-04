import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { studioAccess } from "@/lib/db/schema";

/**
 * Bootstrap admin emails from env. These always have Studio access and are the
 * only accounts that can reach /studio/admin. Everyone else is granted via the
 * `studio_access` table from the admin dashboard.
 */
export function studioAdmins(): string[] {
  return (process.env.STUDIO_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return studioAdmins().includes(email.toLowerCase());
}

/** Env admin OR a row in studio_access. Memoized per request. */
export const isAllowlisted = cache(
  async (email: string | null | undefined): Promise<boolean> => {
    if (!email) return false;
    const normalized = email.toLowerCase();
    if (studioAdmins().includes(normalized)) return true;
    const row = await db.query.studioAccess.findFirst({
      where: eq(studioAccess.email, normalized),
      columns: { id: true },
    });
    return Boolean(row);
  },
);

/** Current authenticated user, or null. Memoized per request. */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Gate for Studio pages. Redirects to /login when signed out.
 * Returns the user, whether they have Studio access, and whether they're an admin.
 */
export async function requireStudioAuth(): Promise<{
  user: User;
  hasAccess: boolean;
  admin: boolean;
}> {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/studio");
  return {
    user,
    hasAccess: await isAllowlisted(user.email),
    admin: isAdmin(user.email),
  };
}

/** Gate for /studio/admin. Redirects non-admins back to /studio. */
export async function requireAdmin(): Promise<{ user: User }> {
  const { user, admin } = await requireStudioAuth();
  if (!admin) redirect("/studio");
  return { user };
}
