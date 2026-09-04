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

/**
 * Client-side POC classifier. When Laravel AI is wired, POST the frame to
 * `/waste/classify` and return the server suggestion instead.
 */
export async function classifyWasteFromImage(
  imageDataUrl: string,
): Promise<WasteClassification> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (base) {
    try {
      const res = await fetch(`${base}/waste/classify`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageDataUrl }),
      });
      if (res.ok) {
        return (await res.json()) as WasteClassification;
      }
    } catch {
      // fall through to local heuristic
    }
  }

  // Simulate network / model latency for demo UX
  await new Promise((r) => setTimeout(r, 900));

  const hash = imageDataUrl.length + imageDataUrl.charCodeAt(80 % imageDataUrl.length);
  const pick = HEURISTICS[hash % HEURISTICS.length];
  const confidence = 0.72 + ((hash % 20) / 100);

  return {
    wasteCategory: pick.wasteCategory,
    wasteType: pick.wasteType,
    confidence: Math.min(0.95, confidence),
  };
}
