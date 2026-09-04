"use client";

import { WASTE_CATEGORY_LABELS } from "@/lib/mock-data";
import type { ReportStatus, WasteCategory } from "@/lib/types";

const STATUSES: Array<ReportStatus | "all"> = [
  "all",
  "new",
  "under_review",
  "assigned",
  "in_progress",
  "solved",
];

const CATEGORIES: Array<WasteCategory | "all"> = [
  "all",
  "construction",
  "furniture",
  "waste_pile",
  "tyres",
  "e_waste",
  "organic",
  "mixed",
];

export interface ReportFilterState {
  status: ReportStatus | "all";
  category: WasteCategory | "all";
  area: string | "all";
}

interface ReportFiltersProps {
  value: ReportFilterState;
  areas: string[];
  onChange: (next: ReportFilterState) => void;
  compact?: boolean;
}

export function ReportFilters({
  value,
  areas,
  onChange,
  compact = false,
}: ReportFiltersProps) {
  const labelClass = compact
    ? "flex min-w-[7.5rem] flex-1 flex-col gap-1 text-[11px] font-medium text-fog"
    : "flex min-w-[9rem] flex-1 flex-col gap-1.5 text-xs font-medium text-fog";
  const selectClass = compact
    ? "h-9 rounded-[14px] border border-cloud bg-snow px-3 text-xs font-normal text-graphite outline-none hover:border-mist"
    : "h-11 rounded-[14px] border border-cloud bg-snow px-3 text-sm font-normal text-graphite outline-none hover:border-mist";

  return (
    <div className={`flex flex-wrap ${compact ? "gap-2" : "gap-3"}`}>
      <label className={labelClass}>
        Status
        <select
          className={selectClass}
          value={value.status}
          onChange={(e) =>
            onChange({
              ...value,
              status: e.target.value as ReportFilterState["status"],
            })
          }
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Waste type
        <select
          className={selectClass}
          value={value.category}
          onChange={(e) =>
            onChange({
              ...value,
              category: e.target.value as ReportFilterState["category"],
            })
          }
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All categories" : WASTE_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Area
        <select
          className={selectClass}
          value={value.area}
          onChange={(e) => onChange({ ...value, area: e.target.value })}
        >
          <option value="all">All areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
