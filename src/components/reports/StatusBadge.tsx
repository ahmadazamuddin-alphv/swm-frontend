import { STATUS_LABELS } from "@/lib/mock-data";
import type { ReportStatus } from "@/lib/types";

const STYLES: Record<ReportStatus, string> = {
  new: "bg-ember text-snow",
  under_review: "bg-graphite text-snow",
  assigned: "bg-iron text-snow",
  in_progress: "bg-mist text-graphite",
  solved: "border border-mist bg-snow text-graphite",
  false_report: "bg-cloud text-fog",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-xl px-2 py-0.5 text-[10px] font-medium ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
