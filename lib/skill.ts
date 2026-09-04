/** URL-safe slug from an agent name (or an explicit slug input). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export type SkillInput = {
  name: string;
  purpose: string;
  can: string[];
  cannot: string[];
  inputs: string;
  outputs: string;
  pricePerTask: number;
  costCapPerTask: number;
  allowedPayees: string[];
};

const money = (n: number) => `$${n.toFixed(2)}`;
const bullets = (items: string[]) =>
  items.length ? items.map((i) => `- ${i}`).join("\n") : "- (none specified)";

/**
 * Render the canonical SKILL.md from the structured fields. The prose is for
 * humans; the runner enforces against the structured columns, not this text.
 */
export function buildSkillMd(a: SkillInput): string {
  const sections = [
    `# ${a.name}`,
    `## Purpose\n${a.purpose || "(not specified)"}`,
    `## Can\n${bullets(a.can)}`,
    `## Cannot\n${bullets(a.cannot)}`,
    `## Inputs\n${a.inputs || "(not specified)"}`,
    `## Outputs\n${a.outputs || "(not specified)"}`,
    `## Pricing\n- Price per task: ${money(a.pricePerTask)}\n- Cost cap per task: ${money(
      a.costCapPerTask,
    )}`,
  ];
  if (a.allowedPayees.length) {
    sections.push(`## Allowed payees\n${bullets(a.allowedPayees)}`);
  }
  return sections.join("\n\n") + "\n";
}

/** Loose Solana base58 address check (32–44 chars, no 0/O/I/l). */
export function looksLikeSolanaAddress(value: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}
