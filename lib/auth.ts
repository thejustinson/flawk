import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** Emails allowed into Studio during Phase 1 (founder-only). */
export function studioAllowlist(): string[] {
  return (process.env.STUDIO_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowlisted(email: string | null | undefined): boolean {
  if (!email) return false;
  return studioAllowlist().includes(email.toLowerCase());
}

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
 * Returns the user and whether they have Studio access (allowlist).
 */
export async function requireStudioAuth(): Promise<{
  user: User;
  hasAccess: boolean;
}> {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/studio");
  return { user, hasAccess: isAllowlisted(user.email) };
}
