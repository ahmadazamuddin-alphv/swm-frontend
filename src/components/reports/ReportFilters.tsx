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
    ? "flex min-w-0 flex-col gap-1 text-[11px] font-medium text-fog"
    : "flex min-w-[9rem] flex-1 flex-col gap-1.5 text-xs font-medium text-fog";
  const selectClass = compact
    ? "h-9 rounded-[14px] border border-[#ead9b8] bg-[#fff8ea]/95 px-3 text-xs font-normal text-[#3a281b] shadow-[0_8px_18px_rgba(64,35,10,0.08)] outline-none hover:border-[#D2222B] focus:border-[#D2222B]"
    : "h-11 rounded-[14px] border border-[#ead9b8] bg-[#fff8ea] px-3 text-sm font-normal text-[#3a281b] outline-none hover:border-[#D2222B] focus:border-[#D2222B]";
  const selectedClass = "border-[#e9aaa4] bg-[#fdf0ee] text-[#a91824]";

  return (
    <div className={compact ? "grid grid-cols-3 gap-2" : "flex flex-wrap gap-3"}>
      <label className={labelClass}>
        Status
        <select
          className={`${selectClass} ${value.status !== "all" ? selectedClass : ""}`}
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
          className={`${selectClass} ${value.category !== "all" ? selectedClass : ""}`}
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
          className={`${selectClass} ${value.area !== "all" ? selectedClass : ""}`}
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
