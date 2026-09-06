"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightIcon } from "@/components/ui/Icons";

const links = [
  { href: "/dashboard", label: "Activity map" },
];

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-cloud bg-snow">
      <div
        className={`mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 sm:px-8 ${
          compact ? "h-16" : "h-[72px]"
        }`}
      >
        <Link
          href="/"
          aria-label="Selangor Waste Management home"
          className="group inline-flex items-center gap-3 rounded-xl text-sm font-semibold text-obsidian"
        >
          <span className="grid size-8 place-items-center rounded-xl bg-obsidian text-snow">
            <span className="size-2.5 rounded-[4px] bg-ember transition-transform group-hover:rotate-45" />
          </span>
          <span className="hidden sm:inline">Selangor Waste</span>
          <span className="sm:hidden">SWM</span>
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-2">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`hidden rounded-[14px] px-4 py-2.5 text-sm sm:inline-flex ${
                  active
                    ? "bg-paper font-medium text-obsidian"
                    : "text-steel hover:bg-paper hover:text-obsidian"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/report"
            aria-current={pathname.startsWith("/report") ? "page" : undefined}
            className="inline-flex items-center gap-2 rounded-[14px] border border-[#2c2e34] bg-obsidian px-4 py-2.5 text-sm font-medium text-snow shadow-[inset_0_0.5px_0_rgba(255,255,255,0.5),inset_0_9px_14px_-5px_rgba(117,123,133,0.4),0_4px_6px_rgba(0,0,0,0.14)] hover:-translate-y-0.5"
          >
            <span className="max-[520px]:hidden">Report dumping</span>
            <span className="min-[521px]:hidden">Report</span>
            <ArrowRightIcon className="size-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
