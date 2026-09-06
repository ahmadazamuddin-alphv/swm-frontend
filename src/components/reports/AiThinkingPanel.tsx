"use client";

import { buildAiInsight } from "@/lib/ai-insight";
import { WASTE_CATEGORY_LABELS } from "@/lib/mock-data";
import type { Report } from "@/lib/types";

export function AiThinkingPanel({ report }: { report: Report }) {
  const insight = buildAiInsight(report);

  return (
    <section className="rounded-[28px] border border-[#ead9b8] bg-[#fff8ea]/95 p-5 shadow-[0_16px_38px_rgba(64,35,10,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-fog">
            AI analysis
          </p>
          <p className="mt-1 text-sm font-semibold text-obsidian">
            {WASTE_CATEGORY_LABELS[report.wasteCategory]}
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-[#17100b] px-2 py-0.5 text-[10px] font-medium text-white">
          {Math.round(insight.confidence * 100)}%
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-steel">
        {insight.visualCues.slice(0, 2).join(" · ")}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {insight.alternateCategories.map((alt) => (
          <span
            key={alt.category}
            className="rounded-lg border border-[#ead9b8] bg-white/60 px-2 py-1 text-[10px] text-[#6e5c4b]"
          >
            {WASTE_CATEGORY_LABELS[alt.category]}{" "}
            <span className="tabular-nums text-graphite">
              {Math.round(alt.likelihood * 100)}%
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
