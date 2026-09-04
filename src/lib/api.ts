import {
  MOCK_REPORTS,
  RESPONSIBLE_PARTIES,
  getPartyById,
  getReportById,
} from "./mock-data";
import { saveDemoReport } from "./demo-store";
import type {
  Report,
  ResponsibleParty,
  WasteCategory,
} from "./types";

export interface SubmitReportPayload {
  imageDataUrl: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  wasteCategory: WasteCategory;
  wasteType: string;
  aiConfidence: number;
  responsiblePartyId: string;
  area: string;
  postcode: string;
  taman?: string;
  notes?: string;
}

export async function fetchReports(): Promise<Report[]> {
  return MOCK_REPORTS;
}

export async function fetchReport(id: string): Promise<Report | null> {
  return getReportById(id) ?? null;
}

export async function fetchParties(): Promise<ResponsibleParty[]> {
  return RESPONSIBLE_PARTIES;
}

export async function submitReport(
  payload: SubmitReportPayload,
): Promise<{ id: string; report: Report }> {
  await new Promise((resolve) => window.setTimeout(resolve, 650));

  const id = `rpt-demo-${Date.now().toString(36)}`;
  const report: Report = {
    id,
    latitude: payload.latitude,
    longitude: payload.longitude,
    wasteCategory: payload.wasteCategory,
    wasteType: payload.wasteType,
    aiConfidence: payload.aiConfidence,
    status: "new",
    imageUrl: payload.imageDataUrl,
    submittedAt: new Date().toISOString(),
    responsiblePartyId: payload.responsiblePartyId,
    area: payload.area,
    postcode: payload.postcode,
    taman: payload.taman,
    notes: payload.notes,
  };

  saveDemoReport(report);
  return { id, report };
}

export { getPartyById };
