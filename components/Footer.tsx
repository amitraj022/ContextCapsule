import Link from "next/link";

const footerLinks = {
  main: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
  ],
  secondary: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "GitHub", href: "https://github.com" },
    { label: "Contact", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] px-4 pb-10 pt-12 transition-colors duration-500 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text)]">ContextCapsule</p>
            <p className="mt-3 max-w-xs text-sm leading-7 text-[var(--muted)]">Move your AI context anywhere.</p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-[var(--muted)]">
            {footerLinks.main.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-[var(--text)]">
                {item.label}
              </Link>
            ))}
            {footerLinks.secondary.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition hover:text-[var(--text)]"
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
