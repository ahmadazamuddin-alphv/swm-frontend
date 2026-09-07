"use client";

import {
  getRiskPotential,
  highestRiskLevel,
  riskLevelLabel,
} from "@/lib/risk-potential";
import type { WasteCategory } from "@/lib/types";

const LEVEL_STYLES = {
  high: "bg-[#D2222B] text-white",
  medium: "bg-[#D2222B] text-white",
  low: "border border-[#e4e4e7] bg-white text-[#3a281b]",
} as const;

export function RiskPotentialPanel({
  category,
  wasteType,
  loading,
}: {
  category: WasteCategory;
  wasteType: string;
  loading?: boolean;
}) {
  const risks = getRiskPotential(category, wasteType);
  const peak = highestRiskLevel(risks);

  return (
    <section className="rounded-[14px] border border-[#e4e4e7] bg-[#ffffff]/95 p-6 shadow-[0_16px_38px_rgba(9,9,11,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-fog">Risk potential</p>
          <h2 className="mt-2 text-lg font-semibold text-obsidian">
            What this waste can cause
          </h2>
        </div>
        <span
          className={`shrink-0 rounded-xl px-2 py-1 text-[10px] font-medium ${LEVEL_STYLES[peak]}`}
        >
          {riskLevelLabel(peak)} overall
        </span>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-fog">
          Estimating risks from the suggested category…
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-[#e4e4e7]">
          {risks.map((risk) => (
            <li key={risk.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-obsidian">{risk.title}</p>
                <span
                  className={`rounded-xl px-2 py-0.5 text-[10px] font-medium ${LEVEL_STYLES[risk.level]}`}
                >
                  {riskLevelLabel(risk.level)}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-fog">
                {risk.summary}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
