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
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-[14px] border border-cloud bg-snow px-4 py-2.5 text-sm font-medium text-iron hover:border-mist hover:text-obsidian"
      >
        <ArrowLeftIcon className="size-4" />
        Back to activity map
      </Link>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <article className="overflow-hidden rounded-[36px] border border-cloud bg-snow">
          <div className="p-7 sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
              {isLocal && (
                <span className="rounded-xl bg-ember px-2 py-0.5 text-[10px] font-medium text-snow">
                  Local POC report
                </span>
              )}
              <span className="tabular-nums ml-auto text-xs text-fog">
                {report.id}
              </span>
            </div>
            <h1 className="text-balance mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-obsidian sm:text-5xl">
              {WASTE_CATEGORY_LABELS[report.wasteCategory]}
            </h1>
            <p className="mt-3 text-base text-steel">{report.wasteType}</p>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.imageUrl}
            alt={`Waste evidence for report ${report.id}`}
            className="aspect-[16/9] w-full border-y border-cloud object-cover"
          />

          <dl className="grid gap-px bg-cloud sm:grid-cols-2">
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
              <div key={item.label} className="bg-snow p-6">
                <dt className="text-xs text-fog">{item.label}</dt>
                <dd className="tabular-nums mt-2 text-sm text-graphite">
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
    </main>
  );
}
