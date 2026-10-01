"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, FileText, PencilLine, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { serializeCapsule, type CapsuleData } from "@/components/capsule/capsuleUtils";
import { CapsuleSection } from "@/components/capsule/CapsuleSection";
import type { CompressionLevel } from "@/lib/capsule-types";

type CapsuleResultProps = {
  capsule: CapsuleData;
  capsuleText: string;
  originalStats: { words: number; chars: number; approxTokens: number };
  finalStats: { words: number; chars: number; approxTokens: number };
  onCopy: () => void;
  onDownload: () => void;
  onCreateNew: () => void;
  onEdit: () => void;
  onTextChange: (value: string) => void;
  copyStatus: string;
  compressionLevel: CompressionLevel;
  onCompressionChange: (level: CompressionLevel) => void;
  onRegenerate: () => void;
};

export function CapsuleResult({
  capsule,
  capsuleText,
  originalStats,
  finalStats,
  onCopy,
  onDownload,
  onCreateNew,
  onEdit,
  onTextChange,
  copyStatus,
  compressionLevel,
  onCompressionChange,
  onRegenerate,
}: CapsuleResultProps) {
  const content = useMemo(() => capsuleText || serializeCapsule(capsule), [capsule, capsuleText]);
  const reduction = Math.round(((originalStats.chars - finalStats.chars) / Math.max(1, originalStats.chars)) * 100);
  const reductionLabel = reduction > 0 ? `${reduction}% smaller` : reduction < 0 ? `${Math.abs(reduction)}% larger` : "Same size";
  const compressionOptions: { value: CompressionLevel; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "balanced", label: "Balanced" },
    { value: "high", label: "High" },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key="capsule-result"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="glass-card rounded-[30px] border p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Generated capsule</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">CONTEXT CAPSULE</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="glass-interactive inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--button-primary-bg)] px-4 py-2.5 text-xs font-semibold text-[var(--button-primary-text)] transition hover:opacity-90"
            >
              {copyStatus === "Copied!" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copyStatus === "Copied!" ? "Copied" : "Copy Capsule"}
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="glass-interactive inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-xs font-medium text-[var(--text)] transition hover:border-[var(--ring)]"
            >
              <PencilLine className="h-3.5 w-3.5" />
              Edit Capsule
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="glass-interactive inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-xs font-medium text-[var(--text)] transition hover:border-[var(--ring)]"
            >
              <Download className="h-3.5 w-3.5" />
              Download Capsule
            </button>
            <button
              type="button"
              onClick={onCreateNew}
              className="glass-interactive inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-xs font-medium text-[var(--text)] transition hover:border-[var(--ring)]"
            >
              <FileText className="h-3.5 w-3.5" />
              Create New Capsule
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="glass-card mb-4 grid grid-cols-2 gap-3 rounded-2xl border p-4 sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Compression</p>
              <p className="mt-1 text-sm font-medium text-[var(--text)]">{capsule.compressionLabel}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Original</p>
              <p className="mt-1 text-sm font-medium text-[var(--text)]">{originalStats.chars} chars · {originalStats.words} words</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Capsule</p>
              <p className="mt-1 text-sm font-medium text-[var(--text)]">{finalStats.chars} chars · {finalStats.words} words</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Reduction</p>
              <p className="mt-1 text-sm font-medium text-[var(--text)]">{reductionLabel}</p>
            </div>
          </div>

          {copyStatus !== "Capsule ready" && copyStatus !== "Ready" ? (
            <p role="status" aria-live="polite" className="mb-3 text-xs text-[var(--muted-strong)]">{copyStatus}</p>
          ) : null}

          <div className="glass-card mb-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text)]">Compression for regenerate</p>
              <div className="glass-card mt-2 inline-flex flex-wrap gap-1 rounded-full border p-1" role="group" aria-label="Compression for regenerate">
                {compressionOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={compressionLevel === option.value}
                    onClick={() => onCompressionChange(option.value)}
                    className={`glass-interactive rounded-full px-3 py-1.5 text-xs font-medium transition ${compressionLevel === option.value ? "bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={onRegenerate}
              className="glass-interactive inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-xs font-medium text-[var(--text)] transition hover:border-[var(--ring)]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>

          <div className="glass-card mb-5 rounded-2xl border p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Capsule text</p>
            <pre className="mt-3 max-h-[32rem] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text)]">{content}</pre>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <CapsuleSection title="PROJECT / TASK" content={capsule.project} />
            <CapsuleSection title="ORIGINAL GOAL" content={capsule.goal} />
            <CapsuleSection title="IMPORTANT CONTEXT" content={capsule.importantContext} />
            <CapsuleSection title="USER REQUIREMENTS" content={capsule.requirements} />
            <CapsuleSection title="DECISIONS MADE" content={capsule.decisions} />
            <CapsuleSection title="CURRENT PROGRESS" content={capsule.progress} />
            <CapsuleSection title="PROBLEMS / ISSUES" content={capsule.problems} />
            <CapsuleSection title="FILES / CODE CONTEXT" content={capsule.files} />
            <CapsuleSection title="PREFERENCES" content={capsule.preferences} />
            <CapsuleSection title="NEXT STEPS" content={capsule.nextSteps} />
            <div className="lg:col-span-2">
              <CapsuleSection title="CONVERSATION SUMMARY" content={capsule.summary} />
            </div>
            <div className="lg:col-span-2">
              <CapsuleSection title="HANDOFF INSTRUCTIONS" content={capsule.handoffInstructions} />
            </div>
          </div>

          <div className="glass-card mt-5 rounded-[24px] border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Edit plain-text capsule</p>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">{capsuleText.length} chars</span>
            </div>
            <textarea
              value={capsuleText}
              onChange={(event) => onTextChange(event.target.value)}
              className="min-h-[220px] max-h-[32rem] w-full resize-y overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm leading-7 text-[var(--text)] outline-none transition focus:border-[var(--ring)]"
            />
          </div>

          <div className="glass-card mt-5 rounded-2xl border px-4 py-3">
            <p className="text-sm font-medium text-[var(--text)]">Continue in another AI</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Copy this capsule and paste it into your next AI conversation to continue your work.</p>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
