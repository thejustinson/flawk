# AGENTS.md — Flawk (Phase 1: Landing Page + Studio + Connect)

This file orients Claude Code (or any coding agent) working on this repo. Read it fully before writing code.

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
- **Database:** Postgres via Supabase (or a Coolify-provisioned Postgres instance if we're not using
  Supabase's hosted product — confirm which before scaffolding auth).
- **Agent LLM:** Gemini API for all agent runtime calls (the agents' own reasoning/tool use), not Claude.
  Keep the LLM provider behind a thin interface so it's swappable later, but don't build multi-provider
  support now — just Gemini.
- **Deployment:** Coolify. Landing page, Studio, and the Connect API/runner can be separate Coolify
  resources on one box, or one Next.js app serving all three — decide based on whether the agent runner
  needs to run long tool-call loops outside a request/response cycle (if so, it should be its own service,
  not a Next.js API route).

## Data model (minimum for Phase 1)

```
agents
  id
  slug              -- e.g. "researchbot"
  creator_id
  created_at

agent_versions
  id
  agent_id
  version           -- e.g. "0.1"
  skill_md          -- full text: Purpose / Can / Cannot / Inputs / Outputs / Pricing
  price_per_task
  cost_cap_per_task -- enforced hard limit, parsed out of skill_md or set separately
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
  org_or_user_id
  key_hash
  created_at
```

Add fields as needed, but don't add tables for treasury, governance, royalties, or tokenization — those
belong to Organizations, not this phase.

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

## Open decisions to confirm before scaffolding (ask, don't assume)

- Supabase hosted vs. self-managed Postgres on the same Coolify box.
- Auth for Studio itself (who's allowed to create agents in this phase — just the founder, or open signup).
- Whether landing page, Studio, and Connect are one Next.js app or separate deployable services.



<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->