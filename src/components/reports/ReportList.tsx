"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/Icons";
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
      <p className="px-2 py-8 text-sm text-fog">
        No reports match these filters.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-cloud">
      {reports.map((report) => {
        const party = getPartyById(report.responsiblePartyId);
        const active = selectedId === report.id;

        return (
          <li key={report.id} className="relative py-1">
            <button
              type="button"
              onClick={() => onSelect?.(report.id)}
              className={`flex w-full gap-3 rounded-[18px] pr-12 text-left ${
                compact ? "px-2 py-2.5" : "px-2 py-4"
              } ${
                active
                  ? "bg-paper"
                  : "hover:bg-paper/80"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.imageUrl}
                alt=""
                className={`shrink-0 rounded-[14px] object-cover ${
                  compact ? "h-12 w-14" : "h-16 w-20"
                }`}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-obsidian">
                      {WASTE_CATEGORY_LABELS[report.wasteCategory]}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-fog">
                      {report.taman ? `${report.taman}, ` : ""}
                      {report.area}
                    </span>
                  </span>
                  <StatusBadge status={report.status} />
                </span>
                <span className="tabular-nums mt-1 block truncate font-mono text-[10px] text-ash">
                  {formatCoords(report.latitude, report.longitude, 4)}
                </span>
                {!compact && (
                  <span className="mt-1 block truncate text-xs text-fog">
                    {party?.department ?? "Unassigned"} · AI{" "}
                    {Math.round(report.aiConfidence * 100)}%
                  </span>
                )}
              </span>
            </button>

            <Link
              href={`/report/${report.id}`}
              aria-label={`Open details for ${WASTE_CATEGORY_LABELS[report.wasteCategory]}`}
              className="absolute bottom-3 right-2 grid size-8 place-items-center rounded-xl text-fog hover:bg-snow hover:text-ember"
            >
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
