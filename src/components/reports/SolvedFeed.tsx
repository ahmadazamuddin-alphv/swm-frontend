import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { WASTE_CATEGORY_LABELS } from "@/lib/mock-data";
import type { Report } from "@/lib/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function SolvedFeed({ reports }: { reports: Report[] }) {
  const solved = reports
    .filter((r) => r.status === "solved")
    .sort(
      (a, b) =>
        new Date(b.solvedAt ?? b.submittedAt).getTime() -
        new Date(a.solvedAt ?? a.submittedAt).getTime(),
    );

  return (
    <section aria-labelledby="solved-heading">
      <h2
        id="solved-heading"
        className="text-xl font-semibold text-obsidian"
      >
        Recently solved
      </h2>
      <p className="mt-1 text-sm text-fog">
        Cleared cases so citizens see government action.
      </p>

      <ul className="mt-5 space-y-4">
        {solved.map((report) => (
          <li key={report.id} className="flex gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={report.imageUrl}
              alt=""
              className="h-16 w-20 shrink-0 rounded-[7px] object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-obsidian">
                {WASTE_CATEGORY_LABELS[report.wasteCategory]} · {report.area}
              </p>
              <p className="mt-0.5 text-xs text-fog">
                Solved {report.solvedAt ? formatDate(report.solvedAt) : "—"}
              </p>
              <Link
                href={`/report/${report.id}`}
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-graphite hover:text-ember"
              >
                See outcome
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>
          </li>
        ))}
        {solved.length === 0 && (
          <li className="text-sm text-fog">No solved reports yet.</li>
        )}
      </ul>
    </section>
  );
}
