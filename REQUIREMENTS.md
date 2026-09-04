# Selangor Waste Management — Next.js Citizen Frontend

Citizen-facing web app for the **Illegal Dumping** POC (Hackathon: Selangor Waste Management).

| | |
|---|---|
| **Stack** | Next.js 16 (App Router) + React 19 + Tailwind CSS 4 |
| **Path** | `C:\Users\User\Projects\swm` |
| **Theme** | Soft Selangor red (`#C45C5C`) + soft gold (`#E8C547`) on cream |
| **Pairs with** | Laravel Filament admin at `C:\laragon\www\swm-backend` |

---

## Project overview

| Field | Detail |
|---|---|
| **Project** | Illegal Dumping |
| **This app’s role** | Citizen dashboard + citizen reporting |
| **Development type** | Web platform (citizen) — consumes Laravel API; AI / CV heavy lifting may live on backend |
| **Main focus** | Report intake UX, hotspot visibility, trust via solved cases, waste categories, responsible-party transparency |

---

## Scope owned by this frontend

1. **Citizen dashboard** — 3D map, filters, solved cases, area ownership  
2. **Citizen reporting** — live-camera capture, GPS, AI waste ID UX, department suggestion  

Government ops, CCTV POC admin, and deep analytics live in the Laravel Filament project.

---

## Citizen dashboard requirements

| Feature | Details |
|---|---|
| **3D map visualisation** | Interactive 3D map of report activity across areas; show distribution and higher-activity zones. |
| **Show solved reports** | Display resolved cases so citizens see government action and stay motivated to report. |
| **Waste categories** | Classify / filter by waste type (e.g. construction waste, furniture, waste piles). |
| **Responsible party details** | For an area, show department name, contractor, contact person, and contact info. |

---

## Citizen reporting requirements

| Feature | Details |
|---|---|
| **Report changing hotspots** | Citizens can report **new** illegal-dumping locations — not limited to a fixed location list (hotspots change). |
| **Live camera only** | Require capture via **live camera**; do **not** allow gallery/file upload (reduce fake reports). |
| **AI identifies waste type** | From the captured image, auto-identify or suggest waste type. |
| **Auto-detect coordinates** | Capture GPS / device location with the report. |
| **Suggest responsible department** | Auto-suggest the *jabatan* / party that should handle the case based on location and area data. |

---

## Suggested frontend structure

```
src/
  app/                 # App Router pages
  components/
    map/               # 3D map (e.g. Mapbox / Cesium / deck.gl — TBD)
    reports/           # List, filters, solved feed
    reporting/         # Live camera capture + submit flow
    parties/           # Responsible party panels
  lib/
    api.ts             # Laravel API client
    geo.ts             # GPS helpers
    waste-ai.ts        # Client hooks to AI classify endpoint
```

### Suggested routes

| Route | Purpose |
|---|---|
| `/` | Landing / entry |
| `/dashboard` | Citizen map + filters + solved cases |
| `/report` | Live-camera report wizard |
| `/report/[id]` | Public-safe report detail (optional) |

---

## Data contracts (from Laravel)

Minimum fields the UI should expect:

**Report**

- `id`, `latitude`, `longitude`
- `waste_category` / `waste_type` (+ AI confidence)
- `status` (`new` | `under_review` | `assigned` | `in_progress` | `solved` | `false_report`)
- `image_url` (from live capture)
- `submitted_at`, `solved_at` (optional)
- `responsible_party` summary
- `area` / `postcode` / `taman` (optional)

**Responsible party**

- department name, contractor, contact person, phone/email, zone coverage

---

## Theme (soft Selangor)

Defined in `src/app/globals.css`:

| Token | Hex | Role |
|---|---|---|
| `--selangor-red` | `#C45C5C` | Primary actions / brand |
| `--selangor-yellow` | `#E8C547` | Accent / highlights |
| `--selangor-cream` | `#FFF8F2` | Page background |
| `--selangor-ink` | `#4A2C2C` | Body text |

Fonts: **Fraunces** (display) + **DM Sans** (UI).

---

## Local setup

```bash
cd C:\Users\User\Projects\swm
npm install
npm run dev
```

App runs at `http://localhost:3000`.

Set Laravel API base URL in `.env.local` (create when wiring API):

```env
NEXT_PUBLIC_API_BASE_URL=http://swm-backend.test/api
```

---

## Implementation notes for POC

1. **Camera**: use `getUserMedia` / `<input capture="environment">` — block `accept` gallery-only paths where possible.  
2. **GPS**: `navigator.geolocation` at capture time; store accuracy if available.  
3. **Map**: start with 2D if needed, then upgrade to 3D visualisation for the hackathon demo.  
4. **AI**: call backend endpoint that classifies waste from the uploaded frame; show editable suggestion before submit.  
5. **Trust UX**: surface solved reports prominently near the map / feed.

---

## Out of scope for this repo (handled in Laravel)

- Government notifications & case workflow  
- False-report review with mandatory reason  
- Proof-of-resolution uploads by contractors  
- Risk score ops queue, manpower/lorry AI recommendations  
- Disposal route planning  
- CCTV video upload POC admin  
- Contractor / zone / *abang lori* analytics  

See `REQUIREMENTS.md` in the Laravel project for those.

---

## Reference

Related citizen POC repo mentioned in requirements:  
https://github.com/diniizzaty24/siaga-selangor.git
