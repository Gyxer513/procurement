export function parseEntryNumberAndDate(raw: unknown): {
  entryNumber?: string;
  entryDate?: Date;
} {
  if (raw == null) return {};
  const value = String(raw).trim();
  if (!value) return {};

  // Ищем дату в любом месте строки
  const dateMatch = value.match(`/(\d{1,2}).-/.-//`);
  let entryDate: Date | undefined;

  if (dateMatch) {
    const d = parseInt(dateMatch[1], 10);
    const m = parseInt(dateMatch[2], 10);
    let y = parseInt(dateMatch[3], 10);
    if (y < 100) y = y + (y >= 70 ? 1900 : 2000); // 2-значный год
    // Сохраняем как UTC полночь
    entryDate = new Date(Date.UTC(y, m - 1, d));
  }

  let entryNumber: string;
  const otIndex = value.search(/\b[оo]т\b/i);
  if (otIndex > -1) {
    entryNumber = value
      .slice(0, otIndex)
      .replace(/[–—-]\s*$/, '')
      .trim();
  } else if (dateMatch?.index != null) {
    entryNumber = value
      .slice(0, dateMatch.index)
      .replace(/[–—-]\s*$/, '')
      .trim();
  } else {
    entryNumber = value.trim();
  }

  return {
    entryNumber: entryNumber || undefined,
    entryDate,
  };
}
