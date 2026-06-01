/**
 * Public in-memory SQLite query layer.
 *
 * Architecture:
 * - Disk SQLite (db/accountability.db) is the source of truth
 * - In-memory SQLite (:memory:) is a read-only runtime cache
 * - Public API routes query the in-memory database exclusively
 * - Only public-safe tables and columns are copied into memory
 * - Sensitive/raw tables are never loaded into memory
 *
 * Initialization:
 * - Lazy: first API request triggers init
 * - Promise lock prevents race conditions with concurrent requests
 * - Returns 503 "Public database is not ready" if init fails
 *
 * Reload:
 * - POST /api/internal/reload-public-db with INTERNAL_ADMIN_TOKEN
 * - Reloads the in-memory database from disk after a new import
 */

import Database from 'better-sqlite3';
import { config } from './config';
import { getPersianSourceLabel, formatPersianCount } from './source-labels';
import * as fs from 'fs';

// ============================================================================
// Types
// ============================================================================

export interface PublicPerson {
  id: number;
  fullName: string | null;
  province: string | null;
  city: string | null;
  sourceFile: string | null;
  sourceLabel: string;
  publicStatus: string;
  reviewStatus: string;
  notesPublic: string | null;
  approximateCityLat: number | null;
  approximateCityLng: number | null;
  maskedPhone: string | null;
  maskedPostal: string | null;
  maskedNationalId: string | null;
  fullPhone?: string | null;
  fullPostal?: string | null;
  address?: string | null;
  dob?: string | null;
  nationalId?: string | null;
  dateOfAddress?: string | null;
  createdAt: string;
}

export interface PublicCityPoint {
  id: number;
  province: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  totalRecords: number;
}

export interface ProvinceResult {
  province: string | null;
  totalRecords: number;
  cityCount: number;
}

export interface CityResult {
  city: string;
  totalRecords: number;
}

export interface MapCluster {
  lat: number;
  lng: number;
  totalRecords: number;
  precisionType: string;
  cities: { city: string; province: string | null; count: number }[];
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HealthStatus {
  status: 'ok' | 'initializing' | 'error';
  diskDbExists: boolean;
  memoryDbReady: boolean;
  publicPeopleCount: number;
  cityMarkerCount: number;
  uptime: number;
  error?: string;
}

// ============================================================================
// Global state (uses globalThis for cross-module singleton in Next.js dev mode)
// ============================================================================

interface DbState {
  memoryDb: Database.Database | null;
  initPromise: Promise<void> | null;
  initError: string | null;
  lastReloadCount: number;
}

const globalForDb = globalThis as unknown as { __publicDbState?: DbState };

function getState(): DbState {
  if (!globalForDb.__publicDbState) {
    globalForDb.__publicDbState = {
      memoryDb: null,
      initPromise: null,
      initError: null,
      lastReloadCount: 0,
    };
  }
  return globalForDb.__publicDbState;
}

function setState(partial: Partial<DbState>) {
  const state = getState();
  Object.assign(state, partial);
}

const startTime = Date.now();

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the in-memory public database.
 * Safe to call multiple times — only the first call does the work.
 */
export async function initPublicMemoryDb(): Promise<void> {
  const state = getState();

  // Already initialized
  if (state.memoryDb) return;

  // Already initializing — wait for the existing promise
  if (state.initPromise) return state.initPromise;

  // Start initialization
  state.initPromise = doInit();
  try {
    await state.initPromise;
  } catch (err) {
    state.initError = err instanceof Error ? err.message : String(err);
    throw err;
  }
}

async function doInit(): Promise<void> {
  const t0 = Date.now();
  const diskPath = config.databasePath;

  console.log(`[public-db] Starting initialization...`);
  console.log(`[public-db] Disk database: ${diskPath}`);

  // Check disk database exists
  if (!fs.existsSync(diskPath)) {
    throw new Error(`Disk database not found at: ${diskPath}`);
  }
  console.log(`[public-db] Disk database found (${(fs.statSync(diskPath).size / 1024 / 1024).toFixed(1)} MB)`);

  const db = new Database(':memory:');
  db.pragma('journal_mode = OFF');
  db.pragma('synchronous = OFF');
  db.pragma('cache_size = 100000');
  db.pragma('temp_store = MEMORY');

  const tAttach = Date.now();

  // ATTACH disk database
  db.exec(`ATTACH '${diskPath}' AS diskdb`);
  console.log(`[public-db] Attached disk database in ${Date.now() - tAttach}ms`);

  const tCopy = Date.now();

  // Copy public_people (safe columns only)
  db.exec(`
    CREATE TABLE IF NOT EXISTS public_people AS
    SELECT
      id,
      fullName,
      province,
      city,
      sourceFile,
      publicStatus,
      reviewStatus,
      notesPublic,
      approximateCityLat,
      approximateCityLng,
      maskedPhone,
      maskedPostal,
      fullPhone,
      fullPostal,
      maskedNationalId,
      address,
      dob,
      nationalId,
      dateOfAddress,
      createdAt
    FROM diskdb.PublicPerson
  `);

  const peopleCount = db.prepare('SELECT COUNT(*) as cnt FROM public_people').get() as { cnt: number };

  // Copy public_city_points
  db.exec(`
    CREATE TABLE IF NOT EXISTS public_city_points AS
    SELECT
      id,
      province,
      city,
      lat,
      lng,
      totalRecords
    FROM diskdb.PublicCityPoint
  `);

  const cityPointCount = db.prepare('SELECT COUNT(*) as cnt FROM public_city_points').get() as { cnt: number };

  // DETACH disk database
  db.exec('DETACH diskdb');

  console.log(`[public-db] Copied ${peopleCount.cnt} people, ${cityPointCount.cnt} city points in ${Date.now() - tCopy}ms`);

  // Create indexes
  const tIndex = Date.now();

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_pp_fullName ON public_people(fullName);
    CREATE INDEX IF NOT EXISTS idx_pp_province ON public_people(province);
    CREATE INDEX IF NOT EXISTS idx_pp_city ON public_people(city);
    CREATE INDEX IF NOT EXISTS idx_pp_province_city ON public_people(province, city);
    CREATE INDEX IF NOT EXISTS idx_pp_sourceFile ON public_people(sourceFile);
    CREATE INDEX IF NOT EXISTS idx_pcp_province ON public_city_points(province);
    CREATE INDEX IF NOT EXISTS idx_pcp_city ON public_city_points(city);
  `);

  console.log(`[public-db] Created indexes in ${Date.now() - tIndex}ms`);

  // Try FTS5 for name search
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS public_people_fts USING fts5(
        fullName,
        city,
        province,
        content='public_people',
        content_rowid='id'
      );
    `);
    console.log('[public-db] FTS5 index created for name search');
  } catch (ftsErr) {
    console.warn('[public-db] FTS5 not available, using LIKE fallback:', ftsErr);
  }

  setState({ memoryDb: db, lastReloadCount: peopleCount.cnt });
  console.log(`[public-db] Initialization complete in ${Date.now() - t0}ms`);
}

/**
 * Get the initialized in-memory database.
 * Throws if not yet initialized.
 */
export function getPublicDb(): Database.Database {
  const db = getState().memoryDb;
  if (!db) {
    throw new Error('Public database is not ready');
  }
  return db;
}

/**
 * Check if the in-memory database is ready.
 */
export function isMemoryDbReady(): boolean {
  return getState().memoryDb !== null;
}

// ============================================================================
// Reload
// ============================================================================

/**
 * Reload the in-memory database from the disk database.
 * Called after a new import completes.
 */
export async function reloadPublicMemoryDb(): Promise<{
  success: boolean;
  peopleCount: number;
  cityPointCount: number;
  elapsedMs: number;
}> {
  const t0 = Date.now();

  // Close existing in-memory database
  const state = getState();
  if (state.memoryDb) {
    state.memoryDb.close();
    setState({ memoryDb: null, initPromise: null, initError: null });
  }

  // Reinitialize
  await initPublicMemoryDb();

  const db = getPublicDb();
  const peopleCount = (db.prepare('SELECT COUNT(*) as cnt FROM public_people').get() as { cnt: number }).cnt;
  const cityPointCount = (db.prepare('SELECT COUNT(*) as cnt FROM public_city_points').get() as { cnt: number }).cnt;

  return {
    success: true,
    peopleCount,
    cityPointCount,
    elapsedMs: Date.now() - t0,
  };
}

// ============================================================================
// Public Query Functions
// ============================================================================

/** Get map markers (clustered by 1-decimal coordinates) */
export function getMapMarkers(province?: string, sourceFilter?: string): MapCluster[] {
  const db = getPublicDb();

  let rows: PublicCityPoint[];

  if (sourceFilter) {
    // Source-filtered: query people by source, group by city, join with city points
    const sourcePattern = `%${sourceFilter}%`;
    const cityCounts = db
      .prepare(
        `SELECT city, province, COUNT(*) as count
         FROM public_people
         WHERE sourceFile LIKE ?
         GROUP BY city, province`
      )
      .all(sourcePattern) as { city: string; province: string | null; count: number }[];

    // For each city with this source, get coordinates from city_points
    rows = cityCounts
      .map((c) => {
        const point = db
          .prepare(
            `SELECT lat, lng FROM public_city_points WHERE city = ? AND province = ? LIMIT 1`
          )
          .get(c.city, c.province) as { lat: number | null; lng: number | null } | undefined;
        if (!point || point.lat == null || point.lng == null) return null;
        return {
          id: 0,
          province: c.province,
          city: c.city,
          lat: point.lat,
          lng: point.lng,
          totalRecords: c.count,
        } as PublicCityPoint;
      })
      .filter((r): r is PublicCityPoint => r !== null);
  } else {
    const where = province ? 'WHERE province = ?' : '';
    const params = province ? [province] : [];
    rows = db
      .prepare(
        `SELECT lat, lng, city, province, totalRecords FROM public_city_points ${where}`
      )
      .all(...params) as PublicCityPoint[];
  }

  // Cluster by rounded coordinates
  const clusters = new Map<
    string,
    {
      lat: number;
      lng: number;
      totalRecords: number;
      cities: { city: string; province: string | null; count: number }[];
    }
  >();

  for (const p of rows) {
    if (p.lat == null || p.lng == null) continue;
    const key = `${Math.round(p.lat * 10) / 10},${Math.round(p.lng * 10) / 10}`;
    const existing = clusters.get(key);
    if (existing) {
      existing.totalRecords += p.totalRecords;
      const cityExists = existing.cities.some(
        (c) => c.city === p.city && c.province === p.province
      );
      if (!cityExists && p.city) {
        existing.cities.push({
          city: p.city,
          province: p.province,
          count: p.totalRecords,
        });
      } else if (cityExists) {
        const c = existing.cities.find(
          (c) => c.city === p.city && c.province === p.province
        );
        if (c) c.count += p.totalRecords;
      }
    } else {
      clusters.set(key, {
        lat: Math.round(p.lat * 10) / 10,
        lng: Math.round(p.lng * 10) / 10,
        totalRecords: p.totalRecords,
        cities: p.city
          ? [{ city: p.city, province: p.province, count: p.totalRecords }]
          : [],
      });
    }
  }

  return Array.from(clusters.values())
    .map((c) => ({
      ...c,
      precisionType: 'city',
    }))
    .sort((a, b) => b.totalRecords - a.totalRecords);
}

/** Get list of provinces with counts */
export function getProvinces(): ProvinceResult[] {
  const db = getPublicDb();

  const rows = db
    .prepare(
      `SELECT province, COUNT(*) as totalRecords
       FROM public_people
       WHERE province IS NOT NULL
       GROUP BY province
       ORDER BY totalRecords DESC`
    )
    .all() as { province: string; totalRecords: number }[];

  return rows.map((r) => {
    const cityCountRow = db
      .prepare(
        `SELECT COUNT(DISTINCT city) as cnt
         FROM public_people
         WHERE province = ? AND city IS NOT NULL`
      )
      .get(r.province) as { cnt: number };
    return {
      province: r.province,
      totalRecords: r.totalRecords,
      cityCount: cityCountRow.cnt,
    };
  });
}

/** Get cities for a province */
export function getCitiesByProvince(province: string): CityResult[] {
  const db = getPublicDb();

  return db
    .prepare(
      `SELECT city, COUNT(*) as totalRecords
       FROM public_people
       WHERE province = ? AND city IS NOT NULL
       GROUP BY city
       ORDER BY totalRecords DESC`
    )
    .all(province) as CityResult[];
}

/** Search people with pagination */
export function searchPeople(
  q?: string,
  province?: string,
  city?: string,
  page: number = 1,
  limit: number = 50
): { data: PublicPerson[]; pagination: SearchPagination } {
  const db = getPublicDb();
  const effectiveLimit = Math.min(100, Math.max(1, limit));
  const effectivePage = Math.max(1, page);
  const offset = (effectivePage - 1) * effectiveLimit;

  // Build WHERE dynamically
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (q) {
    // Try FTS5 first
    try {
      const ftsCheck = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='public_people_fts'")
        .get();
      if (ftsCheck) {
        // FTS5 search
        const ftsQuery = q
          .split(/\s+/)
          .filter(Boolean)
          .map((term) => `"${term}"`)
          .join(' AND ');

        const ftsResults = db
          .prepare(
            `SELECT id FROM public_people_fts WHERE public_people_fts MATCH ? ORDER BY rank LIMIT 500`
          )
          .all(ftsQuery) as { id: number }[];

        if (ftsResults.length > 0) {
          const ids = ftsResults.map((r) => r.id);
          const placeholders = ids.map(() => '?').join(',');
          conditions.push(`id IN (${placeholders})`);
          params.push(...ids);
        }
      }
    } catch {
      // FTS5 failed, fall through to LIKE
    }

    // Fallback: LIKE (only if FTS5 returned no results or is unavailable)
    if (conditions.length === 0) {
      const likeConditions: string[] = [];
      const terms = q.split(/\s+/).filter(Boolean);
      for (const term of terms) {
        const likeClauses = [
          'fullName LIKE ?',
          'province LIKE ?',
          'city LIKE ?',
        ];
        const likeParams = [term, term, term].map((t) => `%${t}%`);
        likeConditions.push(`(${likeClauses.join(' OR ')})`);
        params.push(...likeParams);
      }
      conditions.push(`(${likeConditions.join(' AND ')})`);
    }
  }

  if (province) {
    conditions.push('province = ?');
    params.push(province);
  }
  if (city) {
    conditions.push('city = ?');
    params.push(city);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total
  const countRow = db
    .prepare(`SELECT COUNT(*) as cnt FROM public_people ${whereClause}`)
    .get(...params) as { cnt: number };
  const total = countRow.cnt;

  // Fetch page
  const rows = db
    .prepare(
      `SELECT * FROM public_people ${whereClause} ORDER BY fullName ASC LIMIT ? OFFSET ?`
    )
    .all(...params, effectiveLimit, offset) as PublicPerson[];

  // Add Persian source labels; expose sensitive fields only when flag is on
  const data = rows.map((r) => ({
    ...r,
    sourceLabel: getPersianSourceLabel(r.sourceFile),
    fullPhone:     config.publishAppData ? (r as any).fullPhone     ?? null : undefined,
    fullPostal:    config.publishAppData ? (r as any).fullPostal    ?? null : undefined,
    address:       config.publishAppData ? (r as any).address       ?? null : undefined,
    dob:           config.publishAppData ? (r as any).dob           ?? null : undefined,
    nationalId:    config.publishAppData ? (r as any).nationalId    ?? null : undefined,
    dateOfAddress: config.publishAppData ? (r as any).dateOfAddress ?? null : undefined,
  }));

  return {
    data,
    pagination: {
      page: effectivePage,
      limit: effectiveLimit,
      total,
      totalPages: Math.ceil(total / effectiveLimit),
    },
  };
}

/** Get people for a specific city */
export function getPeopleByCity(
  cityName: string,
  province?: string,
  q?: string,
  page: number = 1,
  limit: number = 50
): { data: PublicPerson[]; pagination: SearchPagination } {
  return searchPeople(q, province, cityName, page, limit);
}

/** Get a single person by ID */
export function getPersonById(id: number): PublicPerson | null {
  const db = getPublicDb();
  const row = db
    .prepare('SELECT * FROM public_people WHERE id = ?')
    .get(id) as PublicPerson | undefined;
  if (!row) return null;
  return {
    ...row,
    sourceLabel:   getPersianSourceLabel(row.sourceFile),
    fullPhone:     config.publishAppData ? (row as any).fullPhone     ?? null : undefined,
    fullPostal:    config.publishAppData ? (row as any).fullPostal    ?? null : undefined,
    address:       config.publishAppData ? (row as any).address       ?? null : undefined,
    dob:           config.publishAppData ? (row as any).dob           ?? null : undefined,
    nationalId:    config.publishAppData ? (row as any).nationalId    ?? null : undefined,
    dateOfAddress: config.publishAppData ? (row as any).dateOfAddress ?? null : undefined,
  };
}

/** Get public statistics */
export function getPublicStats(): {
  totalPeople: number;
  totalCities: number;
  totalProvinces: number;
  totalReviewed: number;
  totalUnreviewed: number;
} {
  const db = getPublicDb();
  const totalPeople = (
    db.prepare('SELECT COUNT(*) as cnt FROM public_people').get() as { cnt: number }
  ).cnt;
  const totalCities = (
    db
      .prepare('SELECT COUNT(DISTINCT city) as cnt FROM public_people WHERE city IS NOT NULL')
      .get() as { cnt: number }
  ).cnt;
  const totalProvinces = (
    db
      .prepare('SELECT COUNT(DISTINCT province) as cnt FROM public_people WHERE province IS NOT NULL')
      .get() as { cnt: number }
  ).cnt;
  const totalReviewed = (
    db
      .prepare("SELECT COUNT(*) as cnt FROM public_people WHERE reviewStatus = 'reviewed'")
      .get() as { cnt: number }
  ).cnt;
  const totalUnreviewed = (
    db
      .prepare("SELECT COUNT(*) as cnt FROM public_people WHERE reviewStatus != 'reviewed'")
      .get() as { cnt: number }
  ).cnt;

  return { totalPeople, totalCities, totalProvinces, totalReviewed, totalUnreviewed };
}

/** Get source breakdown for a city (and optionally province) */
export function getCitySourceBreakdown(
  city: string,
  province?: string | null
): { sourceLabel: string; sourceFile: string; count: number }[] {
  const db = getPublicDb();
  const conditions: string[] = ['city = ?'];
  const params: unknown[] = [city];
  if (province) {
    conditions.push('province = ?');
    params.push(province);
  }

  const rows = db
    .prepare(
      `SELECT sourceFile, COUNT(*) as count
       FROM public_people
       WHERE ${conditions.join(' AND ')}
       GROUP BY sourceFile
       ORDER BY count DESC`
    )
    .all(...params) as { sourceFile: string; count: number }[];

  return rows.map((r) => ({
    sourceFile: r.sourceFile,
    sourceLabel: getPersianSourceLabel(r.sourceFile),
    count: r.count,
  }));
}

/** Get health status */
export function getHealth(): HealthStatus {
  const diskExists = fs.existsSync(config.databasePath);
  const ready = isMemoryDbReady();

  let peopleCount = 0;
  let cityMarkerCount = 0;

  if (ready) {
    try {
      const db = getPublicDb();
      peopleCount = (
        db.prepare('SELECT COUNT(*) as cnt FROM public_people').get() as { cnt: number }
      ).cnt;
      cityMarkerCount = (
        db.prepare('SELECT COUNT(*) as cnt FROM public_city_points').get() as { cnt: number }
      ).cnt;
    } catch {
      // Ignore errors in health check
    }
  }

  const s = getState();
  return {
    status: ready ? 'ok' : s.initError ? 'error' : 'initializing',
    diskDbExists: diskExists,
    memoryDbReady: ready,
    publicPeopleCount: peopleCount,
    cityMarkerCount,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    error: s.initError || undefined,
  };
}
