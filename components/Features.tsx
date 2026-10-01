import type { CSSProperties } from "react";
import { ArrowUpRight, BrainCircuit, FileStack, Layers3, ShieldCheck, Sparkles, Wand2 } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "Context Compression",
    description: "Reduce noisy conversation threads into the essential facts that matter for continuity.",
  },
  {
    icon: Layers3,
    title: "Structured Extraction",
    description: "Organize goals, priorities, decisions, tasks, and constraints into a reusable format.",
  },
  {
    icon: FileStack,
    title: "Shareable Capsules",
    description: "Package context in a compact, shareable structure that can move between tools.",
  },
  {
    icon: Wand2,
    title: "Conversation Continuity",
    description: "Resume work without re-explaining project context or earlier corrections.",
  },
  {
    icon: Sparkles,
    title: "AI Destination Support",
    description: "Prepare the capsule for different AI tools with the right context lens for each flow.",
  },
  {
    icon: ArrowUpRight,
    title: "Exportable Capsules",
    description: "Export the structure clearly so it can be copied, shared, or used in future workflows.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-focused Design",
    description: "Keep the system centered on user control, local-first thinking, and thoughtful handling.",
  },
  {
    icon: Sparkles,
    title: "Capsule Versioning",
    description: "Track evolution over time so context can update as work continues.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-reveal px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[var(--text)] sm:text-4xl">
            Built for continuity, clarity, and handoff.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
                className="glass-card glass-interactive group scroll-reveal rounded-[26px] border p-5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="glass-card flex h-11 w-11 items-center justify-center rounded-2xl border text-[var(--muted-strong)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-[var(--text)]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
