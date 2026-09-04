"use client";

import Link from "next/link";
import { WASTE_CATEGORY_LABELS, getPartyById } from "@/lib/mock-data";
import { formatCoords } from "@/lib/geo";
import type { Report } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ReportList({
  reports,
  selectedId,
  onSelect,
  compact = false,
}: {
  reports: Report[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  compact?: boolean;
}) {
  if (reports.length === 0) {
    return (
      <p className="py-8 text-sm text-selangor-ink/60">
        No reports match these filters.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-selangor-red/10">
      {reports.map((report) => {
        const party = getPartyById(report.responsiblePartyId);
        const active = selectedId === report.id;
        return (
          <li key={report.id}>
            <button
              type="button"
              onClick={() => onSelect?.(report.id)}
              className={`flex w-full gap-3 text-left transition ${
                compact ? "px-1 py-2.5" : "px-1 py-4"
              } ${active ? "bg-selangor-yellow-soft/50" : "hover:bg-white/70"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.imageUrl}
                alt=""
                className={`shrink-0 rounded object-cover ${
                  compact ? "h-12 w-14" : "h-16 w-20"
                }`}
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-[family-name:var(--font-fraunces)] text-sm text-selangor-ink">
                      {WASTE_CATEGORY_LABELS[report.wasteCategory]}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-selangor-ink/65">
                      {report.taman ? `${report.taman}, ` : ""}
                      {report.area}
                    </p>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
                <p className="truncate font-mono text-[10px] text-selangor-ink/45">
                  {formatCoords(report.latitude, report.longitude, 4)}
                </p>
                {!compact && (
                  <p className="truncate text-xs text-selangor-ink/50">
                    {party?.department ?? "Unassigned"} · AI{" "}
                    {Math.round(report.aiConfidence * 100)}%
                  </p>
                )}
                <Link
                  href={`/report/${report.id}`}
                  className="inline-block text-xs font-medium text-selangor-red hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Detail →
                </Link>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
