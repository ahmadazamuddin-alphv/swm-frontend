import type { Report } from "./types";

const REPORT_KEY = "swm:citizen-report:v1";
const REPORT_EVENT = "swm:citizen-report-change";

export function getDemoReportSnapshot(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(REPORT_KEY) ?? "";
}

export function getDemoReportServerSnapshot(): string {
  return "";
}

export function parseDemoReport(snapshot: string): Report | null {
  if (!snapshot) return null;
  try {
    const value = JSON.parse(snapshot) as Partial<Report>;
    if (
      typeof value.id !== "string" ||
      typeof value.latitude !== "number" ||
      typeof value.longitude !== "number" ||
      typeof value.imageUrl !== "string"
    ) {
      return null;
    }
    return value as Report;
  } catch {
    return null;
  }
}

export function subscribeToDemoReport(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === REPORT_KEY) onChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(REPORT_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(REPORT_EVENT, onChange);
  };
}

export function saveDemoReport(report: Report): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REPORT_KEY, JSON.stringify(report));
  window.dispatchEvent(new Event(REPORT_EVENT));
}

export function clearDemoReport(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REPORT_KEY);
  window.dispatchEvent(new Event(REPORT_EVENT));
}
