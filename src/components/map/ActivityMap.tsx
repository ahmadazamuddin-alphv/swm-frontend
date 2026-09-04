"use client";

import { useEffect, useRef } from "react";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  type GeoJSONSource,
  type Map,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SELANGOR_CENTER, WASTE_CATEGORY_LABELS } from "@/lib/mock-data";
import { formatCoords } from "@/lib/geo";
import type { Report } from "@/lib/types";

const BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  name: "Selangor basemap",
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxzoom: 20,
    },
  },
  layers: [
    {
      id: "carto-basemap",
      type: "raster",
      source: "carto",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

const STATUS_COLOR: Record<string, string> = {
  new: "#E8C547",
  under_review: "#C45C5C",
  assigned: "#A84848",
  in_progress: "#D4A017",
  solved: "#3D8B6E",
  false_report: "#9A8F8F",
};

function reportsToGeoJson(
  reports: Report[],
  selectedId?: string | null,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: reports.map((r) => ({
      type: "Feature",
      properties: {
        id: r.id,
        status: r.status,
        category: r.wasteCategory,
        label: WASTE_CATEGORY_LABELS[r.wasteCategory],
        area: r.area,
        selected: r.id === selectedId ? 1 : 0,
        activity: r.status === "solved" ? 1 : 3,
      },
      geometry: {
        type: "Point",
        coordinates: [r.longitude, r.latitude],
      },
    })),
  };
}

function createPinElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "swm-map-pin";
  el.innerHTML = `
    <span class="swm-map-pin__dot"></span>
    <span class="swm-map-pin__pulse"></span>
  `;
  return el;
}

function addReportLayers(map: Map) {
  if (map.getSource("reports")) return;

  map.addSource("reports", {
    type: "geojson",
    data: reportsToGeoJson([]),
  });

  map.addLayer({
    id: "reports-heat",
    type: "heatmap",
    source: "reports",
    maxzoom: 13,
    paint: {
      "heatmap-weight": ["get", "activity"],
      "heatmap-intensity": 0.75,
      "heatmap-radius": 26,
      "heatmap-opacity": 0.4,
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(232,197,71,0)",
        0.2,
        "rgba(232,197,71,0.3)",
        0.55,
        "rgba(196,92,92,0.5)",
        0.9,
        "rgba(168,72,72,0.75)",
      ],
    },
  });

  // Soft halo for all points
  map.addLayer({
    id: "reports-halo",
    type: "circle",
    source: "reports",
    paint: {
      "circle-radius": [
        "case",
        ["==", ["get", "selected"], 1],
        22,
        12,
      ],
      "circle-color": [
        "case",
        ["==", ["get", "selected"], 1],
        "rgba(196,92,92,0.35)",
        "rgba(74,44,44,0.12)",
      ],
      "circle-blur": 0.35,
    },
  });

  // Coordinate points
  map.addLayer({
    id: "reports-points",
    type: "circle",
    source: "reports",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        9,
        ["case", ["==", ["get", "selected"], 1], 9, 5],
        14,
        ["case", ["==", ["get", "selected"], 1], 13, 8],
      ],
      "circle-color": [
        "match",
        ["get", "status"],
        "new",
        STATUS_COLOR.new,
        "under_review",
        STATUS_COLOR.under_review,
        "assigned",
        STATUS_COLOR.assigned,
        "in_progress",
        STATUS_COLOR.in_progress,
        "solved",
        STATUS_COLOR.solved,
        STATUS_COLOR.false_report,
      ],
      "circle-stroke-width": [
        "case",
        ["==", ["get", "selected"], 1],
        3,
        2,
      ],
      "circle-stroke-color": [
        "case",
        ["==", ["get", "selected"], 1],
        "#C45C5C",
        "#FFF8F2",
      ],
      "circle-opacity": 0.98,
    },
  });
}

export function ActivityMap({
  reports,
  selectedId,
  onSelect,
}: {
  reports: Report[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const onSelectRef = useRef(onSelect);
  const reportsRef = useRef(reports);
  const selectedRef = useRef(selectedId);
  onSelectRef.current = onSelect;
  reportsRef.current = reports;
  selectedRef.current = selectedId;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: [SELANGOR_CENTER.longitude, SELANGOR_CENTER.latitude],
      zoom: SELANGOR_CENTER.zoom,
      pitch: 48,
      bearing: -16,
      attributionControl: { compact: true },
    });

    map.addControl(
      new NavigationControl({ visualizePitch: true }),
      "top-right",
    );
    mapRef.current = map;

    const syncReports = () => {
      const source = map.getSource("reports") as GeoJSONSource | undefined;
      source?.setData(
        reportsToGeoJson(reportsRef.current, selectedRef.current),
      );
    };

    map.on("load", () => {
      addReportLayers(map);
      syncReports();
      map.resize();
    });

    map.on("click", "reports-points", (e) => {
      const id = e.features?.[0]?.properties?.id as string | undefined;
      if (id) onSelectRef.current?.(id);
    });

    map.on("mouseenter", "reports-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "reports-points", () => {
      map.getCanvas().style.cursor = "";
    });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);
    const resizeTimers = [50, 200, 500].map((ms) =>
      window.setTimeout(() => map.resize(), ms),
    );

    return () => {
      resizeTimers.forEach(clearTimeout);
      ro.disconnect();
      markerRef.current?.remove();
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const update = () => {
      if (!map.getSource("reports")) addReportLayers(map);
      const source = map.getSource("reports") as GeoJSONSource | undefined;
      source?.setData(reportsToGeoJson(reports, selectedId));
    };

    if (map.isStyleLoaded()) update();
    else map.once("load", update);
  }, [reports, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRef.current?.remove();
    markerRef.current = null;
    popupRef.current?.remove();
    popupRef.current = null;

    if (!selectedId) return;
    const report = reports.find((r) => r.id === selectedId);
    if (!report) return;

    const pin = createPinElement();
    const marker = new Marker({ element: pin, anchor: "center" })
      .setLngLat([report.longitude, report.latitude])
      .addTo(map);
    markerRef.current = marker;

    const popup = new Popup({
      offset: 18,
      closeButton: false,
      className: "swm-map-popup",
    })
      .setLngLat([report.longitude, report.latitude])
      .setHTML(
        `<strong>${WASTE_CATEGORY_LABELS[report.wasteCategory]}</strong>
         <div>${report.taman ? `${report.taman}, ` : ""}${report.area}</div>
         <code>${formatCoords(report.latitude, report.longitude)}</code>`,
      )
      .addTo(map);
    popupRef.current = popup;

    map.flyTo({
      center: [report.longitude, report.latitude],
      zoom: Math.max(map.getZoom(), 13.5),
      pitch: 55,
      essential: true,
    });
  }, [selectedId, reports]);

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-xl border border-selangor-red/10 bg-[#e8e0d4] shadow-[0_20px_50px_rgba(74,44,44,0.08)]">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-white/85 px-3 py-2 text-xs text-selangor-ink/70 backdrop-blur">
        Click a report or map point · pin = selected coordinates
      </div>
    </div>
  );
}
