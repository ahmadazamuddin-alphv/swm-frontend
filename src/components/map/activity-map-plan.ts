import type {
  CircleLayerSpecification,
  FillExtrusionLayerSpecification,
  GeoJSONSourceSpecification,
  HeatmapLayerSpecification,
  StyleSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl";

export const ACTIVITY_REPORT_SOURCE_ID = "activity-reports";

export type MapCaseKind = "dumping" | "pothole";

export function shouldDeferReportFocus({
  hasReportSource,
  isStyleLoaded,
}: {
  hasReportSource: boolean;
  isStyleLoaded: boolean;
}) {
  return !hasReportSource && !isStyleLoaded;
}

export type ActivityMapPoint = {
  id: string;
  longitude: number;
  latitude: number;
  status: string;
  category: string;
  label: string;
  area: string;
  selected: boolean;
  kind: MapCaseKind;
};

const DUMPING_STATUS_COLOR: Record<string, string> = {
  new: "#ff5a00",
  under_review: "#18181b",
  assigned: "#3f3f46",
  in_progress: "#71717a",
  solved: "#ffffff",
  false_report: "#a1a1aa",
};

const POTHOLE_SEVERITY_COLOR: Record<string, string> = {
  low: "#a1a1aa",
  medium: "#f59e0b",
  high: "#ea580c",
  critical: "#dc2626",
  // status fallbacks if severity not used
  new: "#f59e0b",
  under_review: "#d97706",
  assigned: "#ea580c",
  in_progress: "#b45309",
  solved: "#ffffff",
  false_report: "#a1a1aa",
};

function findBuildingSource(style: Pick<StyleSpecification, "sources" | "layers">) {
  const buildingLayer = style.layers.find(
    (layer) =>
      "source-layer" in layer &&
      layer["source-layer"] === "building" &&
      "source" in layer &&
      typeof layer.source === "string",
  );

  if (
    buildingLayer &&
    "source" in buildingLayer &&
    typeof buildingLayer.source === "string"
  ) {
    return buildingLayer.source;
  }

  return Object.entries(style.sources).find(
    ([, source]) => source.type === "vector",
  )?.[0];
}

function findFirstLabel(style: Pick<StyleSpecification, "layers">) {
  return style.layers.find(
    (layer) =>
      layer.type === "symbol" && Boolean(layer.layout?.["text-field"]),
  )?.id;
}

function toGeoJson(
  points: ActivityMapPoint[],
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      properties: {
        id: point.id,
        status: point.status,
        category: point.category,
        label: point.label,
        area: point.area,
        kind: point.kind,
        selected: point.selected ? 1 : 0,
        activity: point.status === "solved" ? 1 : 3,
      },
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
    })),
  };
}

export function buildActivityMapPlan(
  style: Pick<StyleSpecification, "sources" | "layers">,
  points: ActivityMapPoint[],
  mode: MapCaseKind = "dumping",
) {
  const buildingSource = findBuildingSource(style);
  const isPothole = mode === "pothole";

  const reportSource: GeoJSONSourceSpecification = {
    type: "geojson",
    data: toGeoJson(points),
  };

  const reportHeatLayer: HeatmapLayerSpecification = {
    id: "reports-heat",
    type: "heatmap",
    source: ACTIVITY_REPORT_SOURCE_ID,
    maxzoom: 13.5,
    paint: {
      "heatmap-weight": ["get", "activity"],
      "heatmap-intensity": 0.65,
      "heatmap-radius": 30,
      "heatmap-opacity": isPothole ? 0.28 : 0.36,
      "heatmap-color": isPothole
        ? [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(245,158,11,0)",
            0.25,
            "rgba(245,158,11,0.14)",
            0.6,
            "rgba(234,88,12,0.32)",
            1,
            "rgba(220,38,38,0.4)",
          ]
        : [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(255,90,0,0)",
            0.25,
            "rgba(255,90,0,0.12)",
            0.6,
            "rgba(255,90,0,0.3)",
            1,
            "rgba(9,9,11,0.36)",
          ],
    },
  };

  const reportHaloLayer: CircleLayerSpecification = {
    id: "reports-halo",
    type: "circle",
    source: ACTIVITY_REPORT_SOURCE_ID,
    paint: {
      "circle-radius": ["case", ["==", ["get", "selected"], 1], 23, 13],
      "circle-color": [
        "case",
        ["==", ["get", "selected"], 1],
        isPothole ? "rgba(245,158,11,0.32)" : "rgba(255,90,0,0.28)",
        "rgba(9,9,11,0.1)",
      ],
      "circle-blur": 0.42,
    },
  };

  const reportPointLayer: CircleLayerSpecification = {
    id: "reports-points",
    type: "circle",
    source: ACTIVITY_REPORT_SOURCE_ID,
    paint: {
      "circle-radius": isPothole ? 5 : 8,
      "circle-color": (isPothole
        ? [
            "match",
            ["get", "category"],
            "low",
            POTHOLE_SEVERITY_COLOR.low,
            "medium",
            POTHOLE_SEVERITY_COLOR.medium,
            "high",
            POTHOLE_SEVERITY_COLOR.high,
            "critical",
            POTHOLE_SEVERITY_COLOR.critical,
            POTHOLE_SEVERITY_COLOR.medium,
          ]
        : [
            "match",
            ["get", "status"],
            "new",
            DUMPING_STATUS_COLOR.new,
            "under_review",
            DUMPING_STATUS_COLOR.under_review,
            "assigned",
            DUMPING_STATUS_COLOR.assigned,
            "in_progress",
            DUMPING_STATUS_COLOR.in_progress,
            "solved",
            DUMPING_STATUS_COLOR.solved,
            DUMPING_STATUS_COLOR.false_report,
          ]) as CircleLayerSpecification["paint"] extends { "circle-color"?: infer C }
        ? C
        : never,
      "circle-stroke-width": ["case", ["==", ["get", "selected"], 1], 3, 2],
      "circle-stroke-color": [
        "case",
        ["==", ["get", "status"], "solved"],
        "#18181b",
        "#ffffff",
      ],
      "circle-opacity": isPothole ? 0.35 : 0.98,
    },
  };

  const potholeSymbolLayer: SymbolLayerSpecification | null = isPothole
    ? {
        id: "pothole-symbols",
        type: "symbol",
        source: ACTIVITY_REPORT_SOURCE_ID,
        layout: {
          "icon-image": "pothole-diamond",
          "icon-size": [
            "case",
            ["==", ["get", "selected"], 1],
            1.15,
            0.9,
          ],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
        paint: {
          "icon-opacity": 0.98,
        },
      }
    : null;

  const buildingLayer: FillExtrusionLayerSpecification | null = buildingSource
    ? {
        id: "real-buildings-3d",
        type: "fill-extrusion",
        source: buildingSource,
        "source-layer": "building",
        minzoom: 13,
        filter: ["!=", ["get", "hide_3d"], true],
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "render_height"], 12],
            0,
            "#ececee",
            40,
            "#d4d4d8",
            120,
            "#a1a1aa",
            240,
            "#71717a",
          ],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            13,
            0,
            14.25,
            ["coalesce", ["get", "render_height"], ["get", "height"], 12],
          ],
          "fill-extrusion-base": [
            "coalesce",
            ["get", "render_min_height"],
            ["get", "min_height"],
            0,
          ],
          "fill-extrusion-opacity": 0.92,
          "fill-extrusion-vertical-gradient": true,
        },
      }
    : null;

  return {
    reportSource,
    reportHeatLayer,
    reportHaloLayer,
    reportPointLayer,
    potholeSymbolLayer,
    buildingLayer,
    buildingBeforeId: findFirstLabel(style),
  };
}

/** Canvas diamond used as MapLibre symbol for pothole cases */
export function createPotholeDiamondImage(
  size = 48,
): {
  width: number;
  height: number;
  data: Uint8Array;
} {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { width: size, height: size, data: new Uint8Array(size * size * 4) };
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34;

  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fillStyle = "#f59e0b";
  ctx.fill();
  ctx.lineWidth = size * 0.08;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // inner mark
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.35);
  ctx.lineTo(cx, cy + r * 0.1);
  ctx.strokeStyle = "#18181b";
  ctx.lineWidth = size * 0.07;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.28, size * 0.035, 0, Math.PI * 2);
  ctx.fillStyle = "#18181b";
  ctx.fill();

  const imageData = ctx.getImageData(0, 0, size, size);
  return {
    width: size,
    height: size,
    data: new Uint8Array(imageData.data.buffer),
  };
}
