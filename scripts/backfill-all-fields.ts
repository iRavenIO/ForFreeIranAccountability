/**
 * Backfill address, dob, nationalId, maskedNationalId, dateOfAddress
 * on existing PublicPerson rows from their rawJson in RawRecord.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbRelPath = (process.env.DATABASE_URL || 'file:../db/accountability.db')
  .replace('file:', '').replace(/^\.\.\//, '');
const dbPath = path.resolve(__dirname, '..', dbRelPath);

if (!fs.existsSync(dbPath)) { console.error('DB not found at', dbPath); process.exit(1); }
console.log(`\nBackfilling from: ${dbPath}\n`);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function getField(obj: Record<string, unknown>, patterns: string[]): string | null {
  const patternSet = new Set(patterns.map(p => p.toLowerCase().replace(/[\s_-]+/g, '')));
  for (const [key, val] of Object.entries(obj)) {
    if (!val || key === '_normalized') continue;
    const k = key.toLowerCase().replace(/[\s_-]+/g, '');
    if (patternSet.has(k)) {
      const s = String(val).trim();
      if (s) return s;
    }
  }
  return null;
}

const rawRows = db.prepare(`
  SELECT fullName, province, city, sourceFile, postalCodeInternal, rawJson
  FROM RawRecord
`).all() as { fullName: string | null; province: string | null; city: string | null; sourceFile: string; postalCodeInternal: string | null; rawJson: string }[];

console.log(`Processing ${rawRows.length} raw records...`);

const update = db.prepare(`
  UPDATE PublicPerson SET
    address          = COALESCE(address,          ?),
    dob              = COALESCE(dob,              ?),
    nationalId       = COALESCE(nationalId,       ?),
    maskedNationalId = COALESCE(maskedNationalId, ?),
    dateOfAddress    = COALESCE(dateOfAddress,    ?),
    maskedPostal     = COALESCE(maskedPostal,     ?),
    fullPostal       = COALESCE(fullPostal,       ?)
  WHERE fullName IS ? AND province IS ? AND city IS ? AND sourceFile = ?
    AND (address IS NULL OR nationalId IS NULL)
`);

const backfill = db.transaction(() => {
  let updated = 0;
  for (const row of rawRows) {
    let raw: Record<string, unknown>;
    try { raw = JSON.parse(row.rawJson); } catch { continue; }

    const address       = getField(raw, ['address', 'homeaddress', 'home_address', 'location', 'place']);
    const dob           = getField(raw, ['dob', 'dateofbirth', 'date_of_birth', 'birthdate', 'birth_date']);
    const nationalId    = getField(raw, ['nationalid', 'national_id', 'nationalcode', 'national_code', 'idnumber', 'id_number']);
    const dateOfAddress = getField(raw, ['dateofaddress', 'date_of_address', 'addressdate', 'address_date']);

    const postalCode = row.postalCodeInternal;
    const cleanNationalId = nationalId ? nationalId.replace(/\D/g, '') : null;

    const maskedNationalId = cleanNationalId && cleanNationalId.length >= 4
      ? `****${cleanNationalId.slice(-4)}` : null;
    const maskedPostal = postalCode && postalCode.length >= 4
      ? `****${postalCode.slice(-4)}` : null;

    if (!address && !dob && !cleanNationalId && !postalCode) continue;

    const result = update.run(
      address, dob, cleanNationalId, maskedNationalId, dateOfAddress,
      maskedPostal, postalCode,
      row.fullName, row.province, row.city, row.sourceFile,
    );
    updated += result.changes;
  }
  return updated;
});

const total = backfill();
db.close();
console.log(`Done — updated ${total} PublicPerson records.\n`);
