import type {
  CircleLayerSpecification,
  FillExtrusionLayerSpecification,
  GeoJSONSourceSpecification,
  HeatmapLayerSpecification,
  StyleSpecification,
} from "maplibre-gl";

export const ACTIVITY_REPORT_SOURCE_ID = "activity-reports";

export function shouldDeferReportFocus({
  hasReportSource,
  isStyleLoaded,
}: {
  hasReportSource: boolean;
  isStyleLoaded: boolean;
}) {
  return !hasReportSource && !isStyleLoaded;
}

type ActivityMapPoint = {
  id: string;
  longitude: number;
  latitude: number;
  status: string;
  category: string;
  label: string;
  area: string;
  selected: boolean;
};

const STATUS_COLOR: Record<string, string> = {
  new: "#ff5a00",
  under_review: "#18181b",
  assigned: "#3f3f46",
  in_progress: "#71717a",
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
) {
  const buildingSource = findBuildingSource(style);

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
      "heatmap-opacity": 0.36,
      "heatmap-color": [
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
      "circle-radius": [
        "case",
        ["==", ["get", "selected"], 1],
        23,
        13,
      ],
      "circle-color": [
        "case",
        ["==", ["get", "selected"], 1],
        "rgba(255,90,0,0.28)",
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
      "circle-radius": 8,
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
        ["==", ["get", "status"], "solved"],
        "#18181b",
        "#ffffff",
      ],
      "circle-opacity": 0.98,
    },
  };

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
    buildingLayer,
    buildingBeforeId: findFirstLabel(style),
  };
}
