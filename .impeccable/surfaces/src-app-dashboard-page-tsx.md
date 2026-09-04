---
version: 1
slug: "src-app-dashboard-page-tsx"
primary_target: "src/app/dashboard/page.tsx"
related_targets: ["src/components/dashboard/DashboardClient.tsx","src/components/map/ActivityMap.tsx","src/components/reports/ReportFilters.tsx","src/components/reports/ReportList.tsx"]
---

## Scope and mode

Citizen activity dashboard. Mode: Operate.

## Audience, job, and action

Selangor residents scan current illegal-dumping activity, inspect a specific case and its responsible party, or begin a new on-site report. The primary action is selecting a case in the report rail to move and deepen the 3D map; the standing action is reporting a new site.

## Content and constraints

The dashboard uses illustrative local cases, seven waste categories, solved outcomes, council contacts, and browser-local citizen submissions. The 3D massing and report data are deterministic POC material. No Laravel connection, authentication, government workflow, production AI, or cloud persistence belongs on this surface.

## Chosen direction

User-pinned Awesomic editorial civic grid. The map owns most of the working viewport; compact metrics and filters frame it, while a single report rail carries detail without competing card mosaics.

## Memorable moment

Selecting a report makes the map fly to its exact coordinates and brings real OpenStreetMap building footprints into close 3D relief.

## Unresolved decisions

Production tile hosting, service-level availability, and offline map behavior remain future integration decisions outside the POC.
