/**
 * Backfill maskedPhone, maskedPostal, fullPhone, fullPostal
 * on existing PublicPerson rows from their corresponding RawRecord data.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const PHONE_KEYS = new Set([
  'phone', 'mobile', 'tel', 'telephone', 'cellphone', 'cell',
  'phonenumber', 'phone_number', 'mobilenumber', 'mobile_number',
  'شماره', 'تلفن', 'موبایل',
]);

function extractPhone(rawJson: string): string | null {
  try {
    const raw = JSON.parse(rawJson);
    for (const [key, val] of Object.entries(raw)) {
      if (!val || key === '_normalized') continue;
      const k = key.toLowerCase().replace(/[\s_-]+/g, '');
      if (PHONE_KEYS.has(k) || [...PHONE_KEYS].some(p => k.includes(p.replace(/[\s_-]+/g, '')))) {
        const digits = String(val).replace(/\D/g, '');
        if (digits.length >= 7) return digits;
      }
    }
  } catch {}
  return null;
}

const dbRelPath = (process.env.DATABASE_URL || 'file:../db/accountability.db')
  .replace('file:', '')
  .replace(/^\.\.\//, '');
const dbPath = path.resolve(__dirname, '..', dbRelPath);

if (!fs.existsSync(dbPath)) {
  console.error('DB not found at', dbPath);
  process.exit(1);
}

console.log(`\nBackfilling from: ${dbPath}\n`);
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const rawRows = db.prepare(
  `SELECT fullName, province, city, sourceFile, postalCodeInternal, rawJson
   FROM RawRecord
   WHERE postalCodeInternal IS NOT NULL OR rawJson LIKE '%phone%' OR rawJson LIKE '%mobile%' OR rawJson LIKE '%tel%' OR rawJson LIKE '%تلفن%' OR rawJson LIKE '%موبایل%'`
).all() as { fullName: string | null; province: string | null; city: string | null; sourceFile: string; postalCodeInternal: string | null; rawJson: string }[];

console.log(`Found ${rawRows.length} raw records to process`);

const update = db.prepare(`
  UPDATE PublicPerson
  SET
    maskedPhone  = CASE WHEN ? IS NOT NULL THEN ? ELSE maskedPhone END,
    maskedPostal = CASE WHEN ? IS NOT NULL THEN ? ELSE maskedPostal END,
    fullPhone    = CASE WHEN ? IS NOT NULL THEN ? ELSE fullPhone END,
    fullPostal   = CASE WHEN ? IS NOT NULL THEN ? ELSE fullPostal END
  WHERE fullName = ? AND province IS ? AND city IS ? AND sourceFile = ?
    AND maskedPostal IS NULL AND maskedPhone IS NULL
`);

const backfill = db.transaction(() => {
  let updated = 0;
  for (const row of rawRows) {
    const phone = extractPhone(row.rawJson);
    const postal = row.postalCodeInternal;

    if (!phone && !postal) continue;

    const maskedPhone  = phone  && phone.length  >= 4 ? `****${phone.slice(-4)}`  : null;
    const maskedPostal = postal && postal.length >= 4 ? `****${postal.slice(-4)}` : null;

    const result = update.run(
      maskedPhone,  maskedPhone,
      maskedPostal, maskedPostal,
      phone,        phone,
      postal,       postal,
      row.fullName, row.province, row.city, row.sourceFile,
    );
    updated += result.changes;
  }
  return updated;
});

const totalUpdated = backfill();
db.close();

console.log(`\nDone — updated ${totalUpdated} PublicPerson records.\n`);
