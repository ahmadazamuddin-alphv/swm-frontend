"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Report", primary: true },
];

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <header
      className={`relative z-20 mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between px-4 sm:px-6 ${
        compact ? "py-2.5" : "px-5 py-5 sm:px-8"
      }`}
    >
      <Link
        href="/"
        className="font-[family-name:var(--font-fraunces)] text-lg font-semibold tracking-tight text-selangor-red transition hover:text-selangor-red-deep sm:text-xl"
      >
        Selangor Waste Management
      </Link>
      <nav className="flex items-center gap-2 text-sm sm:gap-3">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          if (link.primary) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md bg-selangor-red px-3.5 py-2 font-medium text-primary-foreground transition hover:bg-selangor-red-deep"
              >
                {link.label}
              </Link>
            );
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2 py-2 transition ${
                active
                  ? "text-selangor-red"
                  : "text-selangor-ink/70 hover:text-selangor-red"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
