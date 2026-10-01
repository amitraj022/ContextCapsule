"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";
type ThemeContextValue = { theme: Theme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("contextcapsule-theme");
    } catch {
      stored = null;
    }
    const initial = stored === "dark" || stored === "light"
      ? stored
      : document.documentElement.dataset.theme === "light"
        ? "light"
        : "dark";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    document.documentElement.style.colorScheme = initial;
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem("contextcapsule-theme", next);
    } catch {
      // The active document theme still changes when storage is unavailable.
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      <GlassEffects />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-pressed={theme === "light"}
      className="theme-toggle glass-interactive"
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={reduceMotion ? false : { opacity: 0, rotate: -35, scale: 0.75 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, rotate: 35, scale: 0.75 }}
            transition={{ duration: 0.22 }}
          >
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span>{theme === "dark" ? "DARK" : "LIGHT"}</span>
    </button>
  );
}

function GlassEffects() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const enablePointerEffects = !coarsePointer && !reduceMotion;
    let cardFrame = 0;
    let spotlightFrame = 0;
    let activeCard: HTMLElement | null = null;

    const root = document.documentElement;
    let targetX = 50;
    let targetY = 12;
    let currentX = 50;
    let currentY = 12;

    const animateSpotlight = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      root.style.setProperty("--pointer-x", `${currentX.toFixed(2)}%`);
      root.style.setProperty("--pointer-y", `${currentY.toFixed(2)}%`);
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        spotlightFrame = requestAnimationFrame(animateSpotlight);
      } else {
        spotlightFrame = 0;
      }
    };

    const updateGlass = (event: PointerEvent) => {
      if (!enablePointerEffects) return;

      targetX = (event.clientX / window.innerWidth) * 100;
      targetY = (event.clientY / window.innerHeight) * 100;
      if (!spotlightFrame) spotlightFrame = requestAnimationFrame(animateSpotlight);

      cancelAnimationFrame(cardFrame);
      cardFrame = requestAnimationFrame(() => {
        const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(".glass-card, .glass-interactive") ?? null;
        if (activeCard && activeCard !== card) activeCard.classList.remove("is-pointer-active");
        activeCard = card;
        if (!card) return;
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty("--glass-x", `${Math.round(x * 100)}%`);
        card.style.setProperty("--glass-y", `${Math.round(y * 100)}%`);
        card.style.setProperty("--tilt-x", `${((x - 0.5) * 1.4).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${((0.5 - y) * 1.4).toFixed(2)}deg`);
        card.classList.add("is-pointer-active");
      });
    };

    const clearGlass = (event: PointerEvent) => {
      const from = (event.target as HTMLElement | null)?.closest<HTMLElement>(".glass-card, .glass-interactive") ?? null;
      const to = (event.relatedTarget as HTMLElement | null)?.closest<HTMLElement>(".glass-card, .glass-interactive") ?? null;
      if (from && from === to) return;
      if (activeCard === from || !to) {
        activeCard?.classList.remove("is-pointer-active");
        activeCard = null;
      }
    };

    if (enablePointerEffects) {
      document.addEventListener("pointermove", updateGlass, { passive: true });
      document.addEventListener("pointerout", clearGlass);
    }

    const canObserve = !reduceMotion && "IntersectionObserver" in window;
    const observer = canObserve ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0.12 }) : null;

    const registerReveal = (element: Element) => {
      if (!element.matches(".scroll-reveal") || element.hasAttribute("data-reveal-observed")) return;
      element.setAttribute("data-reveal-observed", "true");
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) {
        element.classList.add("is-visible");
        return;
      }
      if (observer) observer.observe(element);
      else element.classList.add("is-visible");
    };

    const revealInView = () => {
      document.querySelectorAll<HTMLElement>(".scroll-reveal:not(.is-visible)").forEach((element) => {
        const bounds = element.getBoundingClientRect();
        if (bounds.top >= window.innerHeight * 0.92 || bounds.bottom <= 0) return;
        element.classList.add("is-visible");
        observer?.unobserve(element);
      });
    };

    document.querySelectorAll(".scroll-reveal").forEach(registerReveal);
    document.addEventListener("scroll", revealInView, { passive: true });
    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        registerReveal(node);
        node.querySelectorAll(".scroll-reveal").forEach(registerReveal);
      }));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mutationObserver.disconnect();
      document.removeEventListener("scroll", revealInView);
      document.removeEventListener("pointermove", updateGlass);
      document.removeEventListener("pointerout", clearGlass);
      cancelAnimationFrame(cardFrame);
      cancelAnimationFrame(spotlightFrame);
    };
  }, [reduceMotion]);

  return null;
}