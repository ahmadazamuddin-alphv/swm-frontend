"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { WASTE_CATEGORY_LABELS, getPartyById } from "@/lib/mock-data";
import { formatCoords } from "@/lib/geo";
import type { Report } from "@/lib/types";
import {
  ReportFilters,
  type ReportFilterState,
} from "@/components/reports/ReportFilters";
import { ReportList } from "@/components/reports/ReportList";
import { StatusBadge } from "@/components/reports/StatusBadge";

const ActivityMap = dynamic(
  () => import("@/components/map/ActivityMap").then((m) => m.ActivityMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center rounded-xl border border-selangor-red/10 bg-white/40 text-sm text-selangor-ink/60">
        Loading 3D map…
      </div>
    ),
  },
);

export function DashboardClient({ reports }: { reports: Report[] }) {
  const [filters, setFilters] = useState<ReportFilterState>({
    status: "all",
    category: "all",
    area: "all",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const areas = useMemo(
    () => [...new Set(reports.map((r) => r.area))].sort(),
    [reports],
  );

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.category !== "all" && r.wasteCategory !== filters.category)
        return false;
      if (filters.area !== "all" && r.area !== filters.area) return false;
      return true;
    });
  }, [reports, filters]);

  const selected = reports.find((r) => r.id === selectedId) ?? null;
  const party = selected
    ? (getPartyById(selected.responsiblePartyId) ?? null)
    : null;

  const openCount = reports.filter(
    (r) => r.status !== "solved" && r.status !== "false_report",
  ).length;
  const solvedCount = reports.filter((r) => r.status === "solved").length;
  const solvedPreview = reports
    .filter((r) => r.status === "solved")
    .sort(
      (a, b) =>
        new Date(b.solvedAt ?? b.submittedAt).getTime() -
        new Date(a.solvedAt ?? a.submittedAt).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-2.5 overflow-hidden px-4 pb-3 sm:px-6">
      {/* Compact top bar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h1 className="truncate font-[family-name:var(--font-fraunces)] text-xl text-selangor-ink sm:text-2xl">
            Illegal dumping · Selangor
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <p>
            <span className="text-selangor-ink/50">Open </span>
            <span className="font-[family-name:var(--font-fraunces)] text-lg text-selangor-red">
              {openCount}
            </span>
          </p>
          <p>
            <span className="text-selangor-ink/50">Solved </span>
            <span className="font-[family-name:var(--font-fraunces)] text-lg text-emerald-800">
              {solvedCount}
            </span>
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <ReportFilters
          value={filters}
          areas={areas}
          onChange={setFilters}
          compact
        />
      </div>

      {/* Fills remaining viewport — only inner panels scroll */}
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(180px,38%)] gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.85fr)] lg:grid-rows-1">
        <div className="relative min-h-0 overflow-hidden">
          <ActivityMap
            reports={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {/* Selection card overlays map so layout height never grows */}
          {selected && (
            <div className="absolute inset-x-2 bottom-2 z-10 max-h-[48%] overflow-y-auto rounded-lg border border-selangor-yellow/60 bg-[rgba(255,248,242,0.94)] p-2.5 shadow-[0_12px_40px_rgba(74,44,44,0.18)] backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:max-h-[40%] sm:p-3">
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.imageUrl}
                  alt=""
                  className="h-14 w-16 shrink-0 rounded object-cover sm:h-20 sm:w-24"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={selected.status} />
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="ml-auto text-xs text-selangor-ink/50 hover:text-selangor-red"
                    >
                      Close
                    </button>
                  </div>
                  <p className="mt-1 truncate font-[family-name:var(--font-fraunces)] text-sm text-selangor-ink sm:text-base">
                    {WASTE_CATEGORY_LABELS[selected.wasteCategory]}
                  </p>
                  <p className="truncate text-xs text-selangor-ink/65">
                    {selected.taman ? `${selected.taman}, ` : ""}
                    {selected.area} ·{" "}
                    <span className="font-mono">
                      {formatCoords(selected.latitude, selected.longitude, 4)}
                    </span>
                  </p>
                  {party && (
                    <p className="mt-1 truncate text-xs text-selangor-ink/70">
                      {party.department} · {party.contactPerson} ·{" "}
                      <a
                        href={`tel:${party.phone}`}
                        className="text-selangor-red hover:underline"
                      >
                        {party.phone}
                      </a>
                    </p>
                  )}
                  <Link
                    href={`/report/${selected.id}`}
                    className="mt-1 inline-block text-xs font-medium text-selangor-red hover:underline"
                  >
                    Full detail →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-selangor-red/10 bg-white/55">
          <div className="flex shrink-0 items-baseline justify-between gap-3 border-b border-selangor-red/10 px-3 py-2">
            <h2 className="font-[family-name:var(--font-fraunces)] text-base text-selangor-ink">
              Reports
            </h2>
            <p className="text-xs text-selangor-ink/55">{filtered.length}</p>
          </div>
          <div className="min-h-0 flex-[1.15] overflow-y-auto px-2">
            <ReportList
              reports={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              compact
            />
          </div>
          <div className="flex min-h-0 flex-[0.9] flex-col border-t border-selangor-red/10 bg-selangor-yellow-soft/25">
            <div className="shrink-0 px-3 pt-3 pb-1.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-selangor-red/75">
                Recently solved
              </p>
              <p className="mt-0.5 text-[11px] text-selangor-ink/55">
                Cleared cases — tap to locate on map
              </p>
            </div>
            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
              {solvedPreview.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left text-xs transition ${
                      selectedId === r.id
                        ? "bg-white/80 text-selangor-red"
                        : "text-selangor-ink/75 hover:bg-white/60 hover:text-selangor-red"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.imageUrl}
                      alt=""
                      className="h-11 w-14 shrink-0 rounded object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-selangor-ink">
                        {WASTE_CATEGORY_LABELS[r.wasteCategory]}
                      </span>
                      <span className="block truncate text-[11px] text-selangor-ink/55">
                        {r.area}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
