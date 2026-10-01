"use client";

import { Sparkles, Trash2 } from "lucide-react";

type ConversationInputProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onUseSample: () => void;
};

export function ConversationInput({ value, onChange, onClear, onUseSample }: ConversationInputProps) {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const estimatedTokens = Math.max(1, Math.ceil(charCount / 4));

  return (
    <div className="glass-card rounded-[28px] border p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Sparkles className="h-4 w-4 text-[var(--muted-strong)]" />
          <span>Paste conversation</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onUseSample}
            className="glass-interactive rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1.5 text-xs font-medium text-[var(--text)] transition hover:border-[var(--ring)]"
          >
            Use sample
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!value.trim()}
            className="glass-interactive inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      <label htmlFor="conversation-input" className="sr-only">
        Paste your AI conversation
      </label>
      <textarea
        id="conversation-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste your AI conversation here..."
        className="min-h-[320px] w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-4 text-base leading-7 text-[var(--text)] outline-none backdrop-blur-xl transition focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]"
      />

      {!value.trim() ? (
        <div className="glass-card mt-4 rounded-2xl border border-dashed px-4 py-3 text-sm text-[var(--muted)]">
          Add a conversation, transcript, or working notes to create a local capsule.
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          Paste text copied from ChatGPT, Claude, Gemini, or another AI assistant.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.16em]">
          <span>{charCount} chars</span>
          <span>{wordCount} words</span>
          <span>{estimatedTokens} est. tokens</span>
        </div>
      </div>
    </div>
  );
}
