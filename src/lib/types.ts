export type ReportStatus =
  | "new"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "solved"
  | "false_report";

export type WasteCategory =
  | "construction"
  | "furniture"
  | "waste_pile"
  | "tyres"
  | "e_waste"
  | "organic"
  | "mixed";

export interface ResponsibleParty {
  id: string;
  department: string;
  contractor: string;
  contactPerson: string;
  phone: string;
  email: string;
  zoneCoverage: string[];
  areaKey: string;
}

export interface Report {
  id: string;
  latitude: number;
  longitude: number;
  wasteCategory: WasteCategory;
  wasteType: string;
  aiConfidence: number;
  status: ReportStatus;
  imageUrl: string;
  submittedAt: string;
  solvedAt?: string;
  responsiblePartyId: string;
  area: string;
  postcode: string;
  taman?: string;
  notes?: string;
}

export interface WasteClassification {
  wasteCategory: WasteCategory;
  wasteType: string;
  confidence: number;
}

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface PlaceInfo {
  city: string;
  state: string;
  source: "nominatim" | "local";
}

export type PotholeSeverity = "low" | "medium" | "high" | "critical";

export type PotholeStatus =
  | "new"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "solved"
  | "false_report";

export interface PotholeCase {
  id: string;
  latitude: number;
  longitude: number;
  severity: PotholeSeverity;
  status: PotholeStatus;
  title: string;
  description: string;
  imageUrl: string;
  submittedAt: string;
  solvedAt?: string;
  responsiblePartyId: string;
  area: string;
  postcode: string;
  roadName: string;
  depthCm?: number;
  notes?: string;
}
