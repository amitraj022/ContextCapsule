"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

const destinations = ["ChatGPT", "Claude", "Gemini", "Other AI"];

export function ContinueAnywhere() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleDrop = (index: number) => {
    setActiveIndex(index);
    setNotification("Capsule ready to transfer");

    window.setTimeout(() => {
      setNotification(null);
      setActiveIndex(null);
    }, 1200);
  };

  return (
    <section id="about" className="scroll-reveal px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Continue anywhere</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[var(--text)] sm:text-4xl">
            Carry your context beyond one chat window.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center justify-center">
            <motion.div
              drag
              dragElastic={0.18}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              whileDrag={{ scale: 1.02, rotate: -2 }}
              className="glass-card glass-interactive flex h-52 w-full max-w-xs cursor-grab flex-col justify-between rounded-[30px] border p-5 active:cursor-grabbing"
            >
              <div className="flex items-center justify-between text-[var(--text)]">
                <Sparkles className="h-5 w-5 text-[var(--muted-strong)]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">capsule</span>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Context Capsule</p>
                <div className="glass-card mt-3 rounded-2xl border p-3 text-sm text-[var(--muted-strong)]">
                  Project: ContextCapsule beta
                  <br />
                  Goal: Launch the next dashboard iteration
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Ready for transfer</span>
                <span>87% complete</span>
              </div>
            </motion.div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {destinations.map((destination, index) => (
              <motion.button
                key={destination}
                type="button"
                whileHover={{ y: -4 }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex((current) => (current === index ? null : current))}
                onClick={() => handleDrop(index)}
                className={`glass-card glass-interactive group relative flex min-h-[170px] flex-col justify-between rounded-[28px] border p-5 text-left transition-all ${
                  activeIndex === index
                    ? "border-[var(--ring)] bg-[var(--panel)] shadow-[0_20px_45px_var(--shadow)]"
                    : "border-[var(--border)] bg-[var(--panel-soft)] hover:border-[var(--ring)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-[var(--text)]">{destination}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-sm text-[var(--muted)]">
                    {activeIndex === index ? <Check className="h-4 w-4" /> : "→"}
                  </span>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div className="space-y-2 text-sm text-[var(--muted)]">
                    <div className="h-2.5 w-16 rounded-full bg-[var(--border)]" />
                    <div className="h-2.5 w-12 rounded-full bg-[var(--border)]" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    {activeIndex === index ? "drop state" : "ready"}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {notification ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-6 flex justify-center"
          >
            <div className="rounded-full border border-[var(--ring)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--muted-strong)]">
              {notification}
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
