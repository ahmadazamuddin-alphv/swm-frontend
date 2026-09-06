import type { PotholeCase } from "./types";

export type StreetRiskLevel = "low" | "medium" | "high" | "critical";

export interface StreetRiskFactor {
  id: string;
  label: string;
  valueLabel: string;
  percent: number;
  detail: string;
}

export interface PotholeStreetAiInsight {
  overallRisk: StreetRiskLevel;
  overallPercent: number;
  headline: string;
  summary: string;
  factors: StreetRiskFactor[];
  recommendation: string;
}

const BY_ID: Record<
  string,
  Omit<PotholeStreetAiInsight, "headline" | "summary" | "recommendation">
> = {
  "ph-2001": {
    overallRisk: "high",
    overallPercent: 82,
    factors: [
      {
        id: "speed",
        label: "Vehicle speed",
        valueLabel: "~68 km/h average",
        percent: 78,
        detail:
          "Junction approach speeds are elevated after the green wave; braking distance shortens over a deep crater.",
      },
      {
        id: "moto",
        label: "Motorcycle traffic",
        valueLabel: "41% of vehicles",
        percent: 72,
        detail:
          "High two-wheeler share — riders are more likely to lose balance if they hit the hole edge.",
      },
      {
        id: "rain",
        label: "Standing water",
        valueLabel: "Often flooded",
        percent: 65,
        detail:
          "Rain fills the crater and hides depth, raising sudden swerve risk into oncoming lanes.",
      },
    ],
  },
  "ph-2002": {
    overallRisk: "medium",
    overallPercent: 64,
    factors: [
      {
        id: "moto",
        label: "Motorcycle traffic",
        valueLabel: "54% of vehicles",
        percent: 84,
        detail:
          "Motorcycle lane is heavily used; cluster of mid-lane holes sits directly in the filter path.",
      },
      {
        id: "speed",
        label: "Vehicle speed",
        valueLabel: "~42 km/h average",
        percent: 48,
        detail:
          "Moderate speeds, but repeated bumps increase fatigue and near-miss reports.",
      },
      {
        id: "density",
        label: "Lane congestion",
        valueLabel: "Peak-hour dense",
        percent: 58,
        detail: "Limited room to dodge without cutting into car lanes.",
      },
    ],
  },
  "ph-2003": {
    overallRisk: "critical",
    overallPercent: 91,
    factors: [
      {
        id: "edge",
        label: "Shoulder collapse",
        valueLabel: "Edge failure",
        percent: 92,
        detail:
          "Broken road edge next to a drain can catch bicycle and motorcycle tyres at night.",
      },
      {
        id: "lighting",
        label: "Night visibility",
        valueLabel: "Poor lighting",
        percent: 80,
        detail:
          "Street lighting gap makes the drop-off hard to see after dusk.",
      },
      {
        id: "speed",
        label: "Vehicle speed",
        valueLabel: "~55 km/h average",
        percent: 70,
        detail:
          "Cars travelling at arterial speed leave little reaction time for cyclists ahead.",
      },
    ],
  },
  "ph-2004": {
    overallRisk: "low",
    overallPercent: 34,
    factors: [
      {
        id: "speed",
        label: "Vehicle speed",
        valueLabel: "~35 km/h average",
        percent: 32,
        detail: "Residential speeds keep impact energy relatively low.",
      },
      {
        id: "moto",
        label: "Motorcycle traffic",
        valueLabel: "28% of vehicles",
        percent: 40,
        detail:
          "Some motorcycle volume, but the break is still shallow and early-stage.",
      },
      {
        id: "growth",
        label: "Defect growth",
        valueLabel: "Likely to worsen",
        percent: 55,
        detail:
          "Alligator cracking usually expands after rain cycles — worth monitoring.",
      },
    ],
  },
  "ph-2005": {
    overallRisk: "low",
    overallPercent: 18,
    factors: [
      {
        id: "repair",
        label: "Repair status",
        valueLabel: "Patched",
        percent: 12,
        detail:
          "Hot-mix patch is in place; residual risk is mainly unpainted line markings.",
      },
      {
        id: "bus",
        label: "Bus lane load",
        valueLabel: "Heavy buses",
        percent: 45,
        detail:
          "Bus axle loads may re-open the patch if curing was incomplete — keep under watch.",
      },
      {
        id: "speed",
        label: "Vehicle speed",
        valueLabel: "~50 km/h average",
        percent: 40,
        detail: "Speeds are moderate on this corridor.",
      },
    ],
  },
  "ph-2006": {
    overallRisk: "high",
    overallPercent: 76,
    factors: [
      {
        id: "speed",
        label: "Vehicle speed",
        valueLabel: "~62 km/h average",
        percent: 81,
        detail:
          "Roundabout approaches accelerate into the dip; several near-miss reports logged.",
      },
      {
        id: "moto",
        label: "Motorcycle traffic",
        valueLabel: "47% of vehicles",
        percent: 74,
        detail:
          "Motorcycles filter along the outer ring and hit the depression first.",
      },
      {
        id: "geometry",
        label: "Sight line",
        valueLabel: "Curve hides dip",
        percent: 60,
        detail:
          "The entry curve reduces early visual warning of the depression.",
      },
    ],
  },
  "ph-2007": {
    overallRisk: "critical",
    overallPercent: 88,
    factors: [
      {
        id: "stretch",
        label: "Defect length",
        valueLabel: "~40 m stretch",
        percent: 90,
        detail:
          "Multiple holes force repeated swerves; cones help but lanes stay active.",
      },
      {
        id: "speed",
        label: "Vehicle speed",
        valueLabel: "~72 km/h average",
        percent: 86,
        detail:
          "Dual carriageway speeds amplify impact severity if a wheel drops in.",
      },
      {
        id: "moto",
        label: "Motorcycle traffic",
        valueLabel: "38% of vehicles",
        percent: 66,
        detail:
          "Significant motorcycle flow sharing space with cars during lane changes.",
      },
    ],
  },
  "ph-2008": {
    overallRisk: "low",
    overallPercent: 22,
    factors: [
      {
        id: "repair",
        label: "Repair status",
        valueLabel: "Resurfaced",
        percent: 15,
        detail: "Overnight resurfacing closed the defect for heavy lorries.",
      },
      {
        id: "hgv",
        label: "Heavy vehicles",
        valueLabel: "High HGV share",
        percent: 70,
        detail:
          "Port access still carries heavy axle loads — schedule follow-up inspection.",
      },
      {
        id: "speed",
        label: "Vehicle speed",
        valueLabel: "~40 km/h average",
        percent: 35,
        detail: "Industrial zone speeds are typically controlled.",
      },
    ],
  },
};

const RISK_LABEL: Record<StreetRiskLevel, string> = {
  low: "Low street risk",
  medium: "Medium street risk",
  high: "High street risk",
  critical: "Critical street risk",
};

export function streetRiskLabel(level: StreetRiskLevel): string {
  return RISK_LABEL[level];
}

export function buildPotholeStreetAiInsight(
  pothole: PotholeCase,
): PotholeStreetAiInsight {
  const base = BY_ID[pothole.id] ?? {
    overallRisk: "medium" as StreetRiskLevel,
    overallPercent: 55,
    factors: [
      {
        id: "speed",
        label: "Vehicle speed",
        valueLabel: "Elevated",
        percent: 60,
        detail:
          "Local traffic model suggests above-average approach speeds on this link.",
      },
      {
        id: "moto",
        label: "Motorcycle traffic",
        valueLabel: "Notable share",
        percent: 55,
        detail:
          "Two-wheeler volume is high enough that a pothole raises accident likelihood.",
      },
    ],
  };

  const solved = pothole.status === "solved";
  const headline = solved
    ? `${pothole.roadName} — residual risk after repair`
    : `${pothole.roadName} — elevated accident risk`;

  const top = base.factors[0];
  const summary = solved
    ? `Patch is closed, but AI still flags residual exposure (${top?.label.toLowerCase() ?? "traffic"}). Overall street risk score ${base.overallPercent}%.`
    : `AI flags this street as ${base.overallRisk} risk (${base.overallPercent}%). Main driver: ${top?.label ?? "traffic"} (${top?.valueLabel ?? "elevated"}). Combined with a ${pothole.severity} pothole, crash likelihood rises.`;

  const recommendation = solved
    ? "Keep the repair under inspection for heavy-vehicle rebound cracking."
    : top?.id === "moto"
      ? "Prioritise temporary fill + cone the motorcycle filter path before peak hours."
      : top?.id === "speed"
        ? "Add temporary speed calming / warning signs until permanent patching."
        : "Schedule urgent patching and temporary traffic control.";

  return {
    ...base,
    overallPercent: solved
      ? Math.max(12, Math.round(base.overallPercent * 0.35))
      : base.overallPercent,
    overallRisk: solved
      ? base.overallRisk === "critical" || base.overallRisk === "high"
        ? "medium"
        : "low"
      : base.overallRisk,
    headline,
    summary,
    recommendation,
  };
}

export function isPotholeSolved(pothole: PotholeCase): boolean {
  return pothole.status === "solved";
}
