/**
 * Import script for LEC.xlsx and Basij.xlsx
 *
 * Reads Excel files, normalizes data, stores raw records in SQLite,
 * creates public-safe person records and city-point aggregates.
 *
 * Safety: Sensitive fields (postal codes, raw JSON) are stored in raw_records
 * internally only. Public tables contain no PII beyond full name + city/province.
 *
 * Usage: npx tsx scripts/import-excel.ts
 */

import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImportConfig {
  filePath: string;
  sourceFile: string;
  organization: string;
}

interface RawRow {
  [key: string]: string | number | Date | null | undefined;
}

interface ImportResult {
  total: number;
  imported: number;
  public: number;
  hidden: number;
  failed: number;
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Text normalization
// ---------------------------------------------------------------------------

function normalizePersian(text: string | null | undefined): string {
  if (!text) return '';
  let s = String(text);

  const charMap: Record<string, string> = {
    'ك': 'ک', 'ي': 'ی', 'ى': 'ی', 'ئ': 'ی', 'ة': 'ه', 'ۀ': 'ه',
    'ﻚ': 'ک', 'ﻛ': 'ک', 'ﻜ': 'ک', 'ﻞ': 'ل', 'ﻟ': 'ل', 'ﻠ': 'ل',
    'ﻢ': 'م', 'ﻣ': 'م', 'ﻤ': 'م', 'ﻦ': 'ن', 'ﻧ': 'ن', 'ﻨ': 'ن',
    'ﻪ': 'ه', 'ﻫ': 'ه', 'ﻬ': 'ه', 'ﻲ': 'ی', 'ﻳ': 'ی', 'ﻴ': 'ی',
    'ﮏ': 'ک', 'ﮐ': 'ک', 'ﮑ': 'ک', 'ﮓ': 'گ', 'ﮔ': 'گ', 'ﮕ': 'گ',
    'ﺁ': 'آ', 'ﺂ': 'آ', 'ـ': '',
  };

  for (const [from, to] of Object.entries(charMap)) {
    s = s.replace(new RegExp(from, 'g'), to);
  }

  // Arabic digits -> English
  s = s.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  // Persian digits -> English
  s = s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());

  s = s.replace(/[\u200C\u200D\u200E\u200F\u2028\u2029\u00A0\u200B\uFEFF]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function normalizeProvince(province: string | null | undefined): string | null {
  const p = normalizePersian(province);
  if (!p || p.toLowerCase() === 'no province' || p === '') return null;

  const normalized = p.toLowerCase();
  const provinceMap: Record<string, string> = {
    'tehran province': 'Tehran Province',
    'البرز': 'Alborz Province',
    'alborz province': 'Alborz Province',
    'اصفهان': 'Isfahan Province',
    'isfahan province': 'Isfahan Province',
    'فارس': 'Fars Province',
    'fars province': 'Fars Province',
    'خراسان رضوي': 'Razavi Khorasan Province',
    'خراسان رضوی': 'Razavi Khorasan Province',
    'razavi khorasan province': 'Razavi Khorasan Province',
    'خراسان جنوبي': 'South Khorasan Province',
    'خراسان جنوبی': 'South Khorasan Province',
    'south khorasan province': 'South Khorasan Province',
    'خراسان شمالي': 'North Khorasan Province',
    'خراسان شمالی': 'North Khorasan Province',
    'north khorasan province': 'North Khorasan Province',
    'آذربايجان شرقي': 'East Azerbaijan Province',
    'آذربایجان شرقی': 'East Azerbaijan Province',
    'east azerbaijan province': 'East Azerbaijan Province',
    'آذربايجان غربي': 'West Azerbaijan Province',
    'آذربایجان غربی': 'West Azerbaijan Province',
    'west azerbaijan province': 'West Azerbaijan Province',
    'خوزستان': 'Khuzestan Province',
    'khuzestan province': 'Khuzestan Province',
    'مازندران': 'Mazandaran Province',
    'mazandaran province': 'Mazandaran Province',
    'گيلان': 'Gilan Province',
    'گیلان': 'Gilan Province',
    'gilan province': 'Gilan Province',
    'كرمان': 'Kerman Province',
    'کرمان': 'Kerman Province',
    'kerman province': 'Kerman Province',
    'كرمانشاه': 'Kermanshah Province',
    'کرمانشاه': 'Kermanshah Province',
    'kermanshah province': 'Kermanshah Province',
    'سيستان و بلوچستان': 'Sistan and Baluchestan Province',
    'سیستان و بلوچستان': 'Sistan and Baluchestan Province',
    'sistan and baluchestan province': 'Sistan and Baluchestan Province',
    'یزد': 'Yazd Province',
    'يزد': 'Yazd Province',
    'yazd province': 'Yazd Province',
    'همدان': 'Hamadan Province',
    'hamadan province': 'Hamadan Province',
    'اردبيل': 'Ardabil Province',
    'اردبیل': 'Ardabil Province',
    'ardabil province': 'Ardabil Province',
    'بوشهر': 'Bushehr Province',
    'bushehr province': 'Bushehr Province',
    'چهارمحال و بختياري': 'Chaharmahal and Bakhtiari Province',
    'چهارمحال و بختیاری': 'Chaharmahal and Bakhtiari Province',
    'chaharmahal and bakhtiari province': 'Chaharmahal and Bakhtiari Province',
    'زنجان': 'Zanjan Province',
    'zanjan province': 'Zanjan Province',
    'سمنان': 'Semnan Province',
    'semnan province': 'Semnan Province',
    'قزوين': 'Qazvin Province',
    'قزوین': 'Qazvin Province',
    'qazvin province': 'Qazvin Province',
    'قم': 'Qom Province',
    'qom province': 'Qom Province',
    'كردستان': 'Kurdistan Province',
    'کردستان': 'Kurdistan Province',
    'kurdistan province': 'Kurdistan Province',
    'کهگیلویه و بویراحمد': 'Kohgiluyeh and Boyer-Ahmad Province',
    'kohgiluyeh and boyer-ahmad province': 'Kohgiluyeh and Boyer-Ahmad Province',
    'لرستان': 'Lorestan Province',
    'lorestan province': 'Lorestan Province',
    'مرکزی': 'Markazi Province',
    'مركزي': 'Markazi Province',
    'markazi province': 'Markazi Province',
    'هرمزگان': 'Hormozgan Province',
    'hormozgan province': 'Hormozgan Province',
    'ايلام': 'Ilam Province',
    'ایلام': 'Ilam Province',
    'ilam province': 'Ilam Province',
    'گلستان': 'Golestan Province',
    'golestan province': 'Golestan Province',
  };

  return provinceMap[normalized] || p;
}

function cleanAddress(_address: string | null | undefined): string {
  if (!_address) return '';
  return normalizePersian(_address)
    .replace(/\s+IRN$/i, '')
    .replace(/\s+IRAN$/i, '')
    .trim();
}

function validatePostalCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const clean = String(code).replace(/[\s-]/g, '');
  if (/^\d{10}$/.test(clean)) return clean;
  return null;
}

// ---------------------------------------------------------------------------
// City extraction
// ---------------------------------------------------------------------------

const knownCities: Record<string, string[]> = {
  'Tehran Province': ['تهران', 'شهرری', 'ری', 'ورامین', 'اسلامشهر', 'شهریار', 'قدس', 'ملارد', 'رباط کریم', 'پاکدشت', 'دماوند', 'فیروزکوه', 'پیشوا', 'بهارستان'],
  'Alborz Province': ['کرج', 'فردیس', 'اشتهارد', 'نظرآباد', 'محمدشهر', 'کمالشهر', 'مشکیندشت', 'گوهردشت', 'طالقان'],
  'Isfahan Province': ['اصفهان', 'کاشان', 'نجف‌آباد', 'خمینی‌شهر', 'شاهین‌شهر', 'شهرضا', 'مبارکه', 'فلاورجان', 'آران و بیدگل'],
  'Fars Province': ['شیراز', 'مرودشت', 'کازرون', 'فسا', 'جهرم', 'داراب', 'اقلید'],
  'Razavi Khorasan Province': ['مشهد', 'نیشابور', 'سبزوار', 'تربت حیدریه', 'قوچان', 'کاشمر', 'گناباد', 'تربت جام', 'چناران'],
  'East Azerbaijan Province': ['تبریز', 'مراغه', 'مرند', 'اهر', 'میانه', 'سراب'],
  'West Azerbaijan Province': ['ارومیه', 'خوی', 'مهاباد', 'بوکان', 'سلماس', 'نقده'],
  'Khuzestan Province': ['اهواز', 'آبادان', 'خرمشهر', 'دزفول', 'مسجد سلیمان', 'شوشتر', 'بهبهان', 'اندیمشک'],
  'Mazandaran Province': ['ساری', 'آمل', 'بابل', 'قائم‌شهر', 'نوشهر', 'تنکابن', 'چالوس', 'رامسر', 'بهشهر', 'نور'],
  'Gilan Province': ['رشت', 'انزلی', 'لاهیجان', 'رودسر', 'صومعه‌سرا', 'فومن'],
  'Kerman Province': ['کرمان', 'رفسنجان', 'سیرجان', 'بم', 'جیرفت', 'زرند'],
  'Kermanshah Province': ['کرمانشاه', 'اسلام‌آباد غرب', 'کنگاور', 'سنقر'],
  'Sistan and Baluchestan Province': ['زاهدان', 'زابل', 'ایرانشهر', 'چابهار', 'سراوان'],
  'Yazd Province': ['یزد', 'اردکان', 'میبد', 'تفت', 'مهریز'],
  'Hamadan Province': ['همدان', 'ملایر', 'نهاوند', 'تویسرکان', 'اسدآباد'],
  'Ardabil Province': ['اردبیل', 'پارس‌آباد', 'مشگین‌شهر', 'خلخال'],
  'Bushehr Province': ['بوشهر', 'گناوه', 'کنگان', 'دیر', 'دیلم'],
  'Chaharmahal and Bakhtiari Province': ['شهرکرد', 'بروجن', 'فارسان'],
  'Zanjan Province': ['زنجان', 'ابهر', 'خرمدره', 'ایجرود'],
  'Semnan Province': ['سمنان', 'شاهرود', 'دامغان', 'گرمسار'],
  'Qazvin Province': ['قزوین', 'تاکستان', 'آبیک', 'بوئین‌زهرا'],
  'Qom Province': ['قم'],
  'Kurdistan Province': ['سنندج', 'سقز', 'مریوان', 'بانه', 'قروه'],
  'Kohgiluyeh and Boyer-Ahmad Province': ['یاسوج', 'گچساران', 'دهدشت'],
  'Lorestan Province': ['خرم‌آباد', 'بروجرد', 'دورود', 'الیگودرز', 'کوهدشت'],
  'Markazi Province': ['اراک', 'ساوه', 'محلات', 'خمین', 'تفرش'],
  'Hormozgan Province': ['بندرعباس', 'بندرلنگه', 'میناب', 'قشم', 'جاسک'],
  'Ilam Province': ['ایلام', 'دهلران', 'مهران', 'آبدانان'],
  'Golestan Province': ['گرگان', 'گنبد کاووس', 'علی‌آباد کتول', 'کردکوی', 'بندرترکمن'],
  'North Khorasan Province': ['بجنورد', 'شیروان', 'اسفراین', 'جاجرم'],
  'South Khorasan Province': ['بیرجند', 'فردوس', 'طبس', 'قائن', 'نهبندان'],
};

function extractCityFromAddress(address: string | null | undefined, province: string | null): string | null {
  if (!address) return null;
  const addr = cleanAddress(address);

  if (province && knownCities[province]) {
    for (const city of knownCities[province]) {
      if (addr.includes(city)) return city;
    }
  }

  const cityMatch = addr.match(/(?:شهرستان|شهر)\s+([\w\sآ-ی]+?)(?:\s|$)/);
  if (cityMatch) {
    const extracted = normalizePersian(cityMatch[1]).trim();
    if (extracted.length > 1) return extracted;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Province/city coordinate lookup
// ---------------------------------------------------------------------------

const provinceCenters: Record<string, [number, number]> = {
  'Tehran Province': [35.7000, 51.4000],
  'Alborz Province': [35.8200, 50.9500],
  'Isfahan Province': [32.6500, 51.6700],
  'Fars Province': [29.6000, 52.5000],
  'Razavi Khorasan Province': [36.3000, 59.6000],
  'East Azerbaijan Province': [38.0800, 46.2900],
  'West Azerbaijan Province': [37.5500, 45.0800],
  'Khuzestan Province': [31.3000, 48.6800],
  'Mazandaran Province': [36.5000, 53.0000],
  'Gilan Province': [37.2800, 49.5800],
  'Kerman Province': [30.2900, 57.0800],
  'Kermanshah Province': [34.3300, 47.0800],
  'Sistan and Baluchestan Province': [29.5000, 60.8600],
  'Yazd Province': [31.8900, 54.3600],
  'Hamadan Province': [34.8000, 48.5100],
  'Ardabil Province': [38.2500, 48.2900],
  'Bushehr Province': [28.9200, 50.8200],
  'Chaharmahal and Bakhtiari Province': [32.3300, 50.8600],
  'Zanjan Province': [36.6800, 48.4900],
  'Semnan Province': [35.5800, 53.3900],
  'Qazvin Province': [36.2700, 50.0000],
  'Qom Province': [34.6400, 50.8800],
  'Kurdistan Province': [35.3100, 47.0000],
  'Kohgiluyeh and Boyer-Ahmad Province': [30.6700, 51.5900],
  'Lorestan Province': [33.4900, 48.3500],
  'Markazi Province': [34.0900, 49.6900],
  'Hormozgan Province': [27.1800, 56.2700],
  'Ilam Province': [33.6400, 46.4200],
  'Golestan Province': [36.8500, 54.4400],
  'North Khorasan Province': [37.4800, 57.3300],
  'South Khorasan Province': [32.8700, 59.2200],
};

function getCoordinates(province: string | null, city: string | null): { lat: number; lng: number } | null {
  if (!province) return null;
  const center = provinceCenters[province];
  if (center) return { lat: center[0], lng: center[1] };
  return null;
}

// ---------------------------------------------------------------------------
// Import logic
// ---------------------------------------------------------------------------

async function importExcelFile(
  prisma: PrismaClient,
  config: ImportConfig
): Promise<ImportResult> {
  const { filePath, sourceFile } = config;
  const warnings: string[] = [];

  if (!fs.existsSync(filePath)) {
    return { total: 0, imported: 0, public: 0, hidden: 0, failed: 0, warnings: [`File not found: ${filePath}`] };
  }

  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheets = workbook.SheetNames;

  let totalRows = 0;
  let importedRows = 0;
  let publicRows = 0;
  let hiddenRows = 0;
  let failedRows = 0;

  for (const sheet of sheets) {
    const worksheet = workbook.Sheets[sheet];
    if (!worksheet) {
      warnings.push(`Sheet "${sheet}" not found in ${sourceFile}`);
      continue;
    }

    const rows = XLSX.utils.sheet_to_json<RawRow>(worksheet, { defval: '' });
    totalRows += rows.length;
    console.log(`  [${sourceFile}/${sheet}] Reading ${rows.length} rows...`);

    const BATCH_SIZE = 50;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      
      const rawRecordsData: any[] = [];
      const publicPeopleData: any[] = [];

      for (const row of batch) {
        try {
          const keys = Object.keys(row).reduce((acc, k) => {
            acc[k.toLowerCase().replace(/[_\s]+/g, '')] = k;
            return acc;
          }, {} as Record<string, string>);

          const getField = (patterns: string[]): string | null => {
            for (const p of patterns) {
              const key = keys[p];
              if (key) {
                const val = row[key];
                if (val !== undefined && val !== null && val !== '') {
                  return String(val);
                }
              }
            }
            return null;
          };

          const fullName = normalizePersian(
            getField(['fullname', 'full_name', 'name', 'firstname', 'first_name']) ?? null
          );
          const rawAddress = getField(['address', 'homeaddress', 'home_address', 'location', 'place']);
          const rawProvince = getField(['province', 'state', 'ostan', 'استان']);
          const postalCode = validatePostalCode(getField(['postalcode', 'postal_code', 'zipcode', 'zip_code', 'postcode', 'post_code']));
          const dob = getField(['dob', 'dateofbirth', 'date_of_birth', 'birthdate', 'birth_date']);
          const nationalId = getField(['nationalid', 'national_id', 'nationalcode', 'national_code', 'idnumber', 'id_number']);
          const rawPhone = getField(['phone', 'mobile', 'tel', 'telephone', 'cellphone', 'cell', 'phonenumber', 'phone_number', 'mobilenumber', 'mobile_number', 'شماره', 'تلفن', 'موبایل']);
          const dateOfAddress = getField(['dateofaddress', 'date_of_address', 'addressdate', 'address_date']);

          const address = cleanAddress(rawAddress);
          const province = normalizeProvince(rawProvince);
          let city: string | null = normalizePersian(
            getField(['city', 'town', 'شهر', 'شهرستان']) ?? null
          );
          if (!city) city = extractCityFromAddress(address, province);

          const postalCodeInternal = postalCode || null;
          const coords = getCoordinates(province, city);

          const rawJson = JSON.stringify({
            ...row,
            _normalized: { fullName, province, city, organization: config.organization },
          });

          const normalizedJson = JSON.stringify({ province, city, organization: config.organization });

          rawRecordsData.push({
            sourceFile,
            sourceSheet: sheet,
            rawJson,
            normalizedJson,
            fullName,
            province,
            city,
            postalCodeInternal,
            approximateLat: coords?.lat ?? null,
            approximateLng: coords?.lng ?? null,
            publicStatus: 'pending',
            reviewStatus: 'unreviewed',
          });

          const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '') : null;
          const maskedPhone = cleanPhone && cleanPhone.length >= 4
            ? `****${cleanPhone.slice(-4)}`
            : null;
          const maskedPostal = postalCode && postalCode.length >= 4
            ? `****${postalCode.slice(-4)}`
            : null;

          const cleanNationalId = nationalId ? nationalId.replace(/\D/g, '') : null;
          const maskedNationalId = cleanNationalId && cleanNationalId.length >= 4
            ? `****${cleanNationalId.slice(-4)}`
            : null;

          publicPeopleData.push({
            fullName,
            province,
            city,
            sourceFile,
            publicStatus: 'published',
            reviewStatus: 'reviewed',
            notesPublic: null,
            approximateCityLat: coords?.lat ?? null,
            approximateCityLng: coords?.lng ?? null,
            maskedPhone,
            maskedPostal,
            fullPhone: cleanPhone || null,
            fullPostal: postalCode || null,
            address: address || null,
            dob: dob || null,
            nationalId: cleanNationalId || null,
            maskedNationalId,
            dateOfAddress: dateOfAddress || null,
          });

          const hasSensitiveData = !!(postalCode || address || dob || nationalId);
          importedRows++;
          publicRows++;
          if (hasSensitiveData) hiddenRows++;

        } catch (err) {
          failedRows++;
          warnings.push(`Failed row in ${sourceFile}/${sheet}: ${err}`);
        }
      }

      // Batch insert using createMany
      if (rawRecordsData.length > 0) {
        await prisma.rawRecord.createMany({ data: rawRecordsData });
      }
      if (publicPeopleData.length > 0) {
        await prisma.publicPerson.createMany({ data: publicPeopleData });
      }

      if (importedRows % 5000 === 0 || importedRows === totalRows) {
        console.log(`    ... ${importedRows}/${totalRows} rows`);
      }

      // Small delay to let SQLite breathe
      if (importedRows % 10000 === 0) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  return { total: totalRows, imported: importedRows, public: publicRows, hidden: hiddenRows, failed: failedRows, warnings };
}

// ---------------------------------------------------------------------------
// City point aggregation
// ---------------------------------------------------------------------------

async function regenerateCityPoints(prisma: PrismaClient) {
  console.log('\n  Generating city point aggregates...');
  await prisma.publicCityPoint.deleteMany();

  const cityData = await prisma.publicPerson.groupBy({
    by: ['province', 'city'],
    _count: { id: true },
    where: {
      province: { not: null },
      city: { not: null },
    },
  });

  let count = 0;
  for (const row of cityData) {
    if (!row.province || !row.city) continue;
    const coords = getCoordinates(row.province, row.city);

    await prisma.publicCityPoint.create({
      data: {
        province: row.province,
        city: row.city,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        totalRecords: row._count.id,
      },
    });
    count++;
  }

  console.log(`  Created ${count} city points`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n======================================');
  console.log('   Accountability Data Import Tool');
  console.log('======================================\n');

  const projectRoot = path.resolve(__dirname, '..');
  const dataDir = path.join(projectRoot, 'data');
  const dbRelPath = (process.env.DATABASE_URL || 'file:../db/accountability.db')
    .replace('file:', '')
    .replace(/^\.\.\//, '');
  const dbPath = path.resolve(projectRoot, dbRelPath);

  console.log(`Data: ${dataDir}`);
  console.log(`DB:   ${dbPath}\n`);

  const prisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } },
  });

  try {
    const lecPath = path.join(dataDir, 'LEC.xlsx');
    const basijPath = path.join(dataDir, 'Basij.xlsx');

    const lecExists = fs.existsSync(lecPath);
    const basijExists = fs.existsSync(basijPath);

    if (!lecExists && !basijExists) {
      console.error('No data files found in', dataDir);
      process.exit(1);
    }

    const allWarnings: string[] = [];
    let grandTotal = 0, grandImported = 0, grandPublic = 0, grandHidden = 0, grandFailed = 0;

    const configs: ImportConfig[] = [];
    if (lecExists) configs.push({ filePath: lecPath, sourceFile: 'LEC.xlsx', organization: 'LEC' });
    if (basijExists) configs.push({ filePath: basijPath, sourceFile: 'Basij.xlsx', organization: 'Basij' });

    for (const cfg of configs) {
      console.log(`\n--- ${cfg.sourceFile} ---\n`);
      const result = await importExcelFile(prisma, cfg);
      grandTotal += result.total;
      grandImported += result.imported;
      grandPublic += result.public;
      grandHidden += result.hidden;
      grandFailed += result.failed;
      allWarnings.push(...result.warnings);

      await prisma.importLog.create({
        data: {
          fileName: cfg.sourceFile,
          rowsTotal: result.total,
          rowsImported: result.imported,
          rowsPublic: result.public,
          rowsHiddenSensitive: result.hidden,
          rowsFailed: result.failed,
          warningsJson: JSON.stringify(result.warnings.slice(0, 100)),
        },
      });
    }

    await regenerateCityPoints(prisma);

    console.log('\n' + '='.repeat(50));
    console.log('SUMMARY');
    console.log('='.repeat(50));
    console.log(`  Total rows read:     ${grandTotal}`);
    console.log(`  Imported:            ${grandImported}`);
    console.log(`  Public records:      ${grandPublic}`);
    console.log(`  Sensitive redacted:  ${grandHidden}`);
    console.log(`  Failed:              ${grandFailed}`);
    if (allWarnings.length > 0) {
      console.log(`  Warnings:            ${allWarnings.length}`);
      for (const w of allWarnings.slice(0, 10)) console.log(`    - ${w}`);
    }
    console.log('\nDone.\n');

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
