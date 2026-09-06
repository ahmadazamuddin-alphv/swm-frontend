import assert from "node:assert/strict";
import test from "node:test";

import {
  buildActivityMapPlan,
  shouldDeferReportFocus,
} from "./activity-map-plan.ts";

test("builds visible report and building layers in a safe draw order", () => {
  const plan = buildActivityMapPlan(
    {
      sources: {
        openmaptiles: {
          type: "vector",
          url: "https://tiles.openfreemap.org/planet",
        },
      },
      layers: [
        { id: "background", type: "background" },
        {
          id: "building-outline",
          type: "line",
          source: "openmaptiles",
          "source-layer": "building",
        },
        { id: "road-label", type: "symbol", layout: { "text-field": "name" } },
      ],
    },
    [
      {
        id: "SW-001",
        longitude: 101.533,
        latitude: 3.0738,
        status: "new",
        category: "construction",
        label: "Construction waste",
        area: "Shah Alam",
        selected: false,
        kind: "dumping",
      },
    ],
  );

  assert.equal(plan.reportSource.type, "geojson");
  assert.equal(plan.potholeSymbolLayer, null);
  assert.equal(plan.reportSource.data.type, "FeatureCollection");
  assert.deepEqual(plan.reportSource.data.features[0]?.geometry.coordinates, [
    101.533,
    3.0738,
  ]);

  assert.equal(plan.buildingLayer.type, "fill-extrusion");
  assert.equal(plan.buildingLayer.source, "openmaptiles");
  assert.equal(plan.buildingLayer["source-layer"], "building");
  assert.equal(plan.buildingBeforeId, "road-label");

  assert.equal(plan.reportHaloLayer.type, "circle");
  assert.equal(plan.reportHaloLayer.source, "activity-reports");
  assert.equal(plan.reportPointLayer.type, "circle");
  assert.equal(plan.reportPointLayer.source, "activity-reports");
  assert.ok(Number(plan.reportPointLayer.paint?.["circle-radius"]) > 0);
});

test("focuses immediately while an existing report source refreshes", () => {
  assert.equal(
    shouldDeferReportFocus({
      hasReportSource: true,
      isStyleLoaded: false,
    }),
    false,
  );
});

test("defers focus only before the initial report source is installed", () => {
  assert.equal(
    shouldDeferReportFocus({
      hasReportSource: false,
      isStyleLoaded: false,
    }),
    true,
  );
});
