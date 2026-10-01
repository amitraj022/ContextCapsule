"use client";

import { motion } from "framer-motion";

const destinations = ["ChatGPT", "Claude", "Gemini", "Other"];

type DestinationActionsProps = {
  onSelect: (destination: string) => void;
};

export function DestinationActions({ onSelect }: DestinationActionsProps) {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-4 sm:p-5">
      <h3 className="text-xl font-medium text-[var(--text)]">Continue your work</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
        Copy your capsule and paste it into another AI assistant to continue from where you left off.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {destinations.map((destination) => (
          <motion.button
            key={destination}
            type="button"
            whileHover={{ y: -2 }}
            onClick={() => onSelect(destination)}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 text-left text-sm font-medium text-[var(--text)] transition hover:border-[var(--ring)]"
          >
            {destination}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
