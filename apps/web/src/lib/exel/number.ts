// Устойчивый парсер чисел: чистит пробелы, NBSP, валюту, выбирает правильный разделитель
export function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;

  let s = String(v)
    .replace(/\s|\u00A0/g, '')
    .replace(/[₽рRubRUB$€£]|руб.?/gi, '');

  // поддержка отрицательных чисел в скобках: (123,45)
  const negative = s.includes('(') && s.includes(')');
  s = s.replace(/[()]/g, '');

  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    // Оба встречаются: убираем "десятичным не являющийся" разделитель тысяч
    if (lastComma > lastDot) {
      s = s.replace(/./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else {
    // Только один: запятую трактуем как десятичный
    s = s.replace(',', '.');
  }

  const n = Number(s);
  if (!Number.isFinite(n)) return undefined;

  return negative ? -n : n;
}
