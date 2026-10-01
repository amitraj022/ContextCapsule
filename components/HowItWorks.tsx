"use client";

import { motion } from "framer-motion";
import { ArrowRightLeft, FileText, Layers3 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "CONVERSATION",
    description: "Paste your AI conversation or transcript into a clean workflow.",
    icon: FileText,
  },
  {
    number: "02",
    title: "CONTEXT EXTRACTION",
    description: "Pull out the goals, decisions, tasks, and constraints that matter most.",
    icon: Layers3,
  },
  {
    number: "03",
    title: "CAPSULE",
    description: "Turn it into a structured, portable context package with key details preserved.",
    icon: FileText,
  },
  {
    number: "04",
    title: "CONTINUE",
    description: "Take the structured capsule to another AI and continue without re-explaining everything.",
    icon: ArrowRightLeft,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-reveal px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[var(--text)] sm:text-4xl">
            Turn long threads into usable context.
          </h2>
        </div>

        <div className="relative mt-12 grid gap-4 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="glass-card glass-interactive group relative overflow-hidden rounded-[26px] border p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">{step.number}</span>
                  <div className="glass-card flex h-10 w-10 items-center justify-center rounded-2xl border text-[var(--muted-strong)]">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="mt-5 text-lg font-medium tracking-[0.06em] text-[var(--text)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
