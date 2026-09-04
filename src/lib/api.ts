import { MOCK_REPORTS, getPartyById, getReportById } from "./mock-data";
import type { Report, ResponsibleParty } from "./types";

const USE_MOCK = true;

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchReports(): Promise<Report[]> {
  if (USE_MOCK || !apiBase()) {
    return MOCK_REPORTS;
  }
  return getJson<Report[]>("/reports");
}

export async function fetchReport(id: string): Promise<Report | null> {
  if (USE_MOCK || !apiBase()) {
    return getReportById(id) ?? null;
  }
  try {
    return await getJson<Report>(`/reports/${id}`);
  } catch {
    return null;
  }
}

export async function fetchParties(): Promise<ResponsibleParty[]> {
  if (USE_MOCK || !apiBase()) {
    const { RESPONSIBLE_PARTIES } = await import("./mock-data");
    return RESPONSIBLE_PARTIES;
  }
  return getJson<ResponsibleParty[]>("/responsible-parties");
}

export async function submitReport(payload: {
  imageDataUrl: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  wasteCategory: string;
  wasteType: string;
  aiConfidence: number;
  responsiblePartyId: string;
  notes?: string;
}): Promise<{ id: string }> {
  if (USE_MOCK || !apiBase()) {
    const id = `rpt-local-${Date.now().toString(36)}`;
    console.info("[mock submit]", { id, ...payload, imageDataUrl: "[omitted]" });
    return { id };
  }

  const res = await fetch(`${apiBase()}/reports`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Submit failed: ${res.status}`);
  }
  return res.json() as Promise<{ id: string }>;
}

export { getPartyById };
