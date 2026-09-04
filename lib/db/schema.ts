import { relations, sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Phase 1 data model. Keep this minimal — no tables for treasury, governance,
 * royalties, or tokenization. Those belong to Organizations (a later phase).
 *
 * All tables enable RLS with no policies. The app reaches Postgres directly via
 * Drizzle (connecting as the table owner, which bypasses RLS), so this only
 * locks the auto-exposed Supabase REST API — deny-by-default for the anon key.
 */

export const versionStatus = pgEnum("version_status", [
  "draft",
  "published",
  "archived",
]);

/**
 * A Flawk account — a human (and later an org). Wraps the Supabase auth user and
 * holds the Privy embedded wallet. `agents.creator_id` and `api_keys.account_id`
 * point here, not at auth.users directly.
 */
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  supabaseUserId: uuid("supabase_user_id").notNull().unique(),
  // Privy embedded wallet id — null until the Privy slice provisions it.
  privyWalletId: text("privy_wallet_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

/** A named agent. Its identity/skill/pricing all live in agent_versions. */
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "restrict" }),
  // Privy server wallet id — one per agent, shared across versions.
  // Null until the Privy slice provisions it.
  privyWalletId: text("privy_wallet_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

/**
 * An immutable published cut of an agent (drafts are mutable until published).
 * Editing a published agent creates a new version — never mutate in place.
 */
export const agentVersions = pgTable(
  "agent_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    version: text("version").notNull(), // e.g. "0.1"
    name: text("name").notNull(),
    // Full SKILL.md text: Purpose / Can / Cannot / Inputs / Outputs / Pricing.
    // Rendered from the structured fields below — the prose is for humans; the
    // runner enforces against the structured columns.
    skillMd: text("skill_md").notNull(),
    purpose: text("purpose").notNull().default(""),
    inputs: text("inputs").notNull().default(""),
    outputs: text("outputs").notNull().default(""),
    // The "Can" list — tools/capabilities the agent is granted.
    allowedTools: jsonb("allowed_tools")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    // The "Cannot" list — actions the runner must refuse regardless of the model.
    prohibitedActions: jsonb("prohibited_actions")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    // Solana addresses / program ids this agent's wallet may pay. Enforced as
    // part of the Privy signing-layer policy alongside the spend cap.
    allowedPayees: jsonb("allowed_payees")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    pricePerTask: numeric("price_per_task", { precision: 12, scale: 4 })
      .notNull()
      .default("0"),
    // Enforced hard limit — the Privy wallet policy caps signing at this amount,
    // and the runner also counts spend and stops tool calls when it's hit.
    costCapPerTask: numeric("cost_cap_per_task", { precision: 12, scale: 4 })
      .notNull()
      .default("0"),
    status: versionStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [unique("agent_versions_agent_version_uq").on(t.agentId, t.version)],
).enableRLS();

/** Every run is logged from day one — this is what reputation is built on later. */
export const runs = pgTable("runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  versionId: uuid("version_id")
    .notNull()
    .references(() => agentVersions.id, { onDelete: "cascade" }),
  input: text("input"),
  output: text("output"),
  costIncurred: numeric("cost_incurred", { precision: 12, scale: 4 })
    .notNull()
    .default("0"),
  toolCalls: jsonb("tool_calls")
    .$type<unknown[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  success: boolean("success"),
  // "completed" | "cost_cap" | "max_iterations" | "error"
  stopReason: text("stop_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

/**
 * API keys for Connect. Only the hash is stored.
 * TODO(connect slice): rename `owner_id` -> `account_id` and FK it to accounts.id
 * (per AGENTS.md data model). Left as-is for now since api_keys isn't consumed
 * until Connect, and the rename needs an interactive drizzle-kit migration.
 */
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull(),
  name: text("name"),
  keyHash: text("key_hash").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}).enableRLS();

// NOTE: `job_policies` (employer-set permission narrowing + the clamp trigger)
// lands with the agent runner slice, where it's first consumed. Not added yet.

export const accessRequestStatus = pgEnum("access_request_status", [
  "pending",
  "approved",
  "rejected",
]);

/**
 * Studio access grants. Email-keyed so someone can be granted before they've
 * ever signed in. The `STUDIO_ALLOWLIST` env list is the bootstrap admin set and
 * is layered on top of this table — admins are always allowed and are the only
 * ones who can reach /studio/admin.
 */
export const studioAccess = pgTable("studio_access", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  grantedBy: uuid("granted_by"), // account id; null = env bootstrap
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

/** Applications for Studio access, reviewed from /studio/admin. */
export const accessRequests = pgTable("access_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  intent: text("intent").notNull(),
  status: accessRequestStatus("status").notNull().default("pending"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: uuid("reviewed_by"),
}).enableRLS();

export const accountsRelations = relations(accounts, ({ many }) => ({
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  creator: one(accounts, {
    fields: [agents.creatorId],
    references: [accounts.id],
  }),
  versions: many(agentVersions),
  runs: many(runs),
}));

export const agentVersionsRelations = relations(
  agentVersions,
  ({ one, many }) => ({
    agent: one(agents, {
      fields: [agentVersions.agentId],
      references: [agents.id],
    }),
    runs: many(runs),
  }),
);

export const runsRelations = relations(runs, ({ one }) => ({
  agent: one(agents, { fields: [runs.agentId], references: [agents.id] }),
  version: one(agentVersions, {
    fields: [runs.versionId],
    references: [agentVersions.id],
  }),
}));

export type Account = typeof accounts.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type AgentVersion = typeof agentVersions.$inferSelect;
export type Run = typeof runs.$inferSelect;
export type StudioAccess = typeof studioAccess.$inferSelect;
export type AccessRequest = typeof accessRequests.$inferSelect;
export type VersionStatus = (typeof versionStatus.enumValues)[number];
export type AccessRequestStatus =
  (typeof accessRequestStatus.enumValues)[number];
