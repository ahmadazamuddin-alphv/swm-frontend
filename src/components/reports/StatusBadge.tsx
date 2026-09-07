import { STATUS_LABELS } from "@/lib/mock-data";
import type { ReportStatus } from "@/lib/types";

const STYLES: Record<ReportStatus, string> = {
  new: "border border-[#2563eb] bg-[#2563eb] text-white",
  under_review: "border border-[#8b5cf6] bg-[#8b5cf6] text-white",
  assigned: "border border-[#06b6d4] bg-[#06b6d4] text-[#083344]",
  in_progress: "border border-[#D2222B] bg-[#D2222B] text-white",
  solved: "border border-[#16a34a] bg-[#16a34a] text-white",
  false_report: "border border-[#ef4444] bg-[#ef4444] text-white",
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
