"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { PartyPanel } from "@/components/parties/PartyPanel";
import { AiThinkingPanel } from "@/components/reports/AiThinkingPanel";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { RiskPotentialPanel } from "@/components/reporting/RiskPotentialPanel";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import {
  getDemoReportServerSnapshot,
  getDemoReportSnapshot,
  parseDemoReport,
  subscribeToDemoReport,
} from "@/lib/demo-store";
import { formatCoords } from "@/lib/geo";
import { WASTE_CATEGORY_LABELS, getPartyById } from "@/lib/mock-data";
import type { Report } from "@/lib/types";

export function ReportDetailClient({
  id,
  initialReport,
}: {
  id: string;
  initialReport: Report | null;
}) {
  const storedReport = useSyncExternalStore(
    subscribeToDemoReport,
    getDemoReportSnapshot,
    getDemoReportServerSnapshot,
  );
  const report = useMemo(() => {
    const local = parseDemoReport(storedReport);
    if (local?.id === id) return local;
    return initialReport;
  }, [id, initialReport, storedReport]);

  if (!report) {
    return (
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col justify-center px-5 py-16 text-center sm:px-8">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-obsidian">
          Report not found
        </h1>
        <p className="mt-4 text-steel">
          This reference is not part of the current POC dataset.
        </p>
        <Link
          href="/dashboard"
          className="mx-auto mt-7 inline-flex items-center gap-2 rounded-[14px] border border-[#2c2e34] bg-obsidian px-5 py-3 text-sm font-medium text-snow"
        >
          <ArrowLeftIcon className="size-4" />
          Return to activity map
        </Link>
      </main>
    );
  }

  const party = getPartyById(report.responsiblePartyId) ?? null;
  const submitted = new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(report.submittedAt));
  const solved = report.solvedAt
    ? new Intl.DateTimeFormat("en-MY", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(report.solvedAt))
    : null;
  const isLocal = report.id.startsWith("rpt-demo-");

  return (
    <main className="relative isolate w-full flex-1 overflow-hidden bg-[#f8f1e5] px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute inset-0 bg-cover bg-[position:48%_center] sm:bg-center"
          style={{ backgroundImage: "url('/brand/selangor-mosque.jpg')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,241,229,0.90)_0%,rgba(248,241,229,0.60)_30%,rgba(248,241,229,0.50)_55%,#f8f1e5_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_12%,rgba(253,185,21,0.28),transparent_55%),radial-gradient(ellipse_at_90%_30%,rgba(210,34,43,0.18),transparent_55%)]" />
      </div>
      <div className="mx-auto w-full max-w-[1280px]">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-[14px] border border-[#ead9b8] bg-[#fff8ea]/90 px-4 py-2.5 text-sm font-medium text-[#6e5c4b] shadow-[0_8px_20px_rgba(64,35,10,0.06)] backdrop-blur hover:border-[#D2222B] hover:text-[#a91824]"
      >
        <ArrowLeftIcon className="size-4" />
        Back to activity map
      </Link>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a91824]">
            Civic evidence · Selangor
          </p>
          <p className="mt-1 text-sm text-[#6e5c4b]">
            Review the evidence and response route for this case.
          </p>
        </div>
        <span className="rounded-full border border-[#ead9b8] bg-[#fff8ea]/75 px-3 py-1.5 text-xs text-[#6e5c4b]">
          {report.area}
        </span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <article className="overflow-hidden rounded-[32px] border border-[#ead9b8] bg-[#fff8ea]/95 shadow-[0_20px_50px_rgba(64,35,10,0.1)]">
          <div className="relative p-6 sm:p-9">
            <span className="absolute inset-y-0 left-0 w-1.5 bg-[#D2222B]" />
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
              {isLocal && (
                <span className="rounded-xl bg-[#FDB915] px-2 py-0.5 text-[10px] font-semibold text-[#4a1b0d]">
                  Local POC report
                </span>
              )}
              <span className="tabular-nums ml-auto rounded-full border border-[#ead9b8] bg-white/70 px-2.5 py-1 text-xs text-[#6e5c4b]">
                {report.id}
              </span>
            </div>
            <h1 className="text-balance mt-6 text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-[#17100b] sm:text-6xl">
              {WASTE_CATEGORY_LABELS[report.wasteCategory]}
            </h1>
            <p className="mt-3 text-base text-[#6e5c4b]">{report.wasteType}</p>
          </div>

          <div className="relative overflow-hidden border-y border-[#ead9b8] bg-[#17100b]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={report.imageUrl}
              alt={`Waste evidence for report ${report.id}`}
              className="aspect-[16/9] w-full object-cover transition duration-500 hover:scale-[1.02]"
            />
            <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-[#17100b]/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur">
              Evidence capture
            </span>
          </div>

          <dl className="grid gap-px bg-[#ead9b8] sm:grid-cols-2">
            {[
              {
                label: "Area",
                value: `${report.taman ? `${report.taman}, ` : ""}${report.area} ${report.postcode}`,
              },
              {
                label: "Coordinates",
                value: formatCoords(report.latitude, report.longitude),
              },
              { label: "Submitted", value: submitted },
              {
                label: "Simulated AI confidence",
                value: `${Math.round(report.aiConfidence * 100)}%`,
              },
              ...(solved ? [{ label: "Solved", value: solved }] : []),
              ...(report.notes
                ? [{ label: "Site notes", value: report.notes }]
                : []),
            ].map((item) => (
              <div key={item.label} className="bg-[#fff8ea] p-5 sm:p-6">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8f7b67]">
                  {item.label}
                </dt>
                <dd className="tabular-nums mt-2 text-sm text-[#3a281b]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        <aside className="space-y-4">
          <PartyPanel party={party} />
          <RiskPotentialPanel
            category={report.wasteCategory}
            wasteType={report.wasteType}
          />
          <AiThinkingPanel report={report} />
        </aside>
      </div>
      </div>
    </main>
  );
}
