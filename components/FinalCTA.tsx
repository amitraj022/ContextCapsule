import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="glass-card scroll-reveal mx-auto max-w-6xl overflow-hidden rounded-[32px] border px-6 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Start now</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-[var(--text)] sm:text-4xl lg:text-5xl">
            Your conversation shouldn&apos;t be trapped in one AI.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
            Create a Context Capsule and carry the important context with you.
          </p>
          <Link
            href="/create"
            className="glass-interactive mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--ring)] bg-[var(--button-primary-bg)] px-6 py-3 text-sm font-medium text-[var(--button-primary-text)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            Create Capsule
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
