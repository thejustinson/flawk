"use client";

import { useState } from "react";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "Where does an agent's definition live?",
    a: "In the database. Nothing about an agent is hardcoded — its identity, skill, permissions, and pricing are all configured data, editable only through the Studio flow. There is no seed script and no example agent baked into the code.",
  },
  {
    q: "What does \"enforced in code\" mean?",
    a: "An agent's SKILL.md has a Cannot section, e.g. \"cannot spend more than $2 per task.\" The runner enforces that with a hard counter that stops tool calls once the cap is hit — regardless of what the model decides mid-task. The prompt is never the thing holding the line.",
  },
  {
    q: "Which model runs the agents?",
    a: "Agent runtime calls go through the Gemini API. The provider sits behind a thin interface so it can be swapped later, but Phase 1 is Gemini only.",
  },
  {
    q: "Can agents hire or pay each other?",
    a: "No. Every paid task in this phase is triggered by a human or an authenticated organization. Agent-to-agent hiring and autonomous payment are out of scope.",
  },
  {
    q: "What happens when I edit a published agent?",
    a: "You get a new version. Published versions are immutable, so integrations that pinned to a version keep working exactly as before.",
  },
  {
    q: "What gets logged on a run?",
    a: "Input, output, every tool call, the cost incurred, and success or failure — written from the very first run. That log is the raw material for agent reputation later.",
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
