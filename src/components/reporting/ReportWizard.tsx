"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { submitReport } from "@/lib/api";
import {
  DEMO_FALLBACK_POSITION,
  formatCoords,
  getCurrentPosition,
  reverseGeocode,
} from "@/lib/geo";
import {
  WASTE_CATEGORY_LABELS,
  suggestPartyForCoords,
} from "@/lib/mock-data";
import type { GeoPosition, PlaceInfo, WasteCategory } from "@/lib/types";
import { classifyWasteFromImage } from "@/lib/waste-ai";
import { CameraCapture } from "./CameraCapture";
import { RiskPotentialPanel } from "./RiskPotentialPanel";
import { PartyPanel } from "@/components/parties/PartyPanel";

type Step = "capture" | "review" | "done";

const CATEGORIES = Object.keys(WASTE_CATEGORY_LABELS) as WasteCategory[];

export function ReportWizard() {
  const [step, setStep] = useState<Step>("capture");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [gpsNote, setGpsNote] = useState<string | null>(null);
  const [wasteCategory, setWasteCategory] = useState<WasteCategory>("mixed");
  const [wasteType, setWasteType] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [classifying, setClassifying] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const party = useMemo(() => {
    if (!position) return null;
    return suggestPartyForCoords(position.latitude, position.longitude);
  }, [position]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const pos = await getCurrentPosition();
        if (!cancelled) {
          setPosition(pos);
          setGpsNote(null);
        }
      } catch {
        if (!cancelled) {
          setPosition(DEMO_FALLBACK_POSITION);
          setGpsNote(
            "GPS unavailable — using Shah Alam demo coordinates for the POC.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!position) return;
    let cancelled = false;
    setPlaceLoading(true);
    void (async () => {
      const resolved = await reverseGeocode(
        position.latitude,
        position.longitude,
      );
      if (!cancelled) {
        setPlace(resolved);
        setPlaceLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [position]);

  async function handleCapture(dataUrl: string) {
    setImageDataUrl(dataUrl);
    setClassifying(true);
    setError(null);
    setStep("review");
    try {
      const result = await classifyWasteFromImage(dataUrl);
      setWasteCategory(result.wasteCategory);
      setWasteType(result.wasteType);
      setConfidence(result.confidence);
    } catch {
      setWasteCategory("mixed");
      setWasteType("Unclassified waste");
      setConfidence(0.5);
      setError("AI suggestion failed — please pick a category manually.");
    } finally {
      setClassifying(false);
    }
  }

  async function handleSubmit() {
    if (!imageDataUrl || !position || !party) return;
    setSubmitting(true);
    setError(null);
    try {
      const { id } = await submitReport({
        imageDataUrl,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        wasteCategory,
        wasteType,
        aiConfidence: confidence,
        responsiblePartyId: party.id,
        notes: notes.trim() || undefined,
      });
      setSubmittedId(id);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done" && submittedId) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-selangor-red/80">
          Report received
        </p>
        <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-selangor-ink">
          Terima kasih — your tip is in the queue.
        </h2>
        <p className="text-selangor-ink/70">
          Reference <span className="font-medium text-selangor-ink">{submittedId}</span>.
          In production this syncs to the Laravel ops queue.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="rounded-md bg-selangor-red px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-selangor-red-deep"
          >
            Open dashboard
          </Link>
          <button
            type="button"
            className="rounded-md border border-selangor-red/25 bg-white/70 px-5 py-2.5 text-sm font-medium text-selangor-ink hover:border-selangor-yellow"
            onClick={() => {
              setStep("capture");
              setImageDataUrl(null);
              setSubmittedId(null);
              setNotes("");
            }}
          >
            Report another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-selangor-red/80">
          Step {step === "capture" ? "1" : "2"} of 2
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl text-selangor-ink sm:text-4xl">
          {step === "capture" ? "Capture on site" : "Confirm & submit"}
        </h1>
        <p className="mt-2 max-w-md text-selangor-ink/70">
          {step === "capture"
            ? "Live camera only — no gallery uploads. GPS tags the hotspot as it changes."
            : "Review the AI waste suggestion and responsible jabatan before sending."}
        </p>

        <div className="mt-8">
          {step === "capture" && <CameraCapture onCapture={handleCapture} />}

          {step === "review" && imageDataUrl && (
            <div className="space-y-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageDataUrl}
                alt="Captured dumping site"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              <button
                type="button"
                className="text-sm font-medium text-selangor-red hover:underline"
                onClick={() => {
                  setStep("capture");
                  setImageDataUrl(null);
                }}
              >
                ← Retake with live camera
              </button>

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-selangor-ink">
                  Waste category
                  {classifying && (
                    <span className="ml-2 text-xs font-normal text-selangor-ink/50">
                      AI identifying…
                    </span>
                  )}
                </span>
                <select
                  className="w-full rounded-md border border-selangor-red/15 bg-white/80 px-3 py-2 outline-none focus:border-selangor-red/40"
                  value={wasteCategory}
                  disabled={classifying}
                  onChange={(e) =>
                    setWasteCategory(e.target.value as WasteCategory)
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {WASTE_CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-selangor-ink">
                  Detail (editable)
                </span>
                <input
                  className="w-full rounded-md border border-selangor-red/15 bg-white/80 px-3 py-2 outline-none focus:border-selangor-red/40"
                  value={wasteType}
                  disabled={classifying}
                  onChange={(e) => setWasteType(e.target.value)}
                />
                {!classifying && confidence > 0 && (
                  <span className="text-xs text-selangor-ink/50">
                    AI confidence {Math.round(confidence * 100)}%
                  </span>
                )}
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-selangor-ink">
                  Notes (optional)
                </span>
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-selangor-red/15 bg-white/80 px-3 py-2 outline-none focus:border-selangor-red/40"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Landmark, access notes…"
                />
              </label>

              {error && (
                <p className="text-sm text-selangor-red-deep">{error}</p>
              )}

              <button
                type="button"
                disabled={submitting || classifying || !party}
                onClick={() => void handleSubmit()}
                className="w-full rounded-md bg-selangor-red px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-selangor-red-deep disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit report"}
              </button>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-4 lg:pt-16">
        <div className="rounded-lg border border-selangor-red/10 bg-white/55 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-selangor-red/80">
            Location
          </p>
          {position ? (
            <>
              {placeLoading && !place ? (
                <p className="mt-2 text-sm text-selangor-ink/60">
                  Resolving city…
                </p>
              ) : place ? (
                <>
                  <p className="mt-2 font-[family-name:var(--font-fraunces)] text-xl text-selangor-ink">
                    {place.city}
                  </p>
                  <p className="mt-0.5 text-sm text-selangor-ink/70">
                    {place.state}
                  </p>
                </>
              ) : null}
              <dl className="mt-3 space-y-1.5 text-xs text-selangor-ink/55">
                <div className="flex justify-between gap-3">
                  <dt>Coordinates</dt>
                  <dd className="text-right font-mono text-selangor-ink/80">
                    {formatCoords(position.latitude, position.longitude)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Accuracy</dt>
                  <dd className="text-right text-selangor-ink/80">
                    {position.accuracy != null
                      ? `±${Math.round(position.accuracy)} m`
                      : "unknown"}
                  </dd>
                </div>
              </dl>
              {gpsNote && (
                <p className="mt-2 text-xs text-selangor-ink/60">{gpsNote}</p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-selangor-ink/60">Reading GPS…</p>
          )}
        </div>

        <PartyPanel party={party} highlight />

        {step === "review" && (
          <RiskPotentialPanel
            category={wasteCategory}
            wasteType={wasteType}
            loading={classifying}
          />
        )}
      </aside>
    </div>
  );
}
