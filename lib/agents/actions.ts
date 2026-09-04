"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireStudioAuth } from "@/lib/auth";
import { getOrCreateAccount } from "@/lib/accounts";
import { db } from "@/lib/db";
import { agents, agentVersions } from "@/lib/db/schema";
import { buildSkillMd, looksLikeSolanaAddress, slugify } from "@/lib/skill";
import { nextVersion } from "@/lib/agents/versioning";
import { llm, type AgentDraft } from "@/lib/llm";

export type AgentFormState = { error?: string };

export type DraftFromPromptState = { error?: string; draft?: AgentDraft };

/**
 * Turn a freeform description into a structured agent draft via the LLM.
 * Does NOT persist anything — the client uses the result to pre-fill the form,
 * and the human still saves it through createAgent.
 */
export async function draftAgentFromPrompt(
  _prev: DraftFromPromptState,
  formData: FormData,
): Promise<DraftFromPromptState> {
  const { hasAccess } = await requireStudioAuth();
  if (!hasAccess) return { error: "You don't have Studio access." };
  if (!llm.available) {
    return { error: "Describe mode needs a GEMINI_API_KEY in the environment." };
  }

  const description = String(formData.get("prompt") ?? "").trim();
  if (description.length < 10) {
    return { error: "Describe the agent in a sentence or two." };
  }

  try {
    return { draft: await llm.draftAgent(description) };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Draft generation failed.",
    };
  }
}

function lines(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((v) => String(v).trim())
    .filter(Boolean);
}

type ParsedAgentForm = {
  name: string;
  purpose: string;
  inputs: string;
  outputs: string;
  can: string[];
  cannot: string[];
  payees: string[];
  price: number;
  cap: number;
  slugInput: string;
};

function parseAgentForm(
  formData: FormData,
): { values: ParsedAgentForm } | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const purpose = String(formData.get("purpose") ?? "").trim();
  const inputs = String(formData.get("inputs") ?? "").trim();
  const outputs = String(formData.get("outputs") ?? "").trim();
  const can = lines(formData, "can");
  const cannot = lines(formData, "cannot");
  const payees = lines(formData, "payee");
  const slugInput = String(formData.get("slug") ?? "").trim();
  const price = Number(String(formData.get("pricePerTask") ?? "0").trim());
  const cap = Number(String(formData.get("costCapPerTask") ?? "0").trim());

  if (name.length < 2) {
    return { error: "Give the agent a name (at least 2 characters)." };
  }
  if (!purpose) {
    return { error: "Describe what the agent does in Purpose." };
  }
  if (can.length === 0) {
    return { error: "List at least one thing the agent can do." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Price per task must be a non-negative number." };
  }
  if (!Number.isFinite(cap) || cap < 0) {
    return { error: "Cost cap per task must be a non-negative number." };
  }
  const badPayee = payees.find((p) => !looksLikeSolanaAddress(p));
  if (badPayee) {
    return { error: `"${badPayee}" doesn't look like a Solana address.` };
  }

  return {
    values: {
      name,
      purpose,
      inputs,
      outputs,
      can,
      cannot,
      payees,
      price,
      cap,
      slugInput,
    },
  };
}

function versionRow(v: ParsedAgentForm) {
  return {
    name: v.name,
    skillMd: buildSkillMd({
      name: v.name,
      purpose: v.purpose,
      can: v.can,
      cannot: v.cannot,
      inputs: v.inputs,
      outputs: v.outputs,
      pricePerTask: v.price,
      costCapPerTask: v.cap,
      allowedPayees: v.payees,
    }),
    purpose: v.purpose,
    inputs: v.inputs,
    outputs: v.outputs,
    allowedTools: v.can,
    prohibitedActions: v.cannot,
    allowedPayees: v.payees,
    pricePerTask: v.price.toString(),
    costCapPerTask: v.cap.toString(),
  };
}

/** Create a new agent with a first draft version (0.1). */
export async function createAgent(
  _prev: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const { user, hasAccess } = await requireStudioAuth();
  if (!hasAccess) return { error: "You don't have Studio access." };
  const account = await getOrCreateAccount(user);

  const parsed = parseAgentForm(formData);
  if ("error" in parsed) return parsed;
  const v = parsed.values;

  const base = slugify(v.slugInput || v.name) || "agent";
  let slug = base;
  const clash = await db.query.agents.findFirst({
    where: eq(agents.slug, slug),
    columns: { id: true },
  });
  if (clash) slug = `${base}-${Math.random().toString(16).slice(2, 6)}`;

  const [agent] = await db
    .insert(agents)
    .values({ slug, creatorId: account.id })
    .returning();

  await db.insert(agentVersions).values({
    agentId: agent.id,
    version: "0.1",
    status: "draft",
    ...versionRow(v),
  });

  revalidatePath("/studio");
  redirect(`/studio/${slug}`);
}

/**
 * Save an edit. If the latest version is a draft, mutate it in place. If it's
 * published (or archived), create the next minor version as a new draft —
 * published versions are immutable.
 */
export async function saveAgentEdit(
  _prev: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const { user, hasAccess } = await requireStudioAuth();
  if (!hasAccess) return { error: "You don't have Studio access." };
  const account = await getOrCreateAccount(user);

  const agentId = String(formData.get("agentId") ?? "");
  const agent = await db.query.agents.findFirst({
    where: eq(agents.id, agentId),
    with: { versions: { orderBy: (row, { asc }) => asc(row.createdAt) } },
  });
  if (!agent || agent.creatorId !== account.id) {
    return { error: "Agent not found." };
  }

  const parsed = parseAgentForm(formData);
  if ("error" in parsed) return parsed;

  const latest = agent.versions[agent.versions.length - 1];
  const row = versionRow(parsed.values);

  if (latest && latest.status === "draft") {
    await db
      .update(agentVersions)
      .set(row)
      .where(eq(agentVersions.id, latest.id));
  } else {
    await db.insert(agentVersions).values({
      agentId: agent.id,
      version: nextVersion(latest?.version ?? "0.0"),
      status: "draft",
      ...row,
    });
  }

  revalidatePath(`/studio/${agent.slug}`);
  redirect(`/studio/${agent.slug}`);
}

async function loadOwnedVersion(versionId: string) {
  const { user, hasAccess } = await requireStudioAuth();
  if (!hasAccess) throw new Error("You don't have Studio access.");
  const account = await getOrCreateAccount(user);
  const version = await db.query.agentVersions.findFirst({
    where: eq(agentVersions.id, versionId),
    with: { agent: true },
  });
  if (!version || version.agent.creatorId !== account.id) {
    throw new Error("Version not found.");
  }
  return version;
}

/** draft -> published. Sets publishedAt. Published versions become immutable. */
export async function publishAgentVersion(formData: FormData): Promise<void> {
  const version = await loadOwnedVersion(String(formData.get("versionId") ?? ""));
  if (version.status !== "draft") {
    throw new Error("Only a draft can be published.");
  }
  await db
    .update(agentVersions)
    .set({ status: "published", publishedAt: new Date() })
    .where(eq(agentVersions.id, version.id));

  revalidatePath(`/studio/${version.agent.slug}`);
  revalidatePath("/studio");
}

/** published -> archived. Stops it being served; pinned callers are unaffected. */
export async function archiveAgentVersion(formData: FormData): Promise<void> {
  const version = await loadOwnedVersion(String(formData.get("versionId") ?? ""));
  if (version.status !== "published") {
    throw new Error("Only a published version can be archived.");
  }
  await db
    .update(agentVersions)
    .set({ status: "archived" })
    .where(eq(agentVersions.id, version.id));

  revalidatePath(`/studio/${version.agent.slug}`);
  revalidatePath("/studio");
}
