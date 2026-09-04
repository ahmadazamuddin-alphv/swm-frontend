import { STATUS_LABELS } from "@/lib/mock-data";
import type { ReportStatus } from "@/lib/types";

const STYLES: Record<ReportStatus, string> = {
  new: "bg-selangor-yellow-soft text-selangor-ink",
  under_review: "bg-selangor-red-soft text-selangor-red-deep",
  assigned: "bg-muted text-selangor-ink",
  in_progress: "bg-selangor-yellow/35 text-selangor-ink",
  solved: "bg-emerald-100 text-emerald-900",
  false_report: "bg-stone-200 text-stone-700",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium tracking-wide ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
