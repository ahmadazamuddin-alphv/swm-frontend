"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ArrowRightIcon } from "@/components/ui/Icons";

const links = [
  { href: "/dashboard", label: "Activity map" },
];

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 shrink-0">
      <div
        className={`pointer-events-auto mx-auto flex w-full items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5 ${compact ? "" : ""}`}
      >
        <Link
          href="/"
          aria-label="Selangor Waste Management home"
          className="group inline-flex items-center rounded-[18px] border border-[#ead9b8]/80 bg-[#fff8ea]/90 px-3 py-2 text-sm font-semibold text-obsidian shadow-[0_10px_28px_rgba(64,35,10,0.12)] backdrop-blur-md"
        >
          <Image
            src="/brand/siaga-selangor-wordmark.png"
            alt="Siaga Selangor"
            width={2172}
            height={724}
            priority
            className="h-12 w-auto max-w-[68vw] object-contain drop-shadow-[0_8px_14px_rgba(64,35,10,0.14)] sm:h-14"
          />
        </Link>

        {pathname !== "/dashboard" && (
          <nav aria-label="Primary navigation" className="flex items-center gap-2 rounded-[18px] border border-[#ead9b8]/80 bg-[#fff8ea]/90 p-1.5 shadow-[0_10px_28px_rgba(64,35,10,0.12)] backdrop-blur-md">
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
                      ? "bg-[#D2222B] font-medium text-white shadow-[0_4px_12px_rgba(210,34,43,0.24)]"
                      : "text-[#6e5c4b] hover:bg-[#ffedbd] hover:text-[#8f1822]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/report"
              aria-current={pathname.startsWith("/report") ? "page" : undefined}
              className="inline-flex items-center gap-2 rounded-[14px] bg-[#D2222B] px-4 py-2.5 text-sm font-medium text-white shadow-[0_6px_16px_rgba(210,34,43,0.25)] hover:-translate-y-0.5 hover:bg-[#a91824]"
            >
              <span className="max-[520px]:hidden">Report dumping</span>
              <span className="min-[521px]:hidden">Report</span>
              <ArrowRightIcon className="size-4" />
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
