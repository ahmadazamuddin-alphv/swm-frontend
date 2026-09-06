"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowRightIcon,
  CloseIcon,
  RotateCcwIcon,
} from "@/components/ui/Icons";
import { WASTE_CATEGORY_LABELS, getPartyById } from "@/lib/mock-data";
import {
  MOCK_POTHOLES,
  POTHOLE_SEVERITY_LABELS,
} from "@/lib/pothole-data";
import {
  buildPotholeStreetAiInsight,
  isPotholeSolved,
  streetRiskLabel,
} from "@/lib/pothole-ai";
import { formatCoords } from "@/lib/geo";
import {
  clearDemoReport,
  getDemoReportServerSnapshot,
  getDemoReportSnapshot,
  parseDemoReport,
  subscribeToDemoReport,
} from "@/lib/demo-store";
import type { PotholeCase, Report } from "@/lib/types";
import {
  ReportFilters,
  type ReportFilterState,
} from "@/components/reports/ReportFilters";
import { ReportList } from "@/components/reports/ReportList";
import { StatusBadge } from "@/components/reports/StatusBadge";
import type { MapSelectableCase } from "@/components/map/ActivityMap";

const ActivityMap = dynamic(
  () =>
    import("@/components/map/ActivityMap").then((module) => module.ActivityMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-[36px] border border-cloud bg-snow text-sm text-fog">
        Building 3D city view…
      </div>
    ),
  },
);

type DashboardMode = "dumping" | "pothole";

function reportToMapCase(report: Report): MapSelectableCase {
  return {
    id: report.id,
    latitude: report.latitude,
    longitude: report.longitude,
    status: report.status,
    title: WASTE_CATEGORY_LABELS[report.wasteCategory],
    area: report.area,
    subtitle: report.taman,
  };
}

function potholeToMapCase(pothole: PotholeCase): MapSelectableCase {
  return {
    id: pothole.id,
    latitude: pothole.latitude,
    longitude: pothole.longitude,
    status: pothole.status,
    colorKey: pothole.severity,
    title: pothole.title,
    area: pothole.area,
    subtitle: pothole.roadName,
  };
}

function SeverityBadge({ severity }: { severity: PotholeCase["severity"] }) {
  const styles = {
    low: "border border-mist bg-snow text-graphite",
    medium: "bg-amber-500 text-snow",
    high: "bg-orange-600 text-snow",
    critical: "bg-red-600 text-snow",
  } as const;

  return (
    <span
      className={`rounded-xl px-2 py-0.5 text-[10px] font-medium ${styles[severity]}`}
    >
      {POTHOLE_SEVERITY_LABELS[severity]}
    </span>
  );
}

function SolvedLabel({ solved }: { solved: boolean }) {
  return (
    <span
      className={`rounded-xl px-2 py-0.5 text-[10px] font-medium ${
        solved
          ? "border border-mist bg-snow text-graphite"
          : "bg-obsidian text-snow"
      }`}
    >
      {solved ? "Solved" : "Open"}
    </span>
  );
}

function StreetRiskMeter({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-cloud">
      <div
        className="h-full rounded-full bg-amber-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

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

  const [mode, setMode] = useState<DashboardMode>("dumping");
  const [filters, setFilters] = useState<ReportFilterState>({
    status: "all",
    category: "all",
    area: "all",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAllMobile, setShowAllMobile] = useState(false);
  const [potholeArea, setPotholeArea] = useState<string | "all">("all");
  const [potholeSeverity, setPotholeSeverity] = useState<
    PotholeCase["severity"] | "all"
  >("all");

  const areas = useMemo(
    () => [...new Set(allReports.map((report) => report.area))].sort(),
    [allReports],
  );

  const potholeAreas = useMemo(
    () => [...new Set(MOCK_POTHOLES.map((p) => p.area))].sort(),
    [],
  );

  const filteredReports = useMemo(() => {
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

  const filteredPotholes = useMemo(() => {
    return MOCK_POTHOLES.filter((pothole) => {
      if (potholeArea !== "all" && pothole.area !== potholeArea) return false;
      if (potholeSeverity !== "all" && pothole.severity !== potholeSeverity)
        return false;
      return true;
    });
  }, [potholeArea, potholeSeverity]);

  const mapCases = useMemo(() => {
    if (mode === "pothole") return filteredPotholes.map(potholeToMapCase);
    return filteredReports.map(reportToMapCase);
  }, [mode, filteredPotholes, filteredReports]);

  const selectedReport =
    mode === "dumping"
      ? (allReports.find((report) => report.id === selectedId) ?? null)
      : null;
  const selectedPothole =
    mode === "pothole"
      ? (MOCK_POTHOLES.find((pothole) => pothole.id === selectedId) ?? null)
      : null;

  const party = selectedReport
    ? (getPartyById(selectedReport.responsiblePartyId) ?? null)
    : selectedPothole
      ? (getPartyById(selectedPothole.responsiblePartyId) ?? null)
      : null;

  const openCount =
    mode === "dumping"
      ? allReports.filter(
          (report) =>
            report.status !== "solved" && report.status !== "false_report",
        ).length
      : MOCK_POTHOLES.filter(
          (p) => p.status !== "solved" && p.status !== "false_report",
        ).length;
  const solvedCount =
    mode === "dumping"
      ? allReports.filter((report) => report.status === "solved").length
      : MOCK_POTHOLES.filter((p) => p.status === "solved").length;

  const solvedPreviewReports = allReports
    .filter((report) => report.status === "solved")
    .sort(
      (a, b) =>
        new Date(b.solvedAt ?? b.submittedAt).getTime() -
        new Date(a.solvedAt ?? a.submittedAt).getTime(),
    )
    .slice(0, 3);

  const solvedPreviewPotholes = MOCK_POTHOLES.filter(
    (p) => p.status === "solved",
  )
    .sort(
      (a, b) =>
        new Date(b.solvedAt ?? b.submittedAt).getTime() -
        new Date(a.solvedAt ?? a.submittedAt).getTime(),
    )
    .slice(0, 3);

  function switchMode(next: DashboardMode) {
    setMode(next);
    setSelectedId(null);
    setShowAllMobile(false);
  }

  function resetDemo() {
    if (selectedId === demoReport?.id) setSelectedId(null);
    clearDemoReport();
  }

  const listCount =
    mode === "dumping" ? filteredReports.length : filteredPotholes.length;

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col gap-4 px-5 pb-5 pt-4 sm:px-8 sm:pb-8 sm:pt-6 lg:overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex rounded-[16px] border border-cloud bg-snow p-1">
            <button
              type="button"
              onClick={() => switchMode("dumping")}
              className={`rounded-[12px] px-3.5 py-2 text-xs font-medium transition ${
                mode === "dumping"
                  ? "bg-obsidian text-snow"
                  : "text-steel hover:text-obsidian"
              }`}
            >
              Illegal dumping
            </button>
            <button
              type="button"
              onClick={() => switchMode("pothole")}
              className={`rounded-[12px] px-3.5 py-2 text-xs font-medium transition ${
                mode === "pothole"
                  ? "bg-obsidian text-snow"
                  : "text-steel hover:text-obsidian"
              }`}
            >
              Potholes
            </button>
          </div>
          <h1 className="mt-3 truncate text-2xl font-semibold tracking-[-0.025em] text-obsidian sm:text-[32px]">
            {mode === "dumping"
              ? "Illegal dumping across Selangor"
              : "Potholes across Selangor"}
          </h1>
          <p className="mt-1.5 inline-flex items-center gap-2 text-xs text-fog">
            <span
              className={`size-1.5 rounded-[3px] ${
                mode === "pothole" ? "bg-amber-500" : "bg-ember"
              }`}
            />
            {mode === "dumping"
              ? "Citizen activity · illustrative POC data"
              : "Road defects · diamond markers on the same map"}
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
          {mode === "dumping" && demoReport && (
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
        {mode === "dumping" ? (
          <ReportFilters
            value={filters}
            areas={areas}
            onChange={setFilters}
            compact
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <label className="flex min-w-[7.5rem] flex-1 flex-col gap-0.5 text-[10px] font-medium uppercase tracking-wider text-fog">
              Severity
              <select
                className="rounded-[12px] border border-cloud bg-snow px-2.5 py-1.5 text-xs text-obsidian outline-none focus:border-mist"
                value={potholeSeverity}
                onChange={(e) =>
                  setPotholeSeverity(
                    e.target.value as PotholeCase["severity"] | "all",
                  )
                }
              >
                <option value="all">All severities</option>
                {(
                  Object.keys(POTHOLE_SEVERITY_LABELS) as PotholeCase["severity"][]
                ).map((s) => (
                  <option key={s} value={s}>
                    {POTHOLE_SEVERITY_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[7.5rem] flex-1 flex-col gap-0.5 text-[10px] font-medium uppercase tracking-wider text-fog">
              Area
              <select
                className="rounded-[12px] border border-cloud bg-snow px-2.5 py-1.5 text-xs text-obsidian outline-none focus:border-mist"
                value={potholeArea}
                onChange={(e) => setPotholeArea(e.target.value)}
              >
                <option value="all">All areas</option>
                {potholeAreas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[440px_auto] gap-4 lg:grid-cols-[minmax(0,1.72fr)_360px] lg:grid-rows-1">
        <div className="relative min-h-0">
          <ActivityMap
            cases={mapCases}
            mode={mode}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {selectedReport && (
            <article className="absolute inset-x-3 bottom-16 z-20 max-h-[48%] overflow-y-auto rounded-[28px] border border-cloud bg-snow p-3 shadow-[0_12px_28px_rgba(9,9,11,0.1)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[440px] sm:p-4">
              <div className="flex gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedReport.imageUrl}
                  alt=""
                  className="h-[86px] w-[96px] shrink-0 rounded-[18px] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedReport.status} />
                    {selectedReport.id.startsWith("rpt-demo-") && (
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
                    {WASTE_CATEGORY_LABELS[selectedReport.wasteCategory]}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-fog">
                    {selectedReport.taman ? `${selectedReport.taman}, ` : ""}
                    {selectedReport.area}
                  </p>
                  <p className="tabular-nums mt-1 truncate font-mono text-[10px] text-ash">
                    {formatCoords(
                      selectedReport.latitude,
                      selectedReport.longitude,
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
                    href={`/report/${selectedReport.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-obsidian hover:text-ember"
                  >
                    Full detail
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                </div>
              )}
            </article>
          )}

          {selectedPothole && (
            <div className="pointer-events-none absolute inset-x-3 bottom-14 z-20 sm:inset-x-auto sm:bottom-4 sm:left-4">
              <div className="pointer-events-auto inline-flex max-w-[min(100%,360px)] items-center gap-2 rounded-[18px] border border-cloud bg-snow/95 px-3 py-2 shadow-[0_8px_24px_rgba(9,9,11,0.1)] backdrop-blur">
                <SolvedLabel solved={isPotholeSolved(selectedPothole)} />
                <span className="truncate text-xs font-medium text-obsidian">
                  {selectedPothole.roadName}
                </span>
                <span className="tabular-nums rounded-lg bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-snow">
                  {buildPotholeStreetAiInsight(selectedPothole).overallPercent}%
                  risk
                </span>
              </div>
            </div>
          )}
        </div>

        <aside className="flex flex-col overflow-hidden rounded-[36px] border border-cloud bg-snow lg:min-h-0">
          <div className="flex shrink-0 items-baseline justify-between gap-3 border-b border-cloud px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-obsidian">
                {mode === "dumping"
                  ? "Reports"
                  : selectedPothole
                    ? "Case analysis"
                    : "Pothole cases"}
              </h2>
              <p className="mt-0.5 text-xs text-fog">
                {mode === "dumping"
                  ? "Select a case to move the map"
                  : selectedPothole
                    ? "AI street risk for this location"
                    : "Select a case to move the map"}
              </p>
            </div>
            {mode === "pothole" && selectedPothole ? (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-[12px] border border-cloud px-2.5 py-1.5 text-xs font-medium text-iron hover:border-mist hover:text-obsidian"
              >
                Back
              </button>
            ) : (
              <span className="tabular-nums text-xs text-fog">{listCount}</span>
            )}
          </div>

          {mode === "dumping" ? (
            <>
              <div className="px-3 lg:hidden">
                <ReportList
                  reports={
                    showAllMobile
                      ? filteredReports
                      : filteredReports.slice(0, 5)
                  }
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  compact
                />
                {filteredReports.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllMobile((current) => !current)}
                    className="mb-3 w-full rounded-[14px] border border-cloud bg-paper px-4 py-3 text-xs font-medium text-iron hover:border-mist hover:text-obsidian"
                  >
                    {showAllMobile
                      ? "Show fewer reports"
                      : `Show all ${filteredReports.length} reports`}
                  </button>
                )}
              </div>

              <div className="hidden px-3 lg:block lg:min-h-0 lg:flex-[1.2] lg:overflow-y-auto">
                <ReportList
                  reports={filteredReports}
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
                  {solvedPreviewReports.map((report) => (
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
            </>
          ) : selectedPothole ? (
            <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
              {(() => {
                const insight = buildPotholeStreetAiInsight(selectedPothole);
                return (
                  <>
                    <div className="flex gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPothole.imageUrl}
                        alt=""
                        className="h-16 w-20 shrink-0 rounded-[16px] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-1.5">
                          <SolvedLabel
                            solved={isPotholeSolved(selectedPothole)}
                          />
                          <SeverityBadge severity={selectedPothole.severity} />
                        </div>
                        <p className="mt-1.5 truncate text-sm font-semibold text-obsidian">
                          {selectedPothole.title}
                        </p>
                        <p className="truncate text-xs text-fog">
                          {selectedPothole.roadName}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-cloud bg-paper/80 p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-fog">
                            AI street risk
                          </p>
                          <p className="mt-1 text-sm font-semibold text-obsidian">
                            {streetRiskLabel(insight.overallRisk)}
                          </p>
                        </div>
                        <span className="tabular-nums rounded-xl bg-obsidian px-2.5 py-1 text-xs font-medium text-snow">
                          {insight.overallPercent}%
                        </span>
                      </div>

                      <ul className="mt-3 space-y-2.5">
                        {insight.factors.slice(0, 3).map((factor) => (
                          <li key={factor.id}>
                            <div className="flex items-center justify-between gap-2 text-[11px]">
                              <span className="font-medium text-obsidian">
                                {factor.label}
                              </span>
                              <span className="tabular-nums text-fog">
                                {factor.percent}%
                              </span>
                            </div>
                            <div className="mt-1">
                              <StreetRiskMeter percent={factor.percent} />
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-fog">
                              {factor.valueLabel}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs leading-snug text-steel">
                      <span className="font-medium text-obsidian">Why: </span>
                      {insight.factors[0]?.detail ?? insight.summary}
                    </p>

                    <p className="rounded-[16px] border border-cloud px-3 py-2.5 text-[11px] leading-snug text-steel">
                      <span className="font-medium text-obsidian">Suggest: </span>
                      {insight.recommendation}
                    </p>

                    {party && (
                      <p className="mt-auto truncate text-[11px] text-fog">
                        {party.department}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <>
              <div className="flex min-h-0 flex-1 flex-col px-3 pt-1">
                <ul className="divide-y divide-cloud">
                  {filteredPotholes.slice(0, 5).map((pothole) => {
                    const active = selectedId === pothole.id;
                    return (
                      <li key={pothole.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(pothole.id)}
                          className={`flex w-full gap-3 px-1 py-2.5 text-left transition ${
                            active ? "bg-amber-50" : "hover:bg-paper"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={pothole.imageUrl}
                            alt=""
                            className="h-12 w-14 shrink-0 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-medium text-obsidian">
                                {pothole.title}
                              </p>
                              <SolvedLabel
                                solved={isPotholeSolved(pothole)}
                              />
                            </div>
                            <p className="mt-0.5 truncate text-xs text-fog">
                              {pothole.roadName} · {pothole.area}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {filteredPotholes.length > 5 && (
                  <p className="px-1 py-2 text-[11px] text-fog">
                    +{filteredPotholes.length - 5} more — filter severity/area
                    above
                  </p>
                )}
              </div>

              <div className="shrink-0 border-t border-cloud bg-paper/70 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-fog">
                  Recently solved
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {solvedPreviewPotholes.map((pothole) => (
                    <button
                      key={pothole.id}
                      type="button"
                      onClick={() => setSelectedId(pothole.id)}
                      className="rounded-full border border-cloud bg-snow px-2.5 py-1 text-[11px] text-steel hover:border-mist hover:text-obsidian"
                    >
                      {pothole.roadName.split(" ").slice(0, 2).join(" ")}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
