"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const conversation = [
  "User: I want to build a dashboard for a project management workflow.",
  "AI: We can start by mapping the data model and the UI priorities.",
  "User: The team prefers a dark interface and we need clear collaboration status views.",
  "AI: Good. Let’s define the project scope, tasks, timeline, and blockers.",
  "User: We also need to track decision notes, pending tasks, and user preferences.",
  "AI: I’ll keep a structured summary to make handoff easier later.",
];

const capsuleData = {
  project: "ContextCapsule beta",
  goal: "Launch a premium AI workflow dashboard with project clarity and handoff continuity.",
  currentState: "Dashboard layout is drafted. Team is aligned on a dark, minimal UI and task-oriented structure.",
  decisions: [
    "Use a dark-first interface with clean cards and subtle gradients.",
    "Keep the handoff around goals, tasks, decisions, and outstanding questions.",
    "Prioritize readability and quick context resurfacing over narrative summaries.",
  ],
  pendingTasks: [
    "Finalize card hierarchy and status models.",
    "Review accessibility and spacing before polish pass.",
    "Prepare demo narrative for handoff across AI tools.",
  ],
  preferences: [
    "Minimal, premium SaaS aesthetics.",
    "Strong typography and clear hierarchy.",
    "No heavy neon or template-style clutter.",
  ],
  lastRequest: "Create a polished launch-ready landing page showcasing the product’s context-migration story.",
};

export function CompressionDemo() {
  const [phase, setPhase] = useState<"idle" | "analysing" | "extracting" | "building" | "done">("idle");

  useEffect(() => {
    if (phase === "idle") return;

    const timeouts = [
      window.setTimeout(() => setPhase("analysing"), 150),
      window.setTimeout(() => setPhase("extracting"), 900),
      window.setTimeout(() => setPhase("building"), 1650),
      window.setTimeout(() => setPhase("done"), 2400),
    ];

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [phase]);

  const statusText = {
    idle: "Ready to compress",
    analysing: "Analysing conversation...",
    extracting: "Extracting important context...",
    building: "Building capsule...",
    done: "Capsule ready",
  }[phase];

  return (
    <section className="scroll-reveal px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Interactive demo</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[var(--text)] sm:text-4xl">
            Compress a long conversation into clear context.
          </h2>
        </div>

        <div className="glass-card mt-10 grid gap-5 rounded-[32px] border p-4 lg:grid-cols-2 lg:p-6">
          <div className="glass-card rounded-[28px] border p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-medium text-[var(--text)]">Mock AI conversation</h3>
              <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                18,420 tokens
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {conversation.map((line, index) => (
                <div
                  key={line}
                  className="glass-card rounded-2xl border px-3 py-3 text-sm leading-6 text-[var(--muted-strong)]"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[28px] border p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-medium text-[var(--text)]">Context Capsule</h3>
              <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                2,840 tokens
              </span>
            </div>

            <div className="mt-5">
              <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                  <span>Demonstration values only</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPhase("analysing")}
                  className="glass-interactive rounded-full border border-[var(--border)] bg-[var(--button-primary-bg)] px-3 py-1.5 text-xs font-medium text-[var(--button-primary-text)] transition hover:border-[var(--ring)]"
                >
                  Compress Conversation
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--muted-strong)]"
                >
                  {statusText}
                </motion.div>
              </AnimatePresence>

              <div className="space-y-3 text-sm text-[var(--muted-strong)]">
                <div className="glass-card rounded-2xl border p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Project</p>
                  <p className="mt-2 font-medium text-[var(--text)]">{capsuleData.project}</p>
                </div>

                <div className="glass-card rounded-2xl border p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Goal</p>
                  <p className="mt-2 text-[var(--muted-strong)]">{capsuleData.goal}</p>
                </div>

                <div className="glass-card rounded-2xl border p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Current State</p>
                  <p className="mt-2 text-[var(--muted-strong)]">{capsuleData.currentState}</p>
                </div>

                <div className="glass-card rounded-2xl border p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Important Decisions</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--muted-strong)]">
                    {capsuleData.decisions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card rounded-2xl border p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Pending Tasks</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--muted-strong)]">
                    {capsuleData.pendingTasks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card rounded-2xl border p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">User Preferences</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--muted-strong)]">
                    {capsuleData.preferences.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card rounded-2xl border p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Last Request</p>
                  <p className="mt-2 text-[var(--muted-strong)]">{capsuleData.lastRequest}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
