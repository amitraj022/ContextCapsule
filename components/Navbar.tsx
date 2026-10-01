"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeProvider";

const navItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`glass-card sticky top-0 z-50 border-b transition-[box-shadow,background-color] duration-300 ${scrolled ? "nav-scrolled" : ""}`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2.5 text-base font-medium tracking-[-0.04em] text-[var(--text)]">
          <span className="glass-card flex h-8 w-8 items-center justify-center rounded-xl border text-[var(--accent)]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          ContextCapsule
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-[var(--muted)] transition-colors duration-200 hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/create"
            className="glass-interactive hidden rounded-full border border-[var(--ring)] bg-[var(--button-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--button-primary-text)] shadow-[0_12px_24px_var(--shadow)] transition-all duration-200 hover:-translate-y-0.5 sm:inline-flex"
          >
            Create Capsule
          </Link>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="glass-interactive inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] transition hover:border-[var(--ring)] hover:text-[var(--text)] md:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card border-t border-[var(--border)] bg-[var(--panel-soft)] md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/create"
                onClick={() => setMenuOpen(false)}
                className="glass-interactive mt-1 inline-flex rounded-full border border-[var(--ring)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text)]"
              >
                Create Capsule
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
