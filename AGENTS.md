# AGENTS.md — Flawk (Phase 1: Landing Page + Studio + Connect)

This file orients Claude Code (or any coding agent) working on this repo. Read it fully before writing code.

## Current status (2026-09)

- **Landing page:** done (`app/page.tsx`, DM Sans + `#0A8754`, squircle UI).
- **Studio:** foundation only. In place — Drizzle schema (`agents` / `agent_versions` / `runs` /
  `api_keys`), hosted Supabase, email magic-link auth with founder allowlist (`lib/auth.ts`),
  `/login` + `/studio` shell (`app/studio/`). RLS enabled (no policies) on all tables.
- **Not built yet:** the `accounts` wrapper table, Privy wallets, `job_policies` + clamp trigger, and
  the actual agent create → draft → publish flow. The schema below is the target; code has not caught
  up to the Privy/accounts/job_policies additions.

## What Flawk is

Flawk is infrastructure for creating, owning, hiring, and deploying autonomous AI agents. The long-term
vision has three products:

1. **Flawk Studio** — create and own agents
2. **Flawk Organizations** — autonomous orgs (treasury, governance) that employ agents
3. **Flawk Connect** — use Flawk agents from anywhere via API and MCP

**This phase only builds Studio and Connect, plus a landing page.** Organizations (treasury, governance,
tokenization, agent-to-agent payments) is explicitly out of scope — do not build toward it, do not add
placeholder tables or routes for it. Keep the schema and code footprint minimal to what Phase 1 needs.

## The hard rule for this phase

**No agent may exist unless it was created through the Studio UI.** There is no seed script, no hardcoded
agent config, no "example agent" baked into code. If you find yourself hardcoding an agent's SKILL.md,
prompt, or pricing anywhere outside the database, stop — that's the Studio's job. Studio must be built and
working *before* any agent can be created, and every agent's definition (identity, skill, permissions,
pricing) must live in the database, editable only through the Studio flow.

This matters because the whole point of Flawk is that agents are configured data, not code. If we
hardcode the first agent to save time, we never actually build or test the thing that makes Flawk a
platform instead of a single-purpose bot.

## Core design principles (apply throughout)

- **Enforcement happens in code, never only in the prompt.** An agent's SKILL.md has a `Cannot` section
  (e.g. "cannot spend more than $2 per task"). That limit must be enforced by the runner — a hard counter
  that stops tool calls once the cap is hit — regardless of what the model decides mid-task. Never rely on
  the model to self-police a limit stated in its own system prompt.
- **Agents are versioned.** Editing an agent in Studio creates a new version; existing integrations that
  pinned to a version keep working. Never mutate a published version's SKILL.md in place.
- **Every run is logged.** Input, output, tool calls, cost incurred, success/failure. This is the data that
  eventually becomes reputation — build the logging from day one even though reputation UI comes later.
- **No autonomous payment.** Every paid task in this phase is triggered by a human or an authenticated org,
  not by another agent deciding to spend money. Agent-to-agent hiring is a Phase 2+ concept — don't build
  toward it yet.

## Tech stack

- **Frontend/backend:** Next.js (App Router), deployed on Coolify (Nixpacks build, standalone output mode
  for the Docker path if we end up needing a custom Dockerfile).
- **Auth + database:** Supabase (hosted, not self-managed), confirmed — both auth and Postgres. Every
  human account and every org account is a Supabase user/row. DB access via **Drizzle ORM**; migrations
  live in `/drizzle` and apply with `npm run db:migrate`.
- **Wallets: Privy, for every account and every agent.** Every user/org gets a Privy embedded wallet on
  signup; every agent gets a Privy server wallet on creation. Agent wallets carry a Privy policy matching
  that agent version's `cost_cap_per_task` (and any allowlisted contracts/recipients if relevant) —
  **enforce the cost cap as a Privy policy at the signing layer, not only as an app-level counter.** This
  means even a fully compromised/manipulated agent run cannot produce a valid signature for a transaction
  outside its policy, which is a stronger guarantee than app-level checks alone. Keep app-level checks too
  (fail fast, better error messages) but the policy is the real enforcement boundary.
- **Agent LLM:** Gemini API for all agent runtime calls (the agents' own reasoning/tool use), not Claude.
  Keep the LLM provider behind a thin interface so it's swappable later, but don't build multi-provider
  support now — just Gemini.
- **Deployment:** Coolify. Landing page, Studio, and the Connect API/runner can be separate Coolify
  resources on one box, or one Next.js app serving all three — decide based on whether the agent runner
  needs to run long tool-call loops outside a request/response cycle (if so, it should be its own service,
  not a Next.js API route).

## Data model (minimum for Phase 1)

```
accounts                    -- humans and orgs, backed by Supabase auth
  id
  supabase_user_id
  privy_wallet_id            -- embedded wallet, created on signup
  created_at

agents
  id
  slug              -- e.g. "researchbot"
  creator_id        -- references accounts.id
  privy_wallet_id    -- server wallet, created on agent creation (one per agent, shared across versions)
  created_at

agent_versions
  id
  agent_id
  version           -- e.g. "0.1"
  skill_md          -- full text: Purpose / Can / Cannot / Inputs / Outputs / Pricing
  price_per_task
  cost_cap_per_task -- enforced as a Privy policy on the agent's wallet, not just app-level
  status            -- draft / published / archived
  created_at

runs
  id
  agent_id
  version_id
  input
  output
  cost_incurred
  tool_calls        -- log of what the agent actually did
  success
  created_at

api_keys
  id
  account_id
  key_hash
  created_at
```

Add fields as needed, but don't add tables for treasury, governance, royalties, or tokenization — those
belong to Organizations, not this phase.

### Permission model: creator ceiling, employer context

Two tiers, not one. The creator sets the agent's global ceiling — the absolute maximum it will ever do,
for anyone. The employer (whoever is running a specific job) can only narrow within that ceiling, never
widen past it. This mirrors how OAuth scopes and IAM permission boundaries work: the broader grant sets
the outer limit, the narrower grant can restrict but never escalate.

```
job_policies                         -- employer-set, scoped to one hiring context
  id
  agent_id
  employer_account_id
  max_cost_per_task                  -- must be <= agent_versions.cost_cap_per_task
  allowed_topics                     -- optional, jsonb array, narrows what the agent should touch
  requires_human_approval_above      -- optional, employer can require approval even under the agent's own ceiling
  created_at
```

**The rule (enforce this at the database level, not just in application code):** a `job_policies` row can
never set `max_cost_per_task` higher than the parent agent version's `cost_cap_per_task`. If an employer
tries, clamp it down automatically rather than erroring — the employer's policy is only ever a subset of
the creator's, silently.

```sql
CREATE OR REPLACE FUNCTION clamp_job_policy_to_agent_ceiling()
RETURNS TRIGGER AS $$
DECLARE
  agent_ceiling NUMERIC;
BEGIN
  SELECT cost_cap_per_task INTO agent_ceiling
  FROM agent_versions
  WHERE agent_id = NEW.agent_id
    AND status = 'published'
  ORDER BY created_at DESC
  LIMIT 1;

  IF NEW.max_cost_per_task IS NULL OR NEW.max_cost_per_task > agent_ceiling THEN
    NEW.max_cost_per_task := agent_ceiling;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_policies_clamp
BEFORE INSERT OR UPDATE ON job_policies
FOR EACH ROW EXECUTE FUNCTION clamp_job_policy_to_agent_ceiling();
```

At run time, the effective policy for a given job is the **tighter** of the two on every field, not just
cost:

```
effective.max_cost_per_task = min(agent_versions.cost_cap_per_task, job_policies.max_cost_per_task)
effective.allowed_tools     = agent_versions.allowed_tools ∩ job_policies.allowed_topics (if set)
effective.prohibited_actions = agent_versions.prohibited_actions ∪ job_policies.prohibited_actions (if set)
```

The creator's ceiling is what gets encoded as the agent's Privy wallet policy (signing-layer enforcement).
The employer's `job_policies` row is checked at the application level before a run starts. The DB trigger
above is the backstop that guarantees the app-level check can never be handed a job policy that's already
wider than what the wallet itself would allow — so even a bug in the run-starting code can't let an
employer's job spend beyond the creator's real ceiling.

## Build order

1. **Landing page.** Explains Flawk, the three products, links to Studio. Static content, no auth needed.
2. **Studio — agent creation flow.** A form that produces a SKILL.md-structured agent version: name,
   purpose, Can/Cannot list, inputs/outputs, price, cost cap. Saves to `agents` + `agent_versions` as
   `draft`, then `publish` moves it to `published`. This is the first thing that needs to fully work —
   nothing downstream can be tested without it.
3. **Agent runner.** A service that: loads a published agent version by ID, runs the task via Gemini with
   whatever tools that agent's SKILL.md grants, enforces `cost_cap_per_task` in code, writes a `runs` row,
   returns the result. This is where the enforcement principle above gets tested for real.
4. **Connect — REST API.** `POST /agents/:slug/run`. Authenticated via `api_keys`. Wraps the runner.
5. **Connect — MCP server.** Wraps the same REST API as MCP tools (`search_agents`, `get_agent`,
   `run_agent`, `get_agent_status` at minimum). This is what makes an agent usable directly from Claude
   Code, Cursor, or another AI assistant without touching the Studio UI.
6. **Adversarial test pass.** Before calling any agent "done," run it against a few inputs designed to try
   to get it to exceed its `Cannot` list (e.g. injected instructions in fetched web content telling it to
   ignore its cost cap). Confirm the code-level enforcement holds. Log these as fixtures/tests, not just
   manual checks — we'll want to re-run them every time an agent's SKILL.md changes.

## Decisions made (2026-09)

- **Studio auth:** invite-only. Real Supabase Auth (email magic-link). `STUDIO_ALLOWLIST` env is the
  bootstrap admin list — those emails are always allowed and are the only ones who can reach
  `/studio/admin`. Everyone else is granted via the `studio_access` table from the admin dashboard.
  `/apply` is a public form that files an `access_requests` row for an admin to approve.
- **App structure:** one Next.js app — landing (`/`), Studio (`/studio`), and Connect share a codebase
  and deployment. Split the runner into its own service only if long tool-loops require it.
- **DB access:** hosted Supabase + Drizzle ORM.
- **Privy chain:** Solana. Embedded wallets for accounts, server wallets for agents; USDC for per-task
  payments.
- **Agent wallet policy:** enforces *both* the per-task spend cap and a contract/recipient allowlist
  (`allowed_payees` on `agent_versions`), applied as the Privy signing-layer policy.
- **Can/Cannot persistence:** stored as structured `allowed_tools` / `prohibited_actions` columns on
  `agent_versions` (what the runner enforces), in addition to the rendered prose in `skill_md`.
- **Privy sequencing:** schema carries nullable `privy_wallet_id` now; the create-draft flow ships
  without Privy, and wallet provisioning + policy attachment is a dedicated slice before publish.

## Open decisions to confirm before scaffolding (ask, don't assume)

- When exactly the agent's Privy server wallet is created within the Privy slice: at first publish (when
  `cost_cap_per_task` and `allowed_payees` are finalized so a policy can attach) vs. eagerly at first
  draft with a placeholder policy.
- Deployment target: AGENTS.md says Coolify; a Vercel deploy was set up experimentally. Pick one.



<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->