import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, type Account } from "@/lib/db/schema";

/**
 * Get the Flawk account for a Supabase user, creating it on first sight.
 * Memoized per request.
 */
export const getOrCreateAccount = cache(async (user: User): Promise<Account> => {
  const existing = await db.query.accounts.findFirst({
    where: eq(accounts.supabaseUserId, user.id),
  });
  if (existing) return existing;

  const [created] = await db
    .insert(accounts)
    .values({ supabaseUserId: user.id })
    .onConflictDoNothing({ target: accounts.supabaseUserId })
    .returning();
  if (created) return created;

  // Lost an insert race — the row exists now.
  const row = await db.query.accounts.findFirst({
    where: eq(accounts.supabaseUserId, user.id),
  });
  if (!row) throw new Error("Failed to create account");
  return row;
});
