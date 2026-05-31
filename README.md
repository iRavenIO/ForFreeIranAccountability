# Accountability Archive

A Persian-first accountability archive for tracking organizational structures, units, and deployment locations of Iranian security forces (IRGC, Basij, LEC/Police).

**Domain:** accountability.forfreeiran.org

**Safety:** This project displays **aggregate data only** in its public interface. No individual person-level data (names, national IDs, exact addresses, phone numbers, DOB) is exposed publicly. All data is aggregated by city, province, organization, and unit.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up the SQLite database
npm run db:migrate

# 3. Place data files
# Copy LEC.xlsx and Basij.xlsx into the ./data/ directory
cp /path/to/LEC.xlsx ./data/
cp /path/to/Basij.xlsx ./data/

# 4. Import data (generates raw records + aggregate tables)
npm run import:data

# 5. Start development server
npm run dev
```

Visit **http://localhost:3000** — the app redirects to `/fa` (Persian homepage).

---

## Project Structure

```
accountability/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Root → redirects to /fa
│   ├── fa/                     # Persian homepage
│   │   ├── page.tsx            # Server component (fetches stats)
│   │   └── FaHomeClient.tsx    # Client UI with hero, stats, cards
│   ├── map/                    # Interactive deployment map
│   ├── search/                 # Aggregate search interface
│   ├── units/                  # Organizations & units browser
│   ├── about/                  # Methodology & safety page
│   └── admin/import-review/    # Internal-only import review
│   └── api/
│       ├── map/cities/         # GET city-level aggregates
│       ├── map/units/          # GET unit-level aggregates
│       ├── search/             # GET aggregated search
│       ├── stats/              # GET overall statistics
│       └── import/status/      # GET import logs (internal)
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── MapView.tsx             # Leaflet dark map
│   ├── StatsCard.tsx
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── persian.ts              # Persian/Arabic normalization
│   ├── coordinates.ts          # Iran city coordinate lookup
│   └── constants.ts            # App-wide constants
├── scripts/
│   ├── import-excel.ts         # Main import pipeline
│   └── regenerate-aggregates.ts # Regenerate public tables
├── data/                       # Place LEC.xlsx and Basij.xlsx here
├── db/                         # SQLite database location
├── prisma/
│   └── schema.prisma           # Database schema
├── styles/
│   └── globals.css             # Global styles & dark theme
└── README.md
```

---

## Data Pipeline

### 1. Place data files

Copy the Excel files into `./data/`:

```
data/
├── LEC.xlsx      (Law Enforcement Command records)
└── Basij.xlsx    (Basij Resistance Force records)
```

### 2. Import data

```bash
npm run import:data
```

The import script:
- Reads both XLSX files
- Detects columns automatically (name, DOB, national ID, address, postal code, province, etc.)
- Normalizes Persian/Arabic characters
- Normalizes province names to English canonical form
- Validates and extracts postal code area prefixes (first 5 digits)
- Extracts city names from addresses where possible
- Stores individual raw records in `raw_records` table (internal only)
- Generates public aggregate tables:
  - `public_city_aggregates` — counts by city and organization
  - `public_unit_aggregates` — counts by unit and organization
  - `public_postal_area_aggregates` — approximate postal area data
- Logs import results in `import_logs`

### 3. Regenerate aggregates (if needed)

```bash
npm run import:aggregates
```

Re-generates all public aggregate tables from the raw data without re-importing.

---

## Schema

### Raw Records (Internal — not exposed in public API)

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key |
| sourceFile | String | Source filename (LEC.xlsx / Basij.xlsx) |
| sourceSheet | String | Sheet name within the file |
| rawJson | String | Complete original row data |
| normalizedJson | String? | Normalized PII-free metadata |
| organization | String? | Detected org (Basij / LEC) |
| province | String? | Normalized province name |
| city | String? | Extracted city name |
| postalCode | String? | Validated 10-digit postal code |
| postalAreaCode | String? | First 5 digits of postal code |
| fullName | String? | Normalized full name (internal) |
| dob | String? | Date of birth (internal) |
| nationalId | String? | National ID (internal) |
| address | String? | Normalized address (internal) |
| ... | ... | Additional fields |

### Public City Aggregates

| Column | Type | Description |
|--------|------|-------------|
| province | String | Province name |
| city | String | City name |
| lat/lng | Float? | Approximate coordinates |
| totalRecords | Int | Total records in this city |
| basijCount | Int | Basij records |
| lecCount | Int | LEC records |
| irgcCount | Int | IRGC records |
| unitCount | Int | Number of distinct units |

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema (faster, no migration file) |
| `npm run db:studio` | Open Prisma Studio (DB browser) |
| `npm run import:data` | Import Excel files into SQLite |
| `npm run import:aggregates` | Regenerate aggregate tables |

---

## API Endpoints

All public endpoints return aggregate data only — no individual records.

| Endpoint | Description |
|----------|-------------|
| `GET /api/stats` | Overall statistics (totals, org breakdown, last import) |
| `GET /api/map/cities?province=&city=&organization=&page=&limit=` | City-level aggregates with coordinates |
| `GET /api/map/units?organization=&unit=&province=&city=&page=&limit=` | Unit-level aggregates |
| `GET /api/search?q=&province=&city=&organization=&unit=&type=cities|units&page=&limit=` | Search across aggregates |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Free-text search |
| `province` | string | Filter by province |
| `city` | string | Filter by city |
| `organization` | string | Filter by org (Basij, LEC, IRGC) |
| `unit` | string | Filter by unit name |
| `type` | string | Search type: `cities` or `units` |
| `page` | int | Page number (default: 1) |
| `limit` | int | Results per page (default: 50, max: 100) |

---

## Adding Iran Postal Code Centroid Data

The current coordinate system uses city-level centroids from `lib/coordinates.ts`. For more precise postal-area aggregation:

1. Prepare a CSV with columns: `postal_area_code`, `lat`, `lng`, `province`, `city`
2. Create a new table or seed file for postal code centroids
3. Update `lib/coordinates.ts` to first check the centroid DB
4. Fall back to city coordinates if no exact match

Iranian postal codes are 10 digits. The first 5 digits (`XXXXX-XXXXX`) identify a postal area. The `public_postal_area_aggregates` table stores these 5-digit prefixes as `postalAreaCode`.

---

## Safety Constraints

- **No PII in public API** — all public endpoints return only aggregated counts
- **No exact postal codes on map** — postal codes are truncated to 5-digit area prefixes
- **No person-level addresses** — addresses are stored in `raw_records` table (internal only)
- **City-level only on map** — markers represent city aggregates, not individual locations
- **No cookies or tracking** — the site uses no analytics, cookies, or third-party trackers
- **Import review gated** — `/admin/import-review` requires `ENABLE_INTERNAL_REVIEW=true` in `.env`

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:../db/accountability.db` | SQLite database path (relative to prisma/) |
| `ENABLE_INTERNAL_REVIEW` | No | `false` | Set to `true` to enable `/admin/import-review` |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public app URL |

---

## Design

- **Dark theme** — charcoal backgrounds with off-white text
- **Accent color** — deep red (`#8b1e1e`)
- **Persian RTL** — primary interface is Persian (Arabic script) with RTL layout
- **Vazirmatn** font for Persian text
- **Leaflet** for map rendering with CartoDB dark tiles
- **No tracking, no cookies**

---

## License

Public interest documentation project. Data is provided for transparency and accountability purposes.
