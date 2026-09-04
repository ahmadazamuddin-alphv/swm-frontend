import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PartyPanel } from "@/components/parties/PartyPanel";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { fetchReport, getPartyById } from "@/lib/api";
import { WASTE_CATEGORY_LABELS } from "@/lib/mock-data";
import { formatCoords } from "@/lib/geo";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await fetchReport(id);
  if (!report) notFound();

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

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-16 pt-4 sm:px-8">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-selangor-red hover:underline"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={report.status} />
              <span className="text-xs text-selangor-ink/50">{report.id}</span>
            </div>
            <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl text-selangor-ink">
              {WASTE_CATEGORY_LABELS[report.wasteCategory]}
            </h1>
            <p className="mt-2 text-selangor-ink/70">{report.wasteType}</p>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={report.imageUrl}
              alt={`Report ${report.id}`}
              className="mt-6 aspect-[4/3] w-full rounded-xl object-cover"
            />

            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-selangor-ink/50">Area</dt>
                <dd className="mt-0.5 text-selangor-ink">
                  {report.taman ? `${report.taman}, ` : ""}
                  {report.area} {report.postcode}
                </dd>
              </div>
              <div>
                <dt className="text-selangor-ink/50">Coordinates</dt>
                <dd className="mt-0.5 text-selangor-ink">
                  {formatCoords(report.latitude, report.longitude)}
                </dd>
              </div>
              <div>
                <dt className="text-selangor-ink/50">Submitted</dt>
                <dd className="mt-0.5 text-selangor-ink">{submitted}</dd>
              </div>
              <div>
                <dt className="text-selangor-ink/50">AI confidence</dt>
                <dd className="mt-0.5 text-selangor-ink">
                  {Math.round(report.aiConfidence * 100)}%
                </dd>
              </div>
              {solved && (
                <div className="sm:col-span-2">
                  <dt className="text-selangor-ink/50">Solved at</dt>
                  <dd className="mt-0.5 text-selangor-ink">{solved}</dd>
                </div>
              )}
              {report.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-selangor-ink/50">Notes</dt>
                  <dd className="mt-0.5 text-selangor-ink">{report.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          <aside>
            <PartyPanel party={party} />
          </aside>
        </div>
      </main>
    </div>
  );
}
