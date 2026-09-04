import type { WasteCategory, WasteClassification } from "./types";

const HEURISTICS: Array<{
  keywords: string[];
  wasteCategory: WasteCategory;
  wasteType: string;
}> = [
  {
    keywords: ["tyre", "tire", "rubber"],
    wasteCategory: "tyres",
    wasteType: "Discarded tyres",
  },
  {
    keywords: ["concrete", "brick", "timber", "rubble"],
    wasteCategory: "construction",
    wasteType: "Construction rubble & timber",
  },
  {
    keywords: ["sofa", "mattress", "wardrobe", "furniture"],
    wasteCategory: "furniture",
    wasteType: "Discarded furniture",
  },
  {
    keywords: ["monitor", "laptop", "crt", "electronics"],
    wasteCategory: "e_waste",
    wasteType: "Electronic waste",
  },
  {
    keywords: ["garden", "branch", "leaves", "organic"],
    wasteCategory: "organic",
    wasteType: "Organic / green waste",
  },
];

/** Deterministic client-side classifier used only by the hardcoded POC. */
export async function classifyWasteFromImage(
  imageDataUrl: string,
): Promise<WasteClassification> {
  await new Promise((resolve) => window.setTimeout(resolve, 900));

  const hash = imageDataUrl.length + imageDataUrl.charCodeAt(80 % imageDataUrl.length);
  const pick = HEURISTICS[hash % HEURISTICS.length];
  const confidence = 0.72 + ((hash % 20) / 100);

  return {
    wasteCategory: pick.wasteCategory,
    wasteType: pick.wasteType,
    confidence: Math.min(0.95, confidence),
  };
}
