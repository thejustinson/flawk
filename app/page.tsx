import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import ChatBotIcon from "@hugeicons/core-free-icons/ChatBotIcon";
import ConnectIcon from "@hugeicons/core-free-icons/ConnectIcon";
import UserGroupIcon from "@hugeicons/core-free-icons/UserGroupIcon";
import DashboardSquareEditIcon from "@hugeicons/core-free-icons/DashboardSquareEditIcon";
import { Faq } from "./components/faq";

/* ---------------------------------- Nav ---------------------------------- */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/flawk.png"
            alt="Flawk"
            width={28}
            height={28}
            className="size-7"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">Flawk</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#studio" className="transition-colors hover:text-foreground">
            Studio
          </a>
          <a href="#connect" className="transition-colors hover:text-foreground">
            Connect
          </a>
          <a
            href="#organizations"
            className="transition-colors hover:text-foreground"
          >
            Organizations
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
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_46%_at_50%_-4%,rgba(10,135,84,0.12),transparent)]"
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 squircle-pill border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
              <span className="size-1.5 rounded-full bg-accent" />
              Studio + Connect are live
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-[3.5rem]">
              Create, own, and deploy autonomous AI agents.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Flawk gives you the infrastructure to build agents in Studio and
              deploy them anywhere through REST and MCP.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/studio"
                className="squircle-sm bg-accent px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Open Studio
              </Link>
              <Link
                href="/agents"
                className="squircle-sm border border-border bg-surface px-6 py-3.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
              >
                Explore Agents
              </Link>
            </div>
          </div>

          <StudioPreview />
        </div>
      </div>
    </section>
  );
}

/* Product preview: create in Studio, publish, deploy out. Not an example agent. */
function StudioPreview() {
  return (
    <div className="squircle border border-border bg-surface p-3 shadow-[0_30px_70px_-32px_rgba(22,33,27,0.4)]">
      <div className="squircle-md bg-surface-2/70 p-5">
        {/* window bar */}
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="ml-2 text-xs font-medium text-muted">
            Flawk Studio
          </span>
        </div>

        {/* step rail */}
        <div className="mt-5 flex items-center gap-1.5 text-[11px] font-medium">
          {["Create", "Configure", "Test", "Publish"].map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1.5">
              <span
                className={`w-full rounded-full px-2 py-1 text-center ${
                  i === 3
                    ? "bg-accent text-white"
                    : "bg-surface text-muted border border-border"
                }`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* agent card */}
        <div className="mt-5 flex items-center justify-between squircle-md border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center squircle-sm bg-accent-soft">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 1.5 11 6l4.5 2L11 10l-2 4.5L7 10 2.5 8 7 6 9 1.5Z"
                  fill="currentColor"
                  className="text-accent"
                />
              </svg>
            </span>
            <div>
              <div className="text-sm font-semibold">Your agent</div>
              <div className="text-xs text-muted">Draft</div>
            </div>
          </div>
          <span className="squircle-sm bg-accent px-3 py-1.5 text-xs font-semibold text-white">
            Publish
          </span>
        </div>

        {/* deploy fan-out */}
        <div className="mt-5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Deploy
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="squircle-sm border border-border bg-surface px-2.5 py-1 text-xs font-medium">
              REST
            </span>
            <span className="squircle-sm border border-border bg-surface px-2.5 py-1 text-xs font-medium">
              MCP
            </span>
            <span className="h-px flex-1 bg-border" />
            <div className="flex gap-1.5">
              {["App", "Backend", "AI tools"].map((d) => (
                <span
                  key={d}
                  className="squircle-sm bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Shared bits ------------------------------ */

function SectionHeading({
  kicker,
  title,
  sub,
  badge,
  icon,
}: {
  kicker?: string;
  title: string;
  sub?: string;
  badge?: string;
  icon?: IconSvgElement;
}) {
  return (
    <div className="max-w-2xl">
      {icon && (
        <span className="mb-5 grid size-11 place-items-center squircle-md bg-accent-soft text-accent">
          <HugeiconsIcon icon={icon} size={22} strokeWidth={1.8} />
        </span>
      )}
      <div className="flex items-center gap-3">
        {kicker && (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {kicker}
          </span>
        )}
        {badge && (
          <span className="squircle-pill bg-foreground px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            {badge}
          </span>
        )}
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-lg leading-relaxed text-muted">{sub}</p>
      )}
    </div>
  );
}

function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mt-8 inline-block squircle-sm bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
    >
      {children}
    </Link>
  );
}

/* -------------------------------- Studio -------------------------------- */

const STUDIO_STEPS = [
  { n: "01", title: "Create", body: "Start a new agent and name what it does." },
  {
    n: "02",
    title: "Configure",
    body: "Give it inputs, outputs, limits, and a price.",
  },
  {
    n: "03",
    title: "Test",
    body: "Run it against real inputs before anyone else can.",
  },
  {
    n: "04",
    title: "Publish",
    body: "Turn it into a version people can actually call.",
  },
];

function StudioSection() {
  return (
    <section id="studio" className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
      <SectionHeading
        icon={DashboardSquareEditIcon}
        kicker="Studio"
        title="Build your agents."
        sub="Create, configure, test, and publish autonomous agents from one place."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {STUDIO_STEPS.map((s) => (
          <div
            key={s.n}
            className="squircle border border-border bg-surface p-7 transition-transform hover:-translate-y-0.5"
          >
            <span className="font-mono text-sm font-semibold text-accent">
              {s.n}
            </span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
      </div>

      <PrimaryLink href="/studio">Open Studio</PrimaryLink>
    </section>
  );
}

/* -------------------------------- Connect -------------------------------- */

function ConnectSection() {
  return (
    <section
      id="connect"
      className="border-y border-border bg-surface-2/50 py-20 md:py-28"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            icon={ConnectIcon}
            kicker="Connect"
            title="Your agents don't have to stay here."
            sub="Deploy your agents wherever you work through REST and MCP."
          />
          <PrimaryLink href="/connect">Explore Connect</PrimaryLink>
        </div>

        <DeployDiagram />
      </div>
    </section>
  );
}

function DeployDiagram() {
  const targets = ["Your app", "Your backend", "AI tools"];
  return (
    <div className="squircle border border-border bg-surface p-8">
      <div className="mx-auto flex max-w-xs flex-col items-center">
        <div className="flex items-center gap-3 squircle-md border border-border bg-surface-2/60 px-4 py-3">
          <span className="grid size-8 place-items-center squircle-sm border border-border bg-surface">
            <Image src="/flawk.png" alt="" width={18} height={18} className="size-4.5" />
          </span>
          <span className="text-sm font-semibold">Your Flawk agent</span>
        </div>

        <svg
          width="100%"
          height="56"
          viewBox="0 0 240 56"
          fill="none"
          className="text-border"
        >
          <path
            d="M120 0v14M120 14C120 30 40 26 40 52M120 14c0 22 0 22 0 38M120 14c0 16 80 12 80 38"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M120 0v14M120 14C120 30 40 26 40 52M120 14c0 22 0 22 0 38M120 14c0 16 80 12 80 38"
            stroke="var(--accent)"
            strokeWidth="1.5"
            className="flawk-flow"
          />
        </svg>

        <div className="grid w-full grid-cols-3 gap-2">
          {targets.map((t) => (
            <span
              key={t}
              className="squircle-sm bg-accent-soft px-2 py-2 text-center text-xs font-medium text-accent"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Build here. Use anywhere.
      </p>
    </div>
  );
}

/* ----------------------------- Organizations ----------------------------- */

function OrganizationsSection() {
  return (
    <section
      id="organizations"
      className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28"
    >
      <div className="squircle border border-border bg-[radial-gradient(ellipse_70%_100%_at_100%_0%,rgba(10,135,84,0.10),transparent)] bg-surface p-8 md:p-14">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionHeading
              icon={UserGroupIcon}
              kicker="Organizations"
              badge="Coming soon"
              title="Employ more than one agent. Build an organization."
              sub="The future of Flawk is a world where specialized agents can work together as coordinated autonomous teams."
            />
          </div>

          <OrgConstellation />
        </div>
      </div>
    </section>
  );
}

function OrgConstellation() {
  const nodes = [
    { x: 50, y: 18 },
    { x: 18, y: 44 },
    { x: 82, y: 42 },
    { x: 32, y: 80 },
    { x: 70, y: 82 },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-xs">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full text-border"
      >
        {nodes.map((n, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={n.x}
            y2={n.y}
            stroke="currentColor"
            strokeWidth="0.6"
          />
        ))}
      </svg>
      {nodes.map((n, i) => (
        <span
          key={i}
          className="flawk-pulse absolute grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center squircle-sm border border-border bg-surface text-muted"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <HugeiconsIcon icon={ChatBotIcon} size={18} strokeWidth={1.8} />
        </span>
      ))}
      <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center squircle-md border border-border bg-surface shadow-[0_10px_24px_-10px_rgba(22,33,27,0.35)] ring-4 ring-accent-soft">
        <Image src="/flawk.png" alt="Flawk" width={26} height={26} className="size-6.5" />
      </span>
    </div>
  );
}

/* ------------------------------- Why Flawk ------------------------------- */

const WHY = [
  {
    title: "Built to be deployed",
    body: "Create agents that move beyond a demo and into real workflows.",
  },
  {
    title: "Versioned by default",
    body: "Publish with confidence and always know what you're running.",
  },
  {
    title: "Built for visibility",
    body: "See what your agents are doing and how they're performing.",
  },
  {
    title: "Ready to connect",
    body: "Use your agents from your own software and AI tools.",
  },
];

function WhyFlawk() {
  return (
    <section id="why" className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
      <SectionHeading
        kicker="Why Flawk"
        title="Infrastructure for agents you actually want to run."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {WHY.map((p) => (
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

/* ------------------------------- Workflow ------------------------------- */

const FLOW = [
  { n: "01", title: "Create", body: "Build your agent in Studio." },
  { n: "02", title: "Configure", body: "Give it everything it needs to do its job." },
  { n: "03", title: "Publish", body: "Turn your agent into a usable version." },
  { n: "04", title: "Deploy", body: "Use it anywhere through Flawk Connect." },
];

function Workflow() {
  return (
    <section
      id="workflow"
      className="border-y border-border bg-surface-2/50 py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading
          kicker="The workflow"
          title="From idea to deployed agent."
          sub="There isn't much between you and an agent that's running."
        />

        <ol className="mt-12 grid gap-px overflow-hidden squircle border border-border bg-border md:grid-cols-4">
          {FLOW.map((s) => (
            <li key={s.n} className="bg-surface p-7">
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

/* --------------------------------- FAQ --------------------------------- */

function FaqSection() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-6 py-20 md:py-28">
      <SectionHeading kicker="FAQ" title="Before you build your first one" />
      <div className="mt-12">
        <Faq />
      </div>
    </section>
  );
}

/* ------------------------------- Final CTA ------------------------------- */

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-6">
      <div className="squircle bg-accent px-8 py-16 text-center text-white md:px-16 md:py-24">
        <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
          We&rsquo;re building toward a world of autonomous workers.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80">
          Today, create and deploy your agents. Tomorrow, they can become part of
          something much bigger.
        </p>
        <Link
          href="/studio"
          className="mt-9 inline-block squircle-sm bg-white px-6 py-3.5 text-sm font-semibold text-accent transition-colors hover:bg-white/90"
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
            <Image
              src="/flawk.png"
              alt="Flawk"
              width={28}
              height={28}
              className="size-7"
            />
            <span className="text-lg font-semibold tracking-tight">Flawk</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Infrastructure for creating, owning, and deploying autonomous AI
            agents.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <FooterCol
            title="Product"
            links={[
              ["Studio", "/studio"],
              ["Connect", "#connect"],
              ["Organizations", "#organizations"],
            ]}
          />
          <FooterCol
            title="Start"
            links={[
              ["Open Studio", "/studio"],
              ["Explore agents", "/agents"],
            ]}
          />
          <FooterCol title="Resources" links={[["Docs", "/docs"]]} />
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
            <Link href={href} className="transition-colors hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
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
        <StudioSection />
        <ConnectSection />
        <OrganizationsSection />
        <WhyFlawk />
        <Workflow />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
