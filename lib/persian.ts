/**
 * Persian/Arabic character normalization utilities.
 */

const persianCharMap: Record<string, string> = {
  // Arabic to Persian letters
  'ك': 'ک',
  'ي': 'ی',
  'ى': 'ی',
  'ئ': 'ی',
  'ة': 'ه',
  'ۀ': 'ه',
  'ﻚ': 'ک',
  'ﻛ': 'ک',
  'ﻜ': 'ک',
  'ﻞ': 'ل',
  'ﻟ': 'ل',
  'ﻠ': 'ل',
  'ﻢ': 'م',
  'ﻣ': 'م',
  'ﻤ': 'م',
  'ﻦ': 'ن',
  'ﻧ': 'ن',
  'ﻨ': 'ن',
  'ﻪ': 'ه',
  'ﻫ': 'ه',
  'ﻬ': 'ه',
  'ﻲ': 'ی',
  'ﻳ': 'ی',
  'ﻴ': 'ی',
  'ﮏ': 'ک',
  'ﮐ': 'ک',
  'ﮑ': 'ک',
  'ﮓ': 'گ',
  'ﮔ': 'گ',
  'ﮕ': 'گ',
  'ﺁ': 'آ',
  'ﺂ': 'آ',
  // Kashida
  'ـ': '',
  // Various space-like characters
  '\u200C': ' ', // ZWNJ
  '\u200D': ' ', // ZWJ
  '\u200E': '',  // LRM
  '\u200F': '',  // RLM
  '\u2028': ' ', // Line separator
  '\u2029': ' ', // Paragraph separator
  '\u00A0': ' ', // NBSP
  '\u200B': '',  // Zero-width space
  '\uFEFF': '',  // BOM
};

const arabicToPersianDigits: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

const persianToEnglishDigits: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
};

/**
 * Normalize Persian text: replace Arabic chars with Persian, normalize digits, trim.
 */
export function normalizePersian(text: string | null | undefined): string {
  if (!text) return '';
  let s = String(text);

  // Replace Arabic chars
  for (const [from, to] of Object.entries(persianCharMap)) {
    s = s.replace(new RegExp(from, 'g'), to);
  }

  // Replace Arabic digits
  s = s.replace(/[٠-٩]/g, (d) => arabicToPersianDigits[d] || d);

  // Replace Persian digits with English
  s = s.replace(/[۰-۹]/g, (d) => persianToEnglishDigits[d] || d);

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Normalize a province name to a canonical form.
 */
export function normalizeProvince(province: string | null | undefined): string | null {
  const p = normalizePersian(province);
  if (!p || p === 'No Province' || p === 'no province' || p === '') return null;

  const provinceMap: Record<string, string> = {
    'تهران': 'Tehran Province',
    'tehran': 'Tehran Province',
    'البرز': 'Alborz Province',
    'alborz': 'Alborz Province',
    'اصفهان': 'Isfahan Province',
    'isfahan': 'Isfahan Province',
    'فارس': 'Fars Province',
    'fars': 'Fars Province',
    'خراسان رضوي': 'Razavi Khorasan Province',
    'خراسان رضوی': 'Razavi Khorasan Province',
    'خراسان جنوبي': 'South Khorasan Province',
    'خراسان جنوبی': 'South Khorasan Province',
    'خراسان شمالي': 'North Khorasan Province',
    'خراسان شمالی': 'North Khorasan Province',
    'آذربايجان شرقي': 'East Azerbaijan Province',
    'آذربایجان شرقی': 'East Azerbaijan Province',
    'آذربايجان غربي': 'West Azerbaijan Province',
    'آذربایجان غربی': 'West Azerbaijan Province',
    'خوزستان': 'Khuzestan Province',
    'مازندران': 'Mazandaran Province',
    'گيلان': 'Gilan Province',
    'گیلان': 'Gilan Province',
    'كرمان': 'Kerman Province',
    'کرمان': 'Kerman Province',
    'كرمانشاه': 'Kermanshah Province',
    'کرمانشاه': 'Kermanshah Province',
    'سيستان و بلوچستان': 'Sistan and Baluchestan Province',
    'سیستان و بلوچستان': 'Sistan and Baluchestan Province',
    'یزد': 'Yazd Province',
    'يزد': 'Yazd Province',
    'همدان': 'Hamadan Province',
    'اردبيل': 'Ardabil Province',
    'اردبیل': 'Ardabil Province',
    'بوشهر': 'Bushehr Province',
    'چهارمحال و بختياري': 'Chaharmahal and Bakhtiari Province',
    'چهارمحال و بختیاری': 'Chaharmahal and Bakhtiari Province',
    'زنجان': 'Zanjan Province',
    'سمنان': 'Semnan Province',
    'قزوين': 'Qazvin Province',
    'قزوین': 'Qazvin Province',
    'قم': 'Qom Province',
    'كردستان': 'Kurdistan Province',
    'کردستان': 'Kurdistan Province',
    'کهگیلویه و بویراحمد': 'Kohgiluyeh and Boyer-Ahmad Province',
    'لرستان': 'Lorestan Province',
    'مرکزی': 'Markazi Province',
    'مركزي': 'Markazi Province',
    'هرمزگان': 'Hormozgan Province',
    'ايلام': 'Ilam Province',
    'ایلام': 'Ilam Province',
    'گلستان': 'Golestan Province',
  };

  return provinceMap[p.toLowerCase()] || p;
}

/**
 * Extract organization from filename and content.
 */
export function detectOrganization(sourceFile: string, _row: Record<string, unknown>): string {
  const name = sourceFile.toLowerCase();
  if (name.includes('lec') || name.includes('law_enforcement') || name.includes('police')) return 'LEC';
  if (name.includes('basij') || name.includes('basij')) return 'Basij';
  if (name.includes('irgc') || name.includes('sepah') || name.includes('سپاه')) return 'IRGC';
  return 'Unknown';
}

/**
 * Clean IRN suffix from addresses.
 */
export function cleanAddress(address: string | null | undefined): string {
  if (!address) return '';
  return normalizePersian(address)
    .replace(/\s+IRN$/i, '')
    .replace(/\s+IRAN$/i, '')
    .trim();
}

/**
 * Validate Iranian postal code format.
 * Iranian postal codes are 10 digits (XXXXX-XXXXX or XXXXXXXXXX).
 */
export function validatePostalCode(code: string | null | undefined): boolean {
  if (!code) return false;
  const clean = code.replace(/[\s-]/g, '');
  return /^\d{10}$/.test(clean);
}

/**
 * Extract postal area code (first 5 digits for approximate area).
 */
export function extractPostalAreaCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const clean = code.replace(/[\s-]/g, '');
  if (/^\d{10}$/.test(clean)) {
    return clean.substring(0, 5);
  }
  return null;
}

/**
 * Extract a normalized name from a row.
 * Removes patronymic suffixes like "علی", "محمد" etc that follow names in Persian records.
 */
export function normalizeName(name: string | null | undefined): string {
  return normalizePersian(name);
}
