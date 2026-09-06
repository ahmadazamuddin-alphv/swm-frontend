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
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CrosshairIcon,
} from "@/components/ui/Icons";
import { CameraCapture } from "./CameraCapture";
import { RiskPotentialPanel } from "./RiskPotentialPanel";
import { PartyPanel } from "@/components/parties/PartyPanel";

type Step = "capture" | "review" | "done";
type LocationState = "locating" | "ready" | "blocked";

const CATEGORIES = Object.keys(WASTE_CATEGORY_LABELS) as WasteCategory[];

const POSTCODE_BY_CITY: Record<string, string> = {
  "Shah Alam": "40000",
  "Petaling Jaya": "46000",
  Klang: "41000",
  "Subang Jaya": "47500",
  Puchong: "47100",
};

export function ReportWizard() {
  const [step, setStep] = useState<Step>("capture");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [locationState, setLocationState] =
    useState<LocationState>("locating");
  const [placeLoading, setPlaceLoading] = useState(false);
  const [gpsNote, setGpsNote] = useState<string | null>(null);
  const [wasteCategory, setWasteCategory] =
    useState<WasteCategory>("mixed");
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
        const nextPosition = await getCurrentPosition();
        if (cancelled) return;
        setPosition(nextPosition);
        setLocationState("ready");
        setPlaceLoading(true);
        const nextPlace = await reverseGeocode(
          nextPosition.latitude,
          nextPosition.longitude,
        );
        if (cancelled) return;
        setPlace(nextPlace);
        setPlaceLoading(false);
      } catch (caught) {
        if (cancelled) return;
        setLocationState("blocked");
        setGpsNote(
          caught instanceof Error
            ? caught.message
            : "Location permission is unavailable.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function applyDemoLocation() {
    setPosition(DEMO_FALLBACK_POSITION);
    setLocationState("ready");
    setGpsNote("Using the fixed Shah Alam presentation location.");
    setPlaceLoading(true);
    const nextPlace = await reverseGeocode(
      DEMO_FALLBACK_POSITION.latitude,
      DEMO_FALLBACK_POSITION.longitude,
    );
    setPlace(nextPlace);
    setPlaceLoading(false);
  }

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
      setError("The category suggestion failed. Select one manually.");
    } finally {
      setClassifying(false);
    }
  }

  async function handleSubmit() {
    if (!imageDataUrl || !position || !party) return;
    setSubmitting(true);
    setError(null);

    try {
      const area = place?.city ?? party.zoneCoverage[0] ?? "Shah Alam";
      const { id } = await submitReport({
        imageDataUrl,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        wasteCategory,
        wasteType,
        aiConfidence: confidence,
        responsiblePartyId: party.id,
        area,
        postcode: POSTCODE_BY_CITY[area] ?? "40000",
        taman: gpsNote ? "Seksyen 7" : undefined,
        notes: notes.trim() || undefined,
      });
      setSubmittedId(id);
      setStep("done");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The report could not be saved. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done" && submittedId) {
    return (
      <section className="grid overflow-hidden rounded-[36px] bg-graphite text-snow lg:grid-cols-[1.25fr_0.75fr]">
        <div className="p-8 sm:p-12 lg:p-16">
          <span className="grid size-12 place-items-center rounded-[14px] bg-ember text-snow">
            <CheckIcon className="size-6" />
          </span>
          <h1 className="text-balance mt-8 max-w-[680px] text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl">
            Your report is now part of the map.
          </h1>
          <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-mist">
            Reference <span className="font-medium text-snow">{submittedId}</span>.
            The report is stored locally for this hardcoded POC and will appear
            at the top of the citizen dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-[14px] bg-snow px-5 py-3 text-sm font-medium text-graphite hover:-translate-y-0.5"
            >
              View it on the map
              <ArrowRightIcon className="size-4" />
            </Link>
            <button
              type="button"
              className="rounded-[14px] border border-iron px-5 py-3 text-sm font-medium text-snow hover:border-steel hover:bg-slate"
              onClick={() => {
                setStep("capture");
                setImageDataUrl(null);
                setSubmittedId(null);
                setNotes("");
              }}
            >
              Report another site
            </button>
          </div>
        </div>
        <div className="border-t border-iron bg-slate p-8 lg:border-l lg:border-t-0 lg:p-10">
          <p className="text-sm font-medium text-snow">POC workflow complete</p>
          <ol className="mt-6 space-y-4 text-sm text-mist">
            {[
              "Live photo captured",
              "Coordinates attached",
              "Waste category suggested",
              "Responsible party matched",
              "Hotspot saved locally",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-xl border border-steel">
                  <CheckIcon className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-6">
      <section>
        <div className="flex items-center gap-3 text-xs text-fog">
          <span className="rounded-xl bg-ember px-2.5 py-1 font-medium text-snow">
            Step {step === "capture" ? "1" : "2"} of 2
          </span>
          <span>{step === "capture" ? "Capture evidence" : "Review report"}</span>
        </div>
        <h1 className="text-balance mt-5 max-w-[720px] text-4xl font-semibold leading-[1.06] tracking-[-0.03em] text-obsidian sm:text-5xl">
          {step === "capture"
            ? "Report what is happening, where it is happening."
            : "Confirm the evidence before it joins the map."}
        </h1>
        <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-steel">
          {step === "capture"
            ? "Live camera evidence and GPS establish the hotspot. No gallery upload is available in this citizen flow."
            : "The category and department are simulated locally for this POC. You can correct the category before saving."}
        </p>

        <div className="mt-8">
          {step === "capture" && <CameraCapture onCapture={handleCapture} />}

          {step === "review" && imageDataUrl && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageDataUrl}
                alt="Captured illegal-dumping site"
                className="aspect-[4/3] w-full rounded-[32px] border border-[#ead9b8] object-cover shadow-[0_20px_44px_rgba(64,35,10,0.14)]"
              />

              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-[14px] border border-[#ead9b8] bg-[#fff8ea]/95 px-4 py-2.5 text-sm font-medium text-[#6e5c4b] shadow-[0_8px_18px_rgba(64,35,10,0.07)] hover:border-[#D2222B] hover:text-[#a91824]"
                onClick={() => {
                  setStep("capture");
                  setImageDataUrl(null);
                }}
              >
                <ArrowLeftIcon className="size-4" />
                Retake live photo
              </button>

              <div className="mt-7 grid gap-5 rounded-[32px] border border-[#ead9b8] bg-[#fff8ea]/95 p-6 shadow-[0_16px_36px_rgba(64,35,10,0.09)] backdrop-blur sm:grid-cols-2 sm:p-7">
                <label className="block space-y-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-obsidian">
                    Waste category
                    <span className="rounded-xl bg-ember px-2 py-0.5 text-[10px] font-medium text-snow">
                      {classifying ? "Identifying" : "AI suggestion"}
                    </span>
                  </span>
                  <select
                    className="h-11 w-full rounded-[14px] border border-cloud bg-snow px-3 text-graphite outline-none hover:border-mist disabled:opacity-50"
                    value={wasteCategory}
                    disabled={classifying}
                    onChange={(event) =>
                      setWasteCategory(event.target.value as WasteCategory)
                    }
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {WASTE_CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2 text-sm">
                  <span className="font-medium text-obsidian">
                    Waste description
                  </span>
                  <input
                    className="h-11 w-full rounded-[14px] border border-cloud bg-snow px-3 text-graphite outline-none placeholder:text-ash hover:border-mist disabled:opacity-50"
                    value={wasteType}
                    disabled={classifying}
                    onChange={(event) => setWasteType(event.target.value)}
                  />
                  {!classifying && confidence > 0 && (
                    <span className="tabular-nums block text-xs text-fog">
                      Simulated confidence {Math.round(confidence * 100)}%
                    </span>
                  )}
                </label>

                <label className="block space-y-2 text-sm sm:col-span-2">
                  <span className="font-medium text-obsidian">
                    Site notes <span className="font-normal text-fog">optional</span>
                  </span>
                  <textarea
                    className="min-h-[104px] w-full resize-y rounded-[14px] border border-cloud bg-snow px-3 py-3 text-graphite outline-none placeholder:text-ash hover:border-mist"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add a landmark or access note"
                  />
                </label>

                {error && (
                  <p
                    className="text-sm text-graphite sm:col-span-2"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  disabled={submitting || classifying || !party}
                  onClick={() => void handleSubmit()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#2c2e34] bg-obsidian px-5 py-3.5 text-sm font-medium text-snow shadow-[inset_0_0.5px_0_rgba(255,255,255,0.5),inset_0_9px_14px_-5px_rgba(117,123,133,0.4),0_4px_6px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 sm:col-span-2"
                >
                  {submitting ? "Saving report…" : "Add report to activity map"}
                  {!submitting && <ArrowRightIcon className="size-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4 lg:pt-[76px]">
        <section className="rounded-[36px] border border-cloud bg-snow p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-fog">Site location</p>
              <h2 className="mt-2 text-lg font-semibold text-obsidian">
                {locationState === "locating"
                  ? "Reading GPS"
                  : locationState === "blocked"
                    ? "Location needed"
                    : placeLoading && !place
                      ? "Resolving place"
                      : (place?.city ?? "Coordinates ready")}
              </h2>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-obsidian text-snow">
              <CrosshairIcon className="size-5" />
            </span>
          </div>

          {position ? (
            <>
              <p className="mt-1 text-sm text-fog">{place?.state ?? "Selangor"}</p>
              <dl className="mt-5 divide-y divide-cloud text-xs">
                <div className="flex justify-between gap-3 py-2.5">
                  <dt className="text-fog">Coordinates</dt>
                  <dd className="tabular-nums text-right font-mono text-graphite">
                    {formatCoords(position.latitude, position.longitude)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 py-2.5">
                  <dt className="text-fog">Accuracy</dt>
                  <dd className="tabular-nums text-right text-graphite">
                    {position.accuracy != null
                      ? `±${Math.round(position.accuracy)} m`
                      : "Unknown"}
                  </dd>
                </div>
              </dl>
              {gpsNote && (
                <p className="mt-3 text-xs leading-relaxed text-fog">{gpsNote}</p>
              )}
            </>
          ) : locationState === "blocked" ? (
            <div className="mt-5">
              <p className="text-sm leading-relaxed text-steel">{gpsNote}</p>
              <button
                type="button"
                onClick={() => void applyDemoLocation()}
                className="mt-4 w-full rounded-[14px] border border-cloud bg-paper px-4 py-2.5 text-sm font-medium text-graphite hover:border-mist hover:bg-snow"
              >
                Use Shah Alam demo location
              </button>
            </div>
          ) : (
            <p className="mt-5 text-sm text-fog" aria-live="polite">
              Allow location access when the browser asks.
            </p>
          )}
        </section>

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
