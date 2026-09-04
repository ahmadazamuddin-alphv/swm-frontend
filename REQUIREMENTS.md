# Selangor Waste Management — Citizen POC

This Next.js application is the complete citizen-facing proof of concept for reporting and exploring illegal dumping in Selangor.

## Delivery boundary

- The final demonstration is citizen-only and runs without the Laravel application.
- Reports, responsible parties, classifications, routing, and solved outcomes use deterministic local data.
- A newly submitted report persists in the browser and immediately appears on the activity dashboard.
- Government operations, authentication, cloud storage, production AI, CCTV, and deep analytics are outside this delivery.

## Required citizen journey

### Explore activity

- Show illegal-dumping activity on an interactive MapLibre map.
- Render real OpenStreetMap building footprints as 3D extrusions at close zoom.
- Show report points, changing hotspots, filters, solved cases, and responsible-party details.
- Let a citizen select a report from either the map or report rail and inspect its location, status, evidence, and accountable party.

### Submit a report

- Require a live camera capture; do not expose a gallery or file-upload path.
- Request the device location and record coordinates and accuracy.
- Provide a clearly labelled Shah Alam demonstration location when GPS is denied or unavailable.
- Simulate waste classification deterministically and allow the suggested category and description to be corrected.
- Suggest the responsible department from the captured coordinates.
- Save the report locally, then link to its detail view and the updated dashboard.

## Routes

| Route | Purpose |
|---|---|
| `/` | Explain the citizen POC and route into the two main tasks. |
| `/dashboard` | Explore the 3D activity map, reports, filters, solved cases, and responsible parties. |
| `/report` | Complete the live-camera and GPS reporting flow. |
| `/report/[id]` | Inspect a public-safe report detail, including a browser-local report. |

## Technology and data

- Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4.
- MapLibre GL JS with OpenFreeMap vector tiles and OpenStreetMap-derived building data.
- Browser APIs: `getUserMedia`, Geolocation, canvas capture, and `localStorage`.
- No API base URL or backend process is required for the final POC.

## Visual direction

The user-approved Awesomic reference is binding: an editorial zinc grid, DM Sans, large rounded panels, fine neutral borders, and near-monochrome surfaces. Orange (`#ff5a00`) is sparse functional punctuation for new activity, focus, and key status—not a decorative wash.

All demonstration figures and behavior must be labelled honestly. Do not introduce production claims, service metrics, or unverified agency promises.
