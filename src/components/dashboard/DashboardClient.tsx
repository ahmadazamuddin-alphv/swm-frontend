"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { CloseIcon, RotateCcwIcon } from "@/components/ui/Icons";
import { WASTE_CATEGORY_LABELS, getPartyById } from "@/lib/mock-data";
import { formatCoords } from "@/lib/geo";
import {
  clearDemoReport,
  getDemoReportServerSnapshot,
  getDemoReportSnapshot,
  parseDemoReport,
  subscribeToDemoReport,
} from "@/lib/demo-store";
import type { Report } from "@/lib/types";
import {
  ReportFilters,
  type ReportFilterState,
} from "@/components/reports/ReportFilters";
import { ReportList } from "@/components/reports/ReportList";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { ArrowRightIcon } from "@/components/ui/Icons";

const ActivityMap = dynamic(
  () => import("@/components/map/ActivityMap").then((module) => module.ActivityMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-[36px] border border-cloud bg-snow text-sm text-fog">
        Building 3D city view…
      </div>
    ),
  },
);

export function DashboardClient({ reports }: { reports: Report[] }) {
  const storedReport = useSyncExternalStore(
    subscribeToDemoReport,
    getDemoReportSnapshot,
    getDemoReportServerSnapshot,
  );
  const demoReport = useMemo(
    () => parseDemoReport(storedReport),
    [storedReport],
  );
  const allReports = useMemo(() => {
    if (!demoReport) return reports;
    return [
      demoReport,
      ...reports.filter((report) => report.id !== demoReport.id),
    ];
  }, [demoReport, reports]);

  const [filters, setFilters] = useState<ReportFilterState>({
    status: "all",
    category: "all",
    area: "all",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAllMobile, setShowAllMobile] = useState(false);

  const areas = useMemo(
    () => [...new Set(allReports.map((report) => report.area))].sort(),
    [allReports],
  );

  const filtered = useMemo(() => {
    return allReports.filter((report) => {
      if (filters.status !== "all" && report.status !== filters.status)
        return false;
      if (
        filters.category !== "all" &&
        report.wasteCategory !== filters.category
      )
        return false;
      if (filters.area !== "all" && report.area !== filters.area) return false;
      return true;
    });
  }, [allReports, filters]);

  const selected =
    allReports.find((report) => report.id === selectedId) ?? null;
  const party = selected
    ? (getPartyById(selected.responsiblePartyId) ?? null)
    : null;

  const openCount = allReports.filter(
    (report) =>
      report.status !== "solved" && report.status !== "false_report",
  ).length;
  const solvedCount = allReports.filter(
    (report) => report.status === "solved",
  ).length;
  const solvedPreview = allReports
    .filter((report) => report.status === "solved")
    .sort(
      (a, b) =>
        new Date(b.solvedAt ?? b.submittedAt).getTime() -
        new Date(a.solvedAt ?? a.submittedAt).getTime(),
    )
    .slice(0, 3);

  function resetDemo() {
    if (selectedId === demoReport?.id) setSelectedId(null);
    clearDemoReport();
  }

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col gap-4 px-5 pb-5 pt-4 sm:px-8 sm:pb-8 sm:pt-6 lg:overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-[-0.025em] text-obsidian sm:text-[32px]">
            Illegal dumping across Selangor
          </h1>
          <p className="mt-1.5 inline-flex items-center gap-2 text-xs text-fog">
            <span className="size-1.5 rounded-[3px] bg-ember" />
            Citizen activity · illustrative POC data
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <p className="flex items-baseline gap-1.5">
            <span className="tabular-nums text-2xl font-semibold text-obsidian">
              {openCount}
            </span>
            <span className="text-xs text-fog">active</span>
          </p>
          <p className="flex items-baseline gap-1.5">
            <span className="tabular-nums text-2xl font-semibold text-obsidian">
              {solvedCount}
            </span>
            <span className="text-xs text-fog">solved</span>
          </p>
          {demoReport && (
            <button
              type="button"
              onClick={resetDemo}
              className="inline-flex items-center gap-2 rounded-[14px] border border-cloud bg-snow px-3 py-2 text-xs font-medium text-iron hover:border-mist hover:text-obsidian"
            >
              <RotateCcwIcon className="size-4" />
              <span className="hidden sm:inline">Reset demo</span>
            </button>
          )}
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

      <div className="grid min-h-0 flex-1 grid-rows-[440px_auto] gap-4 lg:grid-cols-[minmax(0,1.72fr)_360px] lg:grid-rows-1">
        <div className="relative min-h-0">
          <ActivityMap
            reports={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {selected && (
            <article className="absolute inset-x-3 bottom-16 z-20 max-h-[48%] overflow-y-auto rounded-[28px] border border-cloud bg-snow p-3 shadow-[0_12px_28px_rgba(9,9,11,0.1)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[440px] sm:p-4">
              <div className="flex gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.imageUrl}
                  alt=""
                  className="h-[86px] w-[96px] shrink-0 rounded-[18px] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selected.status} />
                    {selected.id.startsWith("rpt-demo-") && (
                      <span className="rounded-xl border border-cloud px-2 py-0.5 text-[10px] text-fog">
                        Just reported
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      aria-label="Close report preview"
                      className="ml-auto grid size-8 place-items-center rounded-xl text-fog hover:bg-paper hover:text-obsidian"
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  </div>
                  <h2 className="mt-2 truncate text-sm font-semibold text-obsidian sm:text-base">
                    {WASTE_CATEGORY_LABELS[selected.wasteCategory]}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-fog">
                    {selected.taman ? `${selected.taman}, ` : ""}
                    {selected.area}
                  </p>
                  <p className="tabular-nums mt-1 truncate font-mono text-[10px] text-ash">
                    {formatCoords(
                      selected.latitude,
                      selected.longitude,
                      4,
                    )}
                  </p>
                </div>
              </div>

              {party && (
                <div className="mt-3 flex items-center justify-between gap-4 border-t border-cloud pt-3">
                  <p className="min-w-0 truncate text-xs text-steel">
                    {party.department}
                  </p>
                  <Link
                    href={`/report/${selected.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-obsidian hover:text-ember"
                  >
                    Full detail
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                </div>
              )}
            </article>
          )}
        </div>

        <aside className="flex flex-col overflow-hidden rounded-[36px] border border-cloud bg-snow lg:min-h-0">
          <div className="flex shrink-0 items-baseline justify-between gap-3 border-b border-cloud px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-obsidian">Reports</h2>
              <p className="mt-0.5 text-xs text-fog">
                Select a case to move the map
              </p>
            </div>
            <span className="tabular-nums text-xs text-fog">
              {filtered.length}
            </span>
          </div>

          <div className="px-3 lg:hidden">
            <ReportList
              reports={showAllMobile ? filtered : filtered.slice(0, 5)}
              selectedId={selectedId}
              onSelect={setSelectedId}
              compact
            />
            {filtered.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllMobile((current) => !current)}
                className="mb-3 w-full rounded-[14px] border border-cloud bg-paper px-4 py-3 text-xs font-medium text-iron hover:border-mist hover:text-obsidian"
              >
                {showAllMobile
                  ? "Show fewer reports"
                  : `Show all ${filtered.length} reports`}
              </button>
            )}
          </div>

          <div className="hidden px-3 lg:block lg:min-h-0 lg:flex-[1.2] lg:overflow-y-auto">
            <ReportList
              reports={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              compact
            />
          </div>

          <div className="hidden flex-col border-t border-cloud bg-paper/70 lg:flex lg:min-h-0 lg:flex-1">
            <div className="shrink-0 px-5 pb-2 pt-4">
              <h2 className="text-sm font-semibold text-obsidian">
                Recently solved
              </h2>
              <p className="mt-0.5 text-[11px] text-fog">
                Cleared cases, ready to locate
              </p>
            </div>
            <ul className="space-y-1 px-3 pb-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              {solvedPreview.map((report) => (
                <li key={report.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(report.id)}
                    className={`flex w-full items-center gap-2.5 rounded-[14px] px-2 py-2 text-left text-xs ${
                      selectedId === report.id
                        ? "bg-snow text-obsidian"
                        : "text-steel hover:bg-snow hover:text-obsidian"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={report.imageUrl}
                      alt=""
                      className="h-10 w-12 shrink-0 rounded-xl object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-obsidian">
                        {WASTE_CATEGORY_LABELS[report.wasteCategory]}
                      </span>
                      <span className="block truncate text-[11px] text-fog">
                        {report.area}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
