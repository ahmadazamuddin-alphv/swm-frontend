import type { Report, WasteCategory } from "@/lib/types";

export interface AiReasoningStep {
  id: string;
  label: string;
  detail: string;
}

export interface AiInsight {
  headline: string;
  confidence: number;
  visualCues: string[];
  reasoning: AiReasoningStep[];
  alternateCategories: Array<{ category: WasteCategory; likelihood: number }>;
  departmentRationale: string;
}

const CUE_BY_CATEGORY: Record<WasteCategory, string[]> = {
  tyres: [
    "Circular rubber profiles / tread patterns",
    "Stacked or scattered tyre casings",
    "Possible water-retaining cavities",
  ],
  construction: [
    "Angular rubble / broken concrete edges",
    "Timber offcuts or cement bags",
    "Dusty, mixed renovation debris",
  ],
  furniture: [
    "Upholstery fabric / foam volumes",
    "Wardrobe or mattress outlines",
    "Bulky household discards",
  ],
  waste_pile: [
    "Loose bags and mixed refuse clusters",
    "Irregular pile geometry near drains / lots",
    "Household packaging fragments",
  ],
  e_waste: [
    "Rectangular appliance / CRT silhouettes",
    "Plastic casings and cable bundles",
    "Metallic / circuit-board textures",
  ],
  organic: [
    "Green vegetation / branch texture",
    "Garden cuttings pile shape",
    "Earth and leaf litter tones",
  ],
  mixed: [
    "Heterogeneous colours and materials",
    "No single dominant waste shape",
    "Bags + loose refuse combination",
  ],
};

const ALTERNATES: Record<
  WasteCategory,
  Array<{ category: WasteCategory; likelihood: number }>
> = {
  tyres: [
    { category: "waste_pile", likelihood: 0.18 },
    { category: "mixed", likelihood: 0.09 },
  ],
  construction: [
    { category: "mixed", likelihood: 0.16 },
    { category: "waste_pile", likelihood: 0.11 },
  ],
  furniture: [
    { category: "waste_pile", likelihood: 0.14 },
    { category: "mixed", likelihood: 0.1 },
  ],
  waste_pile: [
    { category: "mixed", likelihood: 0.22 },
    { category: "organic", likelihood: 0.08 },
  ],
  e_waste: [
    { category: "mixed", likelihood: 0.15 },
    { category: "furniture", likelihood: 0.07 },
  ],
  organic: [
    { category: "waste_pile", likelihood: 0.17 },
    { category: "mixed", likelihood: 0.09 },
  ],
  mixed: [
    { category: "waste_pile", likelihood: 0.2 },
    { category: "construction", likelihood: 0.12 },
  ],
};

export function buildAiInsight(report: Report): AiInsight {
  const category = report.wasteCategory;
  const cues = CUE_BY_CATEGORY[category];

  return {
    headline: `Model classified this scene as ${category.replaceAll("_", " ")}`,
    confidence: report.aiConfidence,
    visualCues: cues,
    reasoning: [
      {
        id: "frame",
        label: "Frame intake",
        detail:
          "Live-camera still accepted; gallery upload path blocked for authenticity.",
      },
      {
        id: "vision",
        label: "Vision features",
        detail: `Detected cues: ${cues.slice(0, 2).join("; ")}.`,
      },
      {
        id: "classify",
        label: "Category decision",
        detail: `Top label “${report.wasteType}” with ${(report.aiConfidence * 100).toFixed(0)}% confidence. Citizen may still edit before ops review.`,
      },
      {
        id: "geo",
        label: "Location context",
        detail: `GPS ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)} mapped to ${report.taman ? `${report.taman}, ` : ""}${report.area}.`,
      },
      {
        id: "routing",
        label: "Department routing",
        detail:
          "Suggested jabatan from zone coverage + waste class (POC heuristic).",
      },
      {
        id: "risk",
        label: "Risk inference",
        detail:
          "Risk potential derived from waste class keywords (e.g. tyres → Aedes / dengue).",
      },
    ],
    alternateCategories: ALTERNATES[category],
    departmentRationale:
      "Zone polygon match + waste class heuristics choose the responsible party for this POC. Live routing will come from the Laravel ops API.",
  };
}
