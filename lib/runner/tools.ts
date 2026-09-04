import type { ToolSpec } from "@/lib/llm";

export type Tool = {
  id: string;
  /** Fixed USD cost charged against the agent's cap per successful call. */
  cost: number;
  /** Freeform phrases in an agent's "Can" list that map to this tool. */
  aliases: string[];
  spec: ToolSpec;
  run(args: Record<string, unknown>): Promise<string>;
};

/* -------------------------------- helpers -------------------------------- */

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Block obvious SSRF targets. Not bulletproof (no DNS-rebind defense). */
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".internal") ||
    h === "::1" ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  );
}

/* -------------------------------- tools --------------------------------- */

const fetchUrl: Tool = {
  id: "fetch_url",
  cost: 0.01,
  aliases: [
    "fetch url",
    "fetchurl",
    "fetch_url",
    "get url",
    "http get",
    "fetch webpage",
    "fetch page",
    "read url",
    "web fetch",
    "browse url",
    "fetch historical price data",
    "call the api",
    "fetch data",
  ],
  spec: {
    name: "fetch_url",
    description:
      "Fetch a public web page or API URL over HTTP(S) and return its text content (HTML is reduced to text). Max ~8000 characters.",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "Absolute http(s) URL" },
      },
      required: ["url"],
    },
  },
  async run(args) {
    const url = String(args.url ?? "");
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error("url must be an absolute http(s) URL");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("only http(s) URLs are allowed");
    }
    if (isBlockedHost(parsed.hostname)) {
      throw new Error("that host is not allowed");
    }

    const res = await fetch(parsed, {
      headers: { "user-agent": "FlawkAgent/0.1 (+https://flawk.dev)" },
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    const body = await res.text();
    const contentType = res.headers.get("content-type") ?? "";
    const text = /html|xml/.test(contentType) ? stripHtml(body) : body;
    const prefix = res.ok ? "" : `[HTTP ${res.status}] `;
    return prefix + text.slice(0, 8000);
  },
};

export const TOOLS: Tool[] = [fetchUrl];

/** Resolve the tools an agent version is granted from its freeform "Can" list. */
export function resolveTools(allowedTools: string[]): Tool[] {
  const wanted = allowedTools.map(norm);
  return TOOLS.filter((tool) => {
    const keys = [tool.id, ...tool.aliases].map(norm);
    return wanted.some((w) =>
      keys.some((k) => w.includes(k) || k.includes(w)),
    );
  });
}

export function toolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}
