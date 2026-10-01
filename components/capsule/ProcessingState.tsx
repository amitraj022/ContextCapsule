"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const stageLabels = [
  "Reading conversation",
  "Identifying important context",
  "Organizing information",
  "Creating capsule",
];

type ProcessingStateProps = {
  activeStage: number;
};

export function ProcessingState({ activeStage }: ProcessingStateProps) {
  return (
    <div className="glass-card scroll-reveal rounded-[28px] border p-5 sm:p-7">
      <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-center">
        <div className="capsule-orbit mx-auto flex aspect-square w-full max-w-[220px] flex-col items-center justify-center rounded-full border border-[var(--ring)] bg-[radial-gradient(circle_at_50%_35%,var(--panel-strong),var(--panel-soft)_68%)] shadow-[inset_0_1px_0_var(--glass-highlight),0_20px_60px_var(--shadow)]">
          <div className="flow-particle mb-3 flex h-14 w-14 items-center justify-center rounded-[18px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[inset_0_1px_0_var(--glass-highlight)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">ContextCapsule</p>
          <p className="mt-1 text-sm font-medium text-[var(--text)]">Analyzing</p>
          <div className="mt-4 flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((item) => <span key={item} className="flow-particle h-1 w-4 rounded-full bg-[var(--muted-strong)]" style={{ animationDelay: `${item * 0.16}s` }} />)}
          </div>
        </div>

        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-xl font-medium text-[var(--text)]">Processing conversation</h3>
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Step {activeStage + 1}/{stageLabels.length}</span>
          </div>
          <div className="mb-5 h-px w-full overflow-hidden bg-[var(--border)]">
            <motion.div className="h-full bg-[var(--text)]" animate={{ width: `${((activeStage + 1) / (stageLabels.length + 1)) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
          <div className="space-y-2">
            {stageLabels.map((label, index) => {
              const isActive = index === activeStage;
              const isComplete = index < activeStage;
              return (
                <div key={label} className={`glass-card flex items-center gap-3 rounded-2xl border px-3 py-3 ${isActive ? "text-[var(--text)]" : isComplete ? "text-[var(--muted-strong)]" : "text-[var(--muted)]"}`}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel-soft)] text-[10px] font-medium">{isComplete ? "✓" : String(index + 1).padStart(2, "0")}</span>
                  <span className="text-sm">{label}</span>
                </div>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={stageLabels[activeStage]} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="mt-5 text-sm text-[var(--muted-strong)]">
              {stageLabels[activeStage]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
