"use client";

import { useEffect, useRef } from "react";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type GeoJSONSource,
  type Map,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BuildingsIcon } from "@/components/ui/Icons";
import {
  ACTIVITY_REPORT_SOURCE_ID,
  buildActivityMapPlan,
  createPotholeDiamondImage,
  shouldDeferReportFocus,
  type ActivityMapPoint,
  type MapCaseKind,
} from "@/components/map/activity-map-plan";
import { formatCoords } from "@/lib/geo";

setWorkerUrl("/maplibre-gl-worker.mjs");

const CITY_VIEW = {
  longitude: 101.5166,
  latitude: 3.0728,
  zoom: 14.35,
  pitch: 62,
  bearing: -22,
};

const ACTIVITY_BOUNDS: [[number, number], [number, number]] = [
  [101.395, 2.982],
  [101.646, 3.128],
];

const BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/bright";

export type MapSelectableCase = {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  /** Used for pothole severity colouring; ignored for dumping dots */
  colorKey?: string;
  title: string;
  area: string;
  subtitle?: string;
};

function toMapPoints(
  cases: MapSelectableCase[],
  kind: MapCaseKind,
  selectedId?: string | null,
): ActivityMapPoint[] {
  return cases.map((item) => ({
    id: item.id,
    longitude: item.longitude,
    latitude: item.latitude,
    status: item.status,
    category: item.colorKey ?? item.status,
    label: item.title,
    area: item.area,
    selected: item.id === selectedId,
    kind,
  }));
}

function createPinElement(kind: MapCaseKind): HTMLDivElement {
  const element = document.createElement("div");
  const dot = document.createElement("span");
  const pulse = document.createElement("span");
  element.className =
    kind === "pothole" ? "swm-map-pin swm-map-pin--pothole" : "swm-map-pin";
  dot.className = "swm-map-pin__dot";
  pulse.className = "swm-map-pin__pulse";
  element.append(dot, pulse);
  return element;
}

function createPopupContent(item: MapSelectableCase): HTMLDivElement {
  const root = document.createElement("div");
  const title = document.createElement("p");
  const meta = document.createElement("p");
  const coords = document.createElement("code");

  title.className = "swm-map-popup__title";
  title.textContent = item.title;
  meta.className = "swm-map-popup__meta";
  meta.textContent = item.subtitle
    ? `${item.subtitle} · ${item.area}`
    : item.area;
  coords.className = "swm-map-popup__coords";
  coords.textContent = formatCoords(item.latitude, item.longitude);

  root.append(title, meta, coords);
  return root;
}

function tuneBaseMap(map: Map) {
  for (const layer of map.getStyle().layers) {
    const id = layer.id.toLowerCase();

    if (layer.type === "background") {
      map.setPaintProperty(layer.id, "background-color", "#f4f4f5");
    }

    if (layer.type === "fill") {
      const color = id.includes("water")
        ? "#d4d4d8"
        : id.includes("park") || id.includes("landcover")
          ? "#ececee"
          : "#f4f4f5";
      map.setPaintProperty(layer.id, "fill-color", color);
    }

    if (layer.type === "line") {
      map.setPaintProperty(
        layer.id,
        "line-color",
        id.includes("road") ? "#ffffff" : "#a1a1aa",
      );
    }

    if (layer.type === "symbol") {
      if (layer.layout?.["text-field"]) {
        map.setPaintProperty(layer.id, "text-color", "#52525b");
        map.setPaintProperty(layer.id, "text-halo-color", "#f4f4f5");
      }
      if (layer.layout?.["icon-image"]) {
        map.setPaintProperty(layer.id, "icon-opacity", 0.72);
      }
    }
  }
}

function ensurePotholeIcon(map: Map) {
  if (map.hasImage("pothole-diamond")) return;
  const image = createPotholeDiamondImage(48);
  map.addImage("pothole-diamond", image, { pixelRatio: 2 });
}

function installActivityLayers(
  map: Map,
  cases: MapSelectableCase[],
  mode: MapCaseKind,
  selectedId?: string | null,
) {
  ensurePotholeIcon(map);

  const plan = buildActivityMapPlan(
    map.getStyle(),
    toMapPoints(cases, mode, selectedId),
    mode,
  );

  const existingSource = map.getSource(
    ACTIVITY_REPORT_SOURCE_ID,
  ) as GeoJSONSource | undefined;

  if (existingSource) {
    existingSource.setData(plan.reportSource.data);
  } else {
    map.addSource(ACTIVITY_REPORT_SOURCE_ID, plan.reportSource);
  }

  // Re-apply paint when switching modes
  const syncLayer = (
    layer:
      | typeof plan.reportHeatLayer
      | typeof plan.reportHaloLayer
      | typeof plan.reportPointLayer,
  ) => {
    if (!map.getLayer(layer.id)) {
      map.addLayer(layer);
      return;
    }
    if (layer.paint) {
      for (const [key, value] of Object.entries(layer.paint)) {
        try {
          map.setPaintProperty(
            layer.id,
            key as Parameters<Map["setPaintProperty"]>[1],
            value,
          );
        } catch {
          // ignore unsupported runtime paint keys
        }
      }
    }
  };

  syncLayer(plan.reportHeatLayer);
  syncLayer(plan.reportHaloLayer);
  syncLayer(plan.reportPointLayer);

  if (plan.potholeSymbolLayer) {
    if (!map.getLayer(plan.potholeSymbolLayer.id)) {
      map.addLayer(plan.potholeSymbolLayer);
    } else if (plan.potholeSymbolLayer.layout) {
      for (const [key, value] of Object.entries(
        plan.potholeSymbolLayer.layout,
      )) {
        try {
          map.setLayoutProperty(
            plan.potholeSymbolLayer.id,
            key as Parameters<Map["setLayoutProperty"]>[1],
            value,
          );
        } catch {
          // ignore
        }
      }
    }
  } else if (map.getLayer("pothole-symbols")) {
    map.removeLayer("pothole-symbols");
  }

  if (!map.getLayer("real-buildings-3d") && plan.buildingLayer) {
    tuneBaseMap(map);
    map.addLayer(plan.buildingLayer, plan.buildingBeforeId);

    for (const layerId of ["building", "building-top"]) {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", "none");
      }
    }
  }
}

function showActivityOverview(map: Map) {
  const compact = map.getContainer().clientWidth < 600;
  map.fitBounds(ACTIVITY_BOUNDS, {
    padding: compact ? 34 : 58,
    maxZoom: compact ? 10.8 : 11.4,
    pitch: 32,
    bearing: -12,
    duration: 1100,
    essential: false,
  });
}

export function ActivityMap({
  cases,
  mode = "dumping",
  selectedId,
  onSelect,
}: {
  cases: MapSelectableCase[];
  mode?: MapCaseKind;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const onSelectRef = useRef(onSelect);
  const casesRef = useRef(cases);
  const selectedRef = useRef(selectedId);
  const modeRef = useRef(mode);

  useEffect(() => {
    onSelectRef.current = onSelect;
    casesRef.current = cases;
    selectedRef.current = selectedId;
    modeRef.current = mode;
  }, [onSelect, cases, selectedId, mode]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: [CITY_VIEW.longitude, CITY_VIEW.latitude],
      zoom: CITY_VIEW.zoom,
      pitch: 48,
      bearing: -16,
      maxPitch: 75,
      canvasContextAttributes: { antialias: true },
      attributionControl: { compact: true },
    });

    map.addControl(
      new NavigationControl({ visualizePitch: true }),
      "top-right",
    );
    mapRef.current = map;

    map.on("load", () => {
      installActivityLayers(
        map,
        casesRef.current,
        modeRef.current,
        selectedRef.current,
      );
      map.resize();
      map.easeTo({
        center: [CITY_VIEW.longitude, CITY_VIEW.latitude],
        zoom: CITY_VIEW.zoom,
        pitch: CITY_VIEW.pitch,
        bearing: CITY_VIEW.bearing,
        duration: 900,
      });
    });

    const pick = (event: { features?: { properties?: { id?: string } }[] }) => {
      const id = event.features?.[0]?.properties?.id;
      if (id) onSelectRef.current?.(id);
    };

    map.on("click", "reports-points", pick);
    map.on("click", "pothole-symbols", pick);

    map.on("mouseenter", "reports-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "reports-points", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", "pothole-symbols", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "pothole-symbols", () => {
      map.getCanvas().style.cursor = "";
    });

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(containerRef.current);
    const resizeTimers = [50, 200, 500].map((delay) =>
      window.setTimeout(() => map.resize(), delay),
    );

    return () => {
      resizeTimers.forEach(window.clearTimeout);
      observer.disconnect();
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
      installActivityLayers(map, cases, mode, selectedId);
    };

    const deferUntilLoad = shouldDeferReportFocus({
      hasReportSource: Boolean(map.getSource(ACTIVITY_REPORT_SOURCE_ID)),
      isStyleLoaded: map.isStyleLoaded() === true,
    });

    if (deferUntilLoad) map.once("load", update);
    else update();
  }, [cases, mode, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRef.current?.remove();
    markerRef.current = null;
    popupRef.current?.remove();
    popupRef.current = null;

    if (!selectedId) return;
    const item = cases.find((candidate) => candidate.id === selectedId);
    if (!item) return;

    const showSelection = () => {
      const marker = new Marker({
        element: createPinElement(mode),
        anchor: "center",
      })
        .setLngLat([item.longitude, item.latitude])
        .addTo(map);
      markerRef.current = marker;

      const popup = new Popup({
        offset: 20,
        closeButton: false,
        className: "swm-map-popup",
      })
        .setLngLat([item.longitude, item.latitude])
        .setDOMContent(createPopupContent(item))
        .addTo(map);
      popupRef.current = popup;

      map.flyTo({
        center: [item.longitude, item.latitude],
        zoom: 15,
        pitch: 64,
        bearing: -28,
        duration: 1100,
        essential: false,
      });
    };

    const deferUntilLoad = shouldDeferReportFocus({
      hasReportSource: Boolean(map.getSource(ACTIVITY_REPORT_SOURCE_ID)),
      isStyleLoaded: map.isStyleLoaded() === true,
    });

    if (deferUntilLoad) map.once("load", showSelection);
    else showSelection();
  }, [selectedId, cases, mode]);

  function resetView() {
    if (mapRef.current) showActivityOverview(mapRef.current);
  }

  return (
    <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-[36px] border border-cloud bg-mist">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

      <button
        type="button"
        onClick={resetView}
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-[14px] border border-cloud bg-snow/95 px-3.5 py-2.5 text-xs font-medium text-iron shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:text-obsidian"
      >
        <BuildingsIcon className="size-4" />
        Selangor overview
      </button>

      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 rounded-[14px] border border-cloud bg-snow/95 px-3.5 py-2.5 text-[11px] text-steel shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        {mode === "pothole" ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2.5 rotate-45 bg-amber-500" />
              Pothole
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-600" />
              Critical
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-graphite bg-snow" />
              Repaired
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-ember" />
              New
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-graphite" />
              Active
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-graphite bg-snow" />
              Solved
            </span>
          </>
        )}
      </div>
    </div>
  );
}
