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

const SELANGOR_BOUNDS: [[number, number], [number, number]] = [
  [100.78, 2.56],
  [102.02, 3.91],
];

const SELANGOR_DISTRICT_SOURCE_ID = "selangor-districts";
const SELANGOR_MASK_SOURCE_ID = "selangor-state-mask";
const SELANGOR_MASK_LAYER_ID = "selangor-state-mask";
const SELANGOR_DISTRICT_FILL_ID = "selangor-district-fills";
const SELANGOR_DISTRICT_LINE_ID = "selangor-district-lines";
const SELANGOR_DISTRICT_LABEL_ID = "selangor-district-labels";

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
  imageUrl?: string;
  detailHref?: string;
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
  const header = document.createElement("div");
  const title = document.createElement("p");
  const meta = document.createElement("p");
  const coords = document.createElement("code");
  const status = document.createElement("span");

  root.className = "swm-map-popup__body";
  header.className = "swm-map-popup__header";
  title.className = "swm-map-popup__title";
  title.textContent = item.title;
  meta.className = "swm-map-popup__meta";
  meta.textContent = item.subtitle
    ? `${item.subtitle} · ${item.area}`
    : item.area;
  coords.className = "swm-map-popup__coords";
  coords.textContent = formatCoords(item.latitude, item.longitude);
  status.className = `swm-map-popup__status swm-map-popup__status--${item.status}`;
  status.textContent = item.status.replaceAll("_", " ");

  if (item.imageUrl) {
    const image = document.createElement("img");
    image.className = "swm-map-popup__image";
    image.src = item.imageUrl;
    image.alt = "";
    root.append(image);
  }

  header.append(title, status);
  root.append(header, meta, coords);
  if (item.detailHref) {
    const link = document.createElement("a");
    link.className = "swm-map-popup__link";
    link.href = item.detailHref;
    link.textContent = "Full detail →";
    root.append(link);
  }
  return root;
}

function tuneBaseMap(map: Map) {
  for (const layer of map.getStyle().layers) {
    if (layer.id.startsWith("selangor-")) continue;
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

function installSelangorDistrictLayers(map: Map) {
  if (!map.getSource(SELANGOR_MASK_SOURCE_ID)) {
    map.addSource(SELANGOR_MASK_SOURCE_ID, {
      type: "geojson",
      data: "/geo/selangor-mask.geojson",
    });
  }

  if (!map.getLayer(SELANGOR_MASK_LAYER_ID)) {
    map.addLayer({
      id: SELANGOR_MASK_LAYER_ID,
      type: "fill",
      source: SELANGOR_MASK_SOURCE_ID,
      paint: {
        "fill-color": "#c7c9d1",
        "fill-opacity": 1,
      },
    });
  }

  if (!map.getSource(SELANGOR_DISTRICT_SOURCE_ID)) {
    map.addSource(SELANGOR_DISTRICT_SOURCE_ID, {
      type: "geojson",
      data: "/geo/selangor-districts.geojson",
    });
  }

  if (!map.getLayer(SELANGOR_DISTRICT_FILL_ID)) {
    map.addLayer({
      id: SELANGOR_DISTRICT_FILL_ID,
      type: "fill",
      source: SELANGOR_DISTRICT_SOURCE_ID,
      paint: {
        "fill-color": [
          "match",
          ["get", "Daerah"],
          "GOMBAK",
          "#90dbf4",
          "HULU LANGAT",
          "#f6bd60",
          "HULU SELANGOR",
          "#b8e0d2",
          "KLANG",
          "#f28482",
          "KUALA LANGAT",
          "#cdb4db",
          "KUALA SELANGOR",
          "#f5cac3",
          "PETALING",
          "#a9def9",
          "SABAK BERNAM",
          "#84a59d",
          "SEPANG",
          "#f7ede2",
          "#f7ede2",
        ],
        "fill-opacity": 0.48,
      },
    });
  }

  if (!map.getLayer(SELANGOR_DISTRICT_LINE_ID)) {
    map.addLayer({
      id: SELANGOR_DISTRICT_LINE_ID,
      type: "line",
      source: SELANGOR_DISTRICT_SOURCE_ID,
      paint: {
        "line-color": "#7c2d12",
        "line-width": 1.4,
        "line-opacity": 0.72,
      },
    });
  }

  if (!map.getLayer(SELANGOR_DISTRICT_LABEL_ID)) {
    map.addLayer({
      id: SELANGOR_DISTRICT_LABEL_ID,
      type: "symbol",
      source: SELANGOR_DISTRICT_SOURCE_ID,
      layout: {
        "text-field": ["get", "Nam"],
        "text-size": 11,
        "text-font": ["Noto Sans Regular"],
        "text-anchor": "center",
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#4a1b0d",
        "text-halo-color": "rgba(255,255,255,0.92)",
        "text-halo-width": 1.5,
      },
    });
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
  installSelangorDistrictLayers(map);

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
  const zoomBoost = compact ? 0.25 : 0.45;
  map.fitBounds(SELANGOR_BOUNDS, {
    padding: compact ? 12 : 20,
    maxZoom: compact ? 10.8 : 11.5,
    pitch: 32,
    bearing: -12,
    duration: 0,
    essential: false,
  });
  map.zoomTo(Math.min(12, map.getZoom() + zoomBoost), {
    duration: 900,
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
  onSelect?: (id: string | null) => void;
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
      attributionControl: false,
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
      showActivityOverview(map);
    });

    const pick = (event: { features?: { properties?: { id?: string } }[] }) => {
      const id = event.features?.[0]?.properties?.id;
      if (!id) return;

      // A different source indicator replaces the active selection. Clear the
      // old popup reference first so its close listener cannot clear the new
      // selection after this event finishes.
      const activePopup = popupRef.current;
      popupRef.current = null;
      activePopup?.remove();
      onSelectRef.current?.(id);
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
      const activePopup = popupRef.current;
      popupRef.current = null;
      activePopup?.remove();
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
    const activePopup = popupRef.current;
    popupRef.current = null;
    activePopup?.remove();

    if (!selectedId) return;
    const item = cases.find((candidate) => candidate.id === selectedId);
    if (!item) return;

    const showSelection = () => {
      const pinElement = createPinElement(mode);
      const marker = new Marker({
        element: pinElement,
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

      // The visual selected marker is a DOM layer above the source point.
      // Removing it after the popup closes exposes the original indicator for
      // the next tap and avoids competing pointer handlers.
      popup.on("close", () => {
        if (popupRef.current !== popup) return;
        popupRef.current = null;
        onSelectRef.current?.(null);
      });

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

  return (
    <div className="swm-map-shell relative h-full min-h-[360px] w-full overflow-hidden rounded-none border-0 bg-mist">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 rounded-[7px] border border-cloud bg-snow/95 px-3.5 py-2.5 text-[11px] text-steel shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        {mode === "pothole" ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2.5 rotate-45 bg-[#a91824]" />
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
              <span className="size-2 rounded-full bg-[#2563eb]" />
              New
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#D2222B]" />
              Active
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#16a34a]" />
              Solved
            </span>
          </>
        )}
      </div>
    </div>
  );
}
