"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const flowStages = [
  { label: "Project decisions", detail: "signal extracted" },
  { label: "Current state", detail: "work preserved" },
  { label: "Next steps", detail: "ready to continue" },
];

export function Hero() {
  return (
    <section className="scroll-reveal relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="glass-card mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--text)]" />
            Portable project memory
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="max-w-xl text-4xl font-semibold tracking-[-0.07em] text-[var(--text)] sm:text-5xl lg:text-[4.1rem]"
          >
            Your context.
            <span className="mt-2 block text-[var(--muted-strong)]">Anywhere.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg"
          >
            Preserve the decisions, progress, and next steps that let you continue work in another AI conversation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/create"
              className="glass-interactive inline-flex items-center justify-center gap-2 rounded-full border border-[var(--ring)] bg-[var(--button-primary-bg)] px-5 py-3 text-sm font-medium text-[var(--button-primary-text)] shadow-[0_12px_28px_var(--shadow)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Create Capsule
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="glass-interactive inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm font-medium text-[var(--text)] transition hover:border-[var(--ring)] hover:bg-[var(--panel-strong)]"
            >
              See How It Works
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="relative flex justify-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-10 -z-10 h-[70%] rounded-full bg-[radial-gradient(circle,var(--glass-highlight),transparent_70%)] opacity-40 blur-2xl"
          />
          <div className="glass-card liquid-float relative w-full max-w-[620px] rounded-[30px] p-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--text)] shadow-[0_0_12px_var(--glass-highlight)]" />
                Context pipeline
              </div>
              <span className="font-mono text-[10px] text-[var(--muted)]">01 / 03</span>
            </div>

            <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <div className="space-y-2">
                <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Conversation</p>
                {["We chose PostgreSQL", "The migration passes", "Next: add auth"].map((fragment, index) => (
                  <motion.div
                    key={fragment}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.12, duration: 0.45 }}
                    className="glass-card rounded-xl border px-3 py-2 text-xs text-[var(--muted-strong)]"
                  >
                    {fragment}
                  </motion.div>
                ))}
              </div>

              <div className="flow-particle hidden flex-col items-center gap-2 text-[var(--muted)] sm:flex" aria-hidden="true">
                <span className="h-px w-8 bg-[var(--ring)]" />
                <span className="text-lg">›</span>
                <span className="h-px w-8 bg-[var(--ring)]" />
              </div>

              <div className="glass-card glass-interactive capsule-orbit flex flex-col items-center justify-center rounded-[24px] border border-[var(--ring)] bg-[linear-gradient(145deg,var(--panel-strong),var(--panel-soft))] px-5 py-7 text-center shadow-[inset_0_1px_0_var(--glass-highlight),0_20px_50px_var(--shadow)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">ContextCapsule</p>
                <p className="mt-1 text-sm font-medium text-[var(--text)]">Portable context</p>
                <div className="mt-4 flex gap-1" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((item) => <span key={item} className="h-1 w-5 rounded-full bg-[var(--muted)] opacity-50" />)}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
              <span>Goal · Decisions · State · Next steps</span>
              <span>Ready to continue</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
