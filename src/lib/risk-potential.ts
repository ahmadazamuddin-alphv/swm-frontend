import type { WasteCategory } from "@/lib/types";

export type RiskLevel = "low" | "medium" | "high";

export interface RiskItem {
  id: string;
  title: string;
  summary: string;
  level: RiskLevel;
}

const LEVEL_LABEL: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const BY_CATEGORY: Record<WasteCategory, RiskItem[]> = {
  tyres: [
    {
      id: "aedes",
      title: "Aedes breeding",
      summary:
        "Rainwater trapped in tyres is a classic Aedes mosquito breeding site.",
      level: "high",
    },
    {
      id: "dengue",
      title: "Dengue outbreak risk",
      summary:
        "Nearby households face elevated dengue risk if piles are left uncleared.",
      level: "high",
    },
  ],
  construction: [
    {
      id: "injury",
      title: "Public injury",
      summary: "Sharp rubble, nails, and timber can injure pedestrians and pets.",
      level: "medium",
    },
    {
      id: "drain",
      title: "Drain blockage / flash flood",
      summary: "Debris washed into drains raises local flood risk after rain.",
      level: "medium",
    },
  ],
  furniture: [
    {
      id: "fire",
      title: "Fire hazard",
      summary: "Upholstery and foam can ignite easily if vandals set fires.",
      level: "medium",
    },
    {
      id: "vermin",
      title: "Vermin shelter",
      summary: "Sofas and mattresses attract rats and cockroaches.",
      level: "low",
    },
  ],
  waste_pile: [
    {
      id: "aedes-pile",
      title: "Aedes / standing water",
      summary:
        "Containers and bags that hold rainwater can breed mosquitoes.",
      level: "high",
    },
    {
      id: "odour",
      title: "Odour & pests",
      summary: "Mixed piles draw flies, rats, and complaints from residents.",
      level: "medium",
    },
  ],
  e_waste: [
    {
      id: "toxic",
      title: "Toxic leachate",
      summary:
        "Batteries and circuit boards can leak heavy metals into soil and drains.",
      level: "high",
    },
    {
      id: "shock",
      title: "Electrical hazard",
      summary: "Damaged appliances may still hold residual charge.",
      level: "medium",
    },
  ],
  organic: [
    {
      id: "leachate",
      title: "Leachate & smell",
      summary: "Rotting green waste produces leachate and strong odour.",
      level: "medium",
    },
    {
      id: "pests",
      title: "Pest attraction",
      summary: "Food and garden waste attract flies and scavengers.",
      level: "low",
    },
  ],
  mixed: [
    {
      id: "unknown",
      title: "Mixed hazards",
      summary:
        "Unknown contents may include sharp, chemical, or mosquito-breeding items.",
      level: "medium",
    },
  ],
};

/** Keyword overlays — e.g. tyres mentioned in free-text detail */
function keywordRisks(wasteType: string): RiskItem[] {
  const t = wasteType.toLowerCase();
  if (/\btyres?\b|\btires?\b|\bban\b/.test(t)) {
    return BY_CATEGORY.tyres;
  }
  if (/\bdrum\b|\bcontainer\b|\bbucket\b/.test(t)) {
    return [
      {
        id: "water-vessel",
        title: "Aedes breeding vessels",
        summary: "Open drums and containers collect rainwater for mosquitoes.",
        level: "high",
      },
    ];
  }
  return [];
}

export function getRiskPotential(
  category: WasteCategory,
  wasteType = "",
): RiskItem[] {
  const fromKeywords = keywordRisks(wasteType);
  const fromCategory = BY_CATEGORY[category] ?? BY_CATEGORY.mixed;
  const merged = [...fromKeywords, ...fromCategory];
  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.id) || seen.has(item.title)) return false;
    seen.add(item.id);
    seen.add(item.title);
    return true;
  });
}

export function riskLevelLabel(level: RiskLevel): string {
  return LEVEL_LABEL[level];
}

export function highestRiskLevel(items: RiskItem[]): RiskLevel {
  if (items.some((i) => i.level === "high")) return "high";
  if (items.some((i) => i.level === "medium")) return "medium";
  return "low";
}
