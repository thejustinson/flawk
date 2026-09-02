"use client";

import { useState } from "react";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "What can I build with Flawk?",
    a: "Specialized autonomous agents for the tasks and workflows you keep wishing were handled for you. You define what each one does; Flawk gives you the place to create it and the way to run it.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. Creating an agent in Studio is a guided flow, not an infrastructure project. Code helps when you're wiring an agent deep into your own software, but it isn't required to create, publish, or deploy one.",
  },
  {
    q: "Can I use my agents outside Flawk?",
    a: "Yes — that's the point. Every agent you publish is reachable over REST and MCP, so you can drop it into your app, your backend, or an AI tool like Claude Code or Cursor without rebuilding anything.",
  },
  {
    q: "Can I create more than one agent?",
    a: "Yes. Most people end up with a small set of focused agents, each doing one job well, rather than a single agent that tries to do everything.",
  },
  {
    q: "Can I edit an agent after creating it?",
    a: "Yes. You keep editing and testing a draft as much as you want. Publishing turns the current state into a stable version, so anything already calling your agent keeps working while you iterate on the next one.",
  },
  {
    q: "Do I own the agents I create?",
    a: "Yes. The agents you create in Studio are yours — how they're configured, how they're versioned, and how they're used. Flawk is the infrastructure they run on, not the owner of what you build.",
  },
  {
    q: "Is Flawk just another AI chatbot builder?",
    a: "No. Flawk is built around agents you deploy and call from real systems, not a chat window you talk to inside one app. The output is something that runs, not a conversation.",
  },
  {
    q: "How long does it take to create an agent?",
    a: "The flow is built to get you from an idea to a working, published agent in one sitting. Configuring and testing is where you'll spend your time, not setup.",
  },
  {
    q: "Who is Flawk for?",
    a: "Developers, founders, and teams who want to put AI agents to work in real products and workflows — anyone who'd rather build the agent than build the platform underneath it.",
  },
  {
    q: "Why create an agent on Flawk instead of building one myself?",
    a: "You could build the infrastructure yourself. Flawk exists so you don't have to — creation, testing, publishing, versioning, and deployment over REST and MCP are already handled.",
  },
  {
    q: "When will Organizations be available?",
    a: "Organizations are part of Flawk's future direction. Today, Flawk focuses on helping you create, publish, and deploy individual agents. Organizations will come later as the platform evolves.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="squircle-md border border-border bg-surface overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-base font-medium text-foreground">
                {item.q}
              </span>
              <span
                className={`grid size-7 shrink-0 place-items-center squircle-sm border border-border text-muted transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1v12M1 7h12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            {isOpen && (
              <p className="px-6 pb-6 -mt-1 text-[15px] leading-relaxed text-muted">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
