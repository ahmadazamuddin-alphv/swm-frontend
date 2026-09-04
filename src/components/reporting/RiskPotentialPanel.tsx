"use client";

import {
  getRiskPotential,
  highestRiskLevel,
  riskLevelLabel,
} from "@/lib/risk-potential";
import type { WasteCategory } from "@/lib/types";

const LEVEL_STYLES = {
  high: "bg-selangor-red-soft text-selangor-red-deep",
  medium: "bg-selangor-yellow-soft text-selangor-ink",
  low: "bg-emerald-50 text-emerald-900",
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
    <div className="rounded-lg border border-selangor-red/15 bg-white/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-selangor-red/80">
            Risk potential
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-lg text-selangor-ink">
            What this waste can cause
          </h3>
        </div>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[peak]}`}
        >
          {riskLevelLabel(peak)} overall
        </span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-selangor-ink/55">
          Estimating risks from AI category…
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {risks.map((risk) => (
            <li
              key={risk.id}
              className="border-t border-selangor-red/10 pt-3 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-selangor-ink">
                  {risk.title}
                </p>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${LEVEL_STYLES[risk.level]}`}
                >
                  {riskLevelLabel(risk.level)}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-selangor-ink/65">
                {risk.summary}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
