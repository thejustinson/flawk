import Link from "next/link";
import { Faq } from "./components/faq";

/* ---------------------------------- Nav ---------------------------------- */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center squircle-sm bg-accent text-white font-bold">
            F
          </span>
          <span className="text-lg font-semibold tracking-tight">Flawk</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#products" className="transition-colors hover:text-foreground">
            Products
          </a>
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#principles" className="transition-colors hover:text-foreground">
            Principles
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </div>

        <Link
          href="/studio"
          className="squircle-sm bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Open Studio
        </Link>
      </nav>
    </header>
  );
}

/* --------------------------------- Hero --------------------------------- */

function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 squircle-pill border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-accent" />
            Phase 1 · Studio + Connect
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            Create, own, and deploy autonomous AI agents.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Flawk is infrastructure for building agents as configured data — not
            code. Define an agent in Studio, publish a version, and call it from
            anywhere over REST or MCP. Every limit is enforced in code. Every run
            is logged.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/studio"
              className="squircle-sm bg-accent px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Open Studio
            </Link>
            <a
              href="#how"
              className="squircle-sm border border-border bg-surface px-6 py-3.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
            >
              See how it works
            </a>
          </div>
        </div>

        <SkillCard />
      </div>
    </section>
  );
}

function SkillCard() {
  return (
    <div className="squircle border border-border bg-surface p-6 shadow-[0_24px_60px_-30px_rgba(22,33,27,0.35)]">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted">
          <span className="grid size-6 place-items-center squircle-sm bg-accent-soft text-accent text-xs font-bold">
            R
          </span>
          researchbot / SKILL.md
        </div>
        <span className="squircle-pill bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
          v0.1 · published
        </span>
      </div>

      <dl className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Purpose
          </dt>
          <dd className="mt-1 text-foreground">
            Summarize any URL into five bullet points.
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Can
          </dt>
          <dd className="mt-1.5 flex flex-wrap gap-1.5">
            {["fetch_url", "summarize"].map((t) => (
              <span
                key={t}
                className="squircle-sm bg-accent-soft px-2.5 py-1 font-mono text-xs text-accent"
              >
                {t}
              </span>
            ))}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Cannot
          </dt>
          <dd className="mt-1.5 flex items-center justify-between gap-3 squircle-sm border border-border bg-surface-2 px-3 py-2">
            <span className="font-mono text-xs text-foreground">
              spend &gt; $0.05 / task
            </span>
            <span className="squircle-pill bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              enforced in code
            </span>
          </dd>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Price
          </dt>
          <dd className="font-mono text-sm font-semibold text-foreground">
            $0.02 / task
          </dd>
        </div>
      </dl>
    </div>
  );
}

/* ------------------------------- Products ------------------------------- */

const PRODUCTS = [
  {
    name: "Flawk Studio",
    tagline: "Create & own agents",
    body: "Build an agent from a structured SKILL.md — purpose, Can/Cannot, inputs and outputs, price, and a hard cost cap. Publish immutable, versioned releases.",
    status: "Available now",
    live: true,
  },
  {
    name: "Flawk Connect",
    tagline: "Use agents anywhere",
    body: "One REST endpoint and an MCP server wrapping the same runner. Call your agents from Claude Code, Cursor, or your own backend with an API key.",
    status: "Available now",
    live: true,
  },
  {
    name: "Flawk Organizations",
    tagline: "Autonomous orgs that employ agents",
    body: "Treasury and governance for organizations that are run by agents rather than people. Not part of this phase — on the roadmap.",
    status: "Later",
    live: false,
  },
];

function Products() {
  return (
    <section id="products" className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
      <SectionHeading
        kicker="Three products"
        title="One platform for the whole agent lifecycle"
        sub="Create them, then put them to work. This phase ships the first two."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PRODUCTS.map((p) => (
          <div
            key={p.name}
            className="flex flex-col squircle border border-border bg-surface p-7"
          >
            <div className="flex items-center justify-between">
              <span
                className={`squircle-pill px-2.5 py-1 text-[11px] font-semibold ${
                  p.live
                    ? "bg-accent-soft text-accent"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {p.status}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">
              {p.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-accent">{p.tagline}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ How it works ------------------------------ */

const STEPS = [
  {
    n: "01",
    title: "Define",
    body: "Fill in the Studio form: identity, the Can and Cannot lists, inputs and outputs, a price per task, and a cost cap.",
  },
  {
    n: "02",
    title: "Publish",
    body: "A draft becomes a published, immutable version with its own ID. Edits later create a new version, never a mutation.",
  },
  {
    n: "03",
    title: "Connect",
    body: "Call POST /agents/:slug/run with an API key, or point an MCP client at the server. Same runner underneath.",
  },
  {
    n: "04",
    title: "Review",
    body: "Read every run back with its input, output, tool-call log, and the exact cost it incurred.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how"
      className="border-y border-border bg-surface-2/50 py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading
          kicker="How it works"
          title="From form fields to a callable agent"
          sub="No hardcoding anywhere. An agent is a row in the database, defined only through Studio."
        />

        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="squircle border border-border bg-surface p-7"
            >
              <span className="font-mono text-sm font-semibold text-accent">
                {s.n}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------ Principles ------------------------------ */

const PRINCIPLES = [
  {
    title: "Enforced in code",
    body: "A cost cap is a hard counter in the runner that stops tool calls at the limit — not a line in a system prompt the model is trusted to respect.",
  },
  {
    title: "Versioned by default",
    body: "Editing an agent creates a new version. Integrations that pinned to a version keep running on it, untouched.",
  },
  {
    title: "Every run logged",
    body: "Input, output, tool calls, cost, and outcome — captured from the first run. This is the data reputation is built on.",
  },
  {
    title: "No autonomous spend",
    body: "Every paid task is triggered by a human or an authenticated org. Agents don't decide to spend money, and they don't hire other agents.",
  },
];

function Principles() {
  return (
    <section
      id="principles"
      className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28"
    >
      <SectionHeading
        kicker="Design principles"
        title="Guardrails that don't depend on the model behaving"
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <div
            key={p.title}
            className="flex gap-4 squircle border border-border bg-surface p-7"
          >
            <span className="mt-1 grid size-8 shrink-0 place-items-center squircle-sm bg-accent-soft text-accent">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13 4.5 6.5 11 3 7.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                {p.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- FAQ --------------------------------- */

function FaqSection() {
  return (
    <section
      id="faq"
      className="border-t border-border bg-surface-2/50 py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-3xl px-6">
        <SectionHeading kicker="FAQ" title="Questions worth answering up front" />
        <div className="mt-12">
          <Faq />
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- CTA --------------------------------- */

function Cta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="squircle bg-accent px-8 py-16 text-center text-white md:px-16 md:py-20">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Build your first agent in Studio.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/80">
          Nothing here works until an agent exists — and the only way to make one
          is the Studio flow. Start there.
        </p>
        <Link
          href="/studio"
          className="mt-8 inline-block squircle-sm bg-white px-6 py-3.5 text-sm font-semibold text-accent transition-colors hover:bg-white/90"
        >
          Open Studio
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------- Footer -------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center squircle-sm bg-accent text-white font-bold">
              F
            </span>
            <span className="text-lg font-semibold tracking-tight">Flawk</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Infrastructure for creating, owning, and deploying autonomous AI
            agents.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <FooterCol
            title="Products"
            links={[
              ["Studio", "/studio"],
              ["Connect", "#products"],
              ["Organizations", "#products"],
            ]}
          />
          <FooterCol
            title="Platform"
            links={[
              ["How it works", "#how"],
              ["Principles", "#principles"],
              ["FAQ", "#faq"],
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              ["Docs", "/docs"],
              ["API reference", "/docs"],
            ]}
          />
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-6xl px-6 py-6 text-xs text-muted">
          © {new Date().getFullYear()} Flawk. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------- Shared bits ----------------------------- */

function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-2xl">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {kicker}
      </span>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{sub}</p>
      )}
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Products />
        <HowItWorks />
        <Principles />
        <FaqSection />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
