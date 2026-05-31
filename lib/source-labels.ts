/**
 * Persian source name mapping.
 *
 * Maps raw source file names to human-readable Persian labels.
 */

const SOURCE_MAP: Record<string, string> = {
  'Basij.xlsx': 'بسیج',
  'LEC.xlsx': 'نیروی انتظامی',
  'IRGC.xlsx': 'سپاه پاسداران',
};

const SOURCE_KEYWORDS: [string, string][] = [
  ['basij', 'بسیج'],
  ['lec', 'نیروی انتظامی'],
  ['irgc', 'سپاه پاسداران'],
  ['sepah', 'سپاه پاسداران'],
  ['سپاه', 'سپاه پاسداران'],
  ['بسیج', 'بسیج'],
];

/**
 * Get the Persian display label for a source file name.
 * Falls back to 'نامشخص' if unknown.
 */
export function getPersianSourceLabel(sourceFile: string | null | undefined): string {
  if (!sourceFile) return 'نامشخص';

  // Direct match
  if (SOURCE_MAP[sourceFile]) return SOURCE_MAP[sourceFile];

  // Keyword match
  const lower = sourceFile.toLowerCase();
  for (const [keyword, label] of SOURCE_KEYWORDS) {
    if (lower.includes(keyword)) return label;
  }

  return 'نامشخص';
}

/**
 * Format a count number in Persian numerals.
 */
export function formatPersianCount(count: number): string {
  return count.toLocaleString('fa-IR');
}
