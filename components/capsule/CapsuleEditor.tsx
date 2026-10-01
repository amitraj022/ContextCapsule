"use client";

import { useMemo, useState } from "react";
import type { CapsuleData } from "@/components/capsule/capsuleUtils";

type CapsuleEditorProps = {
  capsule: CapsuleData;
  onSave: (nextCapsule: CapsuleData) => void;
  onCancel: () => void;
};

const parseList = (value: string) =>
  value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

export function CapsuleEditor({ capsule, onSave, onCancel }: CapsuleEditorProps) {
  const initialDraft = useMemo(
    () => ({
      title: capsule.title,
      goal: capsule.goal,
      project: capsule.project,
      importantContext: capsule.importantContext.join("\n"),
      requirements: capsule.requirements.join("\n"),
      decisions: capsule.decisions.join("\n"),
      progress: capsule.progress.join("\n"),
      problems: capsule.problems.join("\n"),
      files: capsule.files.join("\n"),
      preferences: capsule.preferences.join("\n"),
      nextSteps: capsule.nextSteps.join("\n"),
      summary: capsule.summary,
      handoffInstructions: capsule.handoffInstructions,
    }),
    [capsule],
  );

  const [draft, setDraft] = useState(initialDraft);

  const handleFieldChange = (key: keyof typeof initialDraft, value: string) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = () => {
    const nextCapsule: CapsuleData = {
      ...capsule,
      title: draft.title.trim() || capsule.title,
      goal: draft.goal.trim() || capsule.goal,
      project: draft.project.trim() || capsule.project,
      importantContext: parseList(draft.importantContext),
      requirements: parseList(draft.requirements),
      decisions: parseList(draft.decisions),
      progress: parseList(draft.progress),
      problems: parseList(draft.problems),
      files: parseList(draft.files),
      preferences: parseList(draft.preferences),
      nextSteps: parseList(draft.nextSteps),
      summary: draft.summary.trim() || capsule.summary,
      handoffInstructions: draft.handoffInstructions.trim() || capsule.handoffInstructions,
    };

    onSave(nextCapsule);
  };

  const fieldGroups = [
    { key: "title", label: "Title" },
    { key: "goal", label: "Original Goal" },
    { key: "project", label: "Project / Task" },
    { key: "importantContext", label: "Important Context" },
    { key: "requirements", label: "User Requirements" },
    { key: "decisions", label: "Decisions Made" },
    { key: "progress", label: "Current Progress" },
    { key: "problems", label: "Problems / Issues" },
    { key: "files", label: "Files / Code Context" },
    { key: "preferences", label: "Preferences" },
    { key: "nextSteps", label: "Next Steps" },
    { key: "summary", label: "Conversation Summary" },
    { key: "handoffInstructions", label: "Handoff Instructions" },
  ] as const;

  return (
    <div className="glass-card rounded-[28px] border p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Edit Capsule</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text)]">Refine the generated context</h3>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="glass-interactive rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-xs font-medium text-[var(--text)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="glass-interactive rounded-full border border-[var(--border)] bg-[var(--button-primary-bg)] px-3 py-2 text-xs font-medium text-[var(--button-primary-text)]"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {fieldGroups.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">{field.label}</span>
            <textarea
              value={draft[field.key] as string}
              onChange={(event) => handleFieldChange(field.key, event.target.value)}
              className="min-h-[110px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-3 text-sm leading-7 text-[var(--text)] outline-none backdrop-blur-xl transition focus:border-[var(--ring)]"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
