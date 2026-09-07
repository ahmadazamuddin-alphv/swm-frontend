"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowRightIcon,
  RotateCcwIcon,
} from "@/components/ui/Icons";
import { WASTE_CATEGORY_LABELS } from "@/lib/mock-data";
import {
  MOCK_POTHOLES,
  POTHOLE_SEVERITY_LABELS,
} from "@/lib/pothole-data";
import {
  buildPotholeStreetAiInsight,
  isPotholeSolved,
  streetRiskLabel,
} from "@/lib/pothole-ai";
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
import type { MapSelectableCase } from "@/components/map/ActivityMap";

const ActivityMap = dynamic(
  () =>
    import("@/components/map/ActivityMap").then((module) => module.ActivityMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-[18px] border border-cloud bg-snow text-sm text-fog">
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
    imageUrl: report.imageUrl,
    detailHref: `/report/${report.id}`,
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
    imageUrl: pothole.imageUrl,
  };
}

function SeverityBadge({ severity }: { severity: PotholeCase["severity"] }) {
  const styles = {
    low: "border border-mist bg-snow text-graphite",
    medium: "bg-[#D2222B] text-snow",
    high: "bg-[#a91824] text-snow",
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
          ? "border border-[#16a34a] bg-[#16a34a] text-white"
          : "border border-[#2563eb] bg-[#2563eb] text-white"
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
        className="h-full rounded-full bg-[#D2222B]"
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
  const [reportsMinimized, setReportsMinimized] = useState(true);
  const [headingCollapsed, setHeadingCollapsed] = useState(false);
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

  const selectedPothole =
    mode === "pothole"
      ? (MOCK_POTHOLES.find((pothole) => pothole.id === selectedId) ?? null)
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
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#ffffff] px-3 pb-3 pt-20 sm:px-5 sm:pb-5 sm:pt-24">
      {headingCollapsed ? (
        <button
          type="button"
          onClick={() => setHeadingCollapsed(false)}
          className="absolute left-4 top-28 z-20 inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-[#ffffff]/95 px-4 py-2.5 text-xs font-semibold text-[#a91824] shadow-[0_10px_22px_rgba(9,9,11,0.14)] backdrop-blur-md hover:bg-white sm:left-6 sm:top-32"
        >
          <span className="text-base leading-none">+</span>
          Show overview
        </button>
      ) : (
      <div className="swm-dashboard-heading absolute left-4 right-4 top-28 z-20 w-auto rounded-[12px] border border-[#e4e4e7]/90 bg-[#ffffff]/90 p-3 shadow-[0_16px_38px_rgba(9,9,11,0.12)] backdrop-blur-md sm:left-6 sm:right-auto sm:top-32 sm:w-[min(610px,calc(100vw-3rem))] sm:p-4">
        <button
          type="button"
          onClick={() => setHeadingCollapsed(true)}
          aria-label="Hide map overview"
          title="Hide overview"
          className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full border border-[#e4e4e7] bg-white text-lg leading-none text-[#6e5c4b] shadow-[0_6px_14px_rgba(9,9,11,0.14)] hover:border-[#D2222B] hover:text-[#a91824]"
        >
          −
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex rounded-[7px] border border-[#e4e4e7] bg-white/70 p-1">
            <button
              type="button"
              onClick={() => switchMode("dumping")}
              className={`rounded-[6px] px-3.5 py-2 text-xs font-medium transition ${
                mode === "dumping"
                  ? "bg-[#f8d8d4] text-[#a91824] shadow-[0_4px_12px_rgba(210,34,43,0.12)] ring-1 ring-[#e9aaa4]"
                  : "text-[#6e5c4b] hover:bg-[#f4f4f5] hover:text-[#8f1822]"
              }`}
            >
              Illegal dumping
            </button>
            <button
              type="button"
              onClick={() => switchMode("pothole")}
              className={`rounded-[6px] px-3.5 py-2 text-xs font-medium transition ${
                mode === "pothole"
                  ? "bg-[#f8d8d4] text-[#a91824] shadow-[0_4px_12px_rgba(210,34,43,0.12)] ring-1 ring-[#e9aaa4]"
                  : "text-[#6e5c4b] hover:bg-[#f4f4f5] hover:text-[#8f1822]"
              }`}
            >
              Potholes
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-3">
          <p className="flex items-baseline gap-1.5">
            <span className="tabular-nums text-2xl font-semibold text-[#17100b]">
              {openCount}
            </span>
            <span className="text-xs text-fog">active</span>
          </p>
          <p className="flex items-baseline gap-1.5">
            <span className="tabular-nums text-2xl font-semibold text-[#17100b]">
              {solvedCount}
            </span>
            <span className="text-xs text-fog">solved</span>
          </p>
          {mode === "dumping" && demoReport && (
            <button
              type="button"
              onClick={resetDemo}
              className="inline-flex items-center gap-2 rounded-[7px] border border-[#e4e4e7] bg-white/80 px-3 py-2 text-xs font-medium text-[#6e5c4b] hover:border-[#D2222B] hover:text-[#8f1822]"
            >
              <RotateCcwIcon className="size-4" />
              <span className="hidden sm:inline">Reset demo</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="mt-4 whitespace-normal text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#17100b] sm:text-[32px]">
          {mode === "dumping"
            ? "Illegal dumping across Selangor"
            : "Potholes across Selangor"}
        </h1>
        <p className="mt-2 inline-flex items-center gap-2 text-xs text-fog">
          <span
            className={`size-1.5 rounded-[2px] ${
              mode === "pothole" ? "bg-[#a91824]" : "bg-[#D2222B]"
            }`}
          />
          {mode === "dumping"
            ? "Citizen activity · illustrative POC data"
            : "Road defects · diamond markers on the same map"}
        </p>
        <div className="mt-5 border-t border-[#e4e4e7] pt-4">
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
                  className="rounded-[6px] border border-[#e4e4e7] bg-[#ffffff]/95 px-2.5 py-1.5 text-xs text-[#3a281b] shadow-[0_8px_18px_rgba(9,9,11,0.08)] outline-none focus:border-[#D2222B]"
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
                  className="rounded-[6px] border border-[#e4e4e7] bg-[#ffffff]/95 px-2.5 py-1.5 text-xs text-[#3a281b] shadow-[0_8px_18px_rgba(9,9,11,0.08)] outline-none focus:border-[#D2222B]"
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
      </div>
      )}

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 min-h-0">
          <ActivityMap
            cases={mapCases}
            mode={mode}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              if (window.matchMedia("(max-width: 639px)").matches) {
                setHeadingCollapsed(true);
              }
            }}
          />

        </div>

        <aside
          className={
            reportsMinimized
              ? "absolute bottom-20 right-3 z-20 flex w-auto max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[9px] border border-[#e4e4e7] bg-[#ffffff]/95 shadow-[0_16px_38px_rgba(9,9,11,0.16)] backdrop-blur-md lg:bottom-14 lg:right-5"
              : "absolute bottom-3 left-3 right-3 z-20 flex max-h-[43dvh] flex-col overflow-hidden rounded-[14px] border border-[#e4e4e7] bg-[#ffffff]/95 shadow-[0_16px_38px_rgba(9,9,11,0.16)] backdrop-blur-md lg:bottom-5 lg:left-auto lg:right-5 lg:top-28 lg:w-[360px] lg:max-h-[calc(100dvh-9rem)]"
          }
        >
          <div
            className={`flex shrink-0 items-center justify-between gap-3 ${
              reportsMinimized
                ? "cursor-pointer px-3 py-2 transition-colors hover:bg-[#f4f4f5]"
                : "border-b border-cloud px-5 py-4"
            }`}
            onClick={
              reportsMinimized
                ? () => setReportsMinimized(false)
                : undefined
            }
            onKeyDown={
              reportsMinimized
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setReportsMinimized(false);
                    }
                  }
                : undefined
            }
            role={reportsMinimized ? "button" : undefined}
            tabIndex={reportsMinimized ? 0 : undefined}
            aria-label={reportsMinimized ? "Expand reports" : undefined}
            aria-expanded={!reportsMinimized}
          >
            <div>
              <h2 className="text-base font-semibold text-obsidian">
                {mode === "dumping"
                  ? "Reports"
                  : selectedPothole
                    ? "Case analysis"
                    : "Pothole cases"}
              </h2>
              <p className={`mt-0.5 text-xs text-fog ${reportsMinimized ? "sr-only" : ""}`}>
                {mode === "dumping"
                  ? "Select a case to move the map"
                  : selectedPothole
                    ? "AI street risk for this location"
                    : "Select a case to move the map"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {mode === "pothole" && selectedPothole ? (
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="rounded-[6px] border border-cloud px-2.5 py-1.5 text-xs font-medium text-iron hover:border-mist hover:text-obsidian"
                >
                  Back
                </button>
              ) : (
                <span className="tabular-nums text-xs text-fog">{listCount}</span>
              )}
              {reportsMinimized ? (
                <span
                  aria-hidden="true"
                  className="grid size-7 place-items-center rounded-[5px] border border-[#e4e4e7] bg-white/70 text-lg leading-none text-[#6e5c4b]"
                >
                  +
                </span>
              ) : (
                <button
                  type="button"
                  aria-label="Minimize reports"
                  onClick={() => setReportsMinimized(true)}
                  className="grid size-7 place-items-center rounded-[5px] border border-[#e4e4e7] bg-white/70 text-lg leading-none text-[#6e5c4b] hover:border-[#D2222B] hover:text-[#a91824]"
                >
                  <span aria-hidden="true">−</span>
                </button>
              )}
            </div>
          </div>

          {!reportsMinimized && (mode === "dumping" ? (
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
                    className="mb-3 w-full rounded-[7px] border border-cloud bg-paper px-4 py-3 text-xs font-medium text-iron hover:border-mist hover:text-obsidian"
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
                        className="h-16 w-20 shrink-0 rounded-[8px] object-cover"
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

                    <div className="rounded-[10px] border border-cloud bg-paper/80 p-3.5">
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

                    <p className="rounded-[8px] border border-cloud px-3 py-2.5 text-[11px] leading-snug text-steel">
                      <span className="font-medium text-obsidian">Suggest: </span>
                      {insight.recommendation}
                    </p>

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
                            active ? "bg-[#fde7e8]" : "hover:bg-paper"
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

            </>
          ))}
        </aside>
      </div>

      {mode === "dumping" && (
        <Link
          href="/report"
          className="swm-report-fab fixed bottom-2 right-3 z-10 inline-flex items-center gap-2 rounded-[9px] bg-[#D2222B] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(210,34,43,0.3)] hover:-translate-y-1 hover:bg-[#a91824] sm:bottom-7 sm:left-1/2 sm:right-auto sm:z-30 sm:-translate-x-1/2 sm:px-6"
        >
          <span className="grid size-6 place-items-center rounded-full bg-white text-[#D2222B] text-lg leading-none">
            +
          </span>
          Report dumping
          <ArrowRightIcon className="size-4" />
        </Link>
      )}
    </main>
  );
}
