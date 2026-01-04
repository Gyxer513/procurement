import {
  excelDateToISO,
  normalizeCell,
  normalizeHeader,
  toBoolGeneric,
  toCompleted,
  toNumber,
} from '@/lib';
import type { Field, Purchase } from '@shared/types/Purchase';
import {
  DATE_FIELDS,
  EXACT,
  INCLUDES_ALL,
  NUMBER_FIELDS,
  STARTS_WITH,
} from '@shared/config/exelRules';
import { read, utils } from 'xlsx';

// Процессоры по полям
type Ctx = { date1904: boolean };

const processors: Partial<Record<Field, (v: unknown, ctx: Ctx) => any>> = {
  entryNumber: (v) => {
    const s = normalizeCell(v);
    return s || undefined;
  },
  completed: (v) => toCompleted(v),
  smp: (v) => toBoolGeneric(v),
  performanceForm: (v) => {
    const s = normalizeCell(v);
    return s || undefined;
  },
};

function resolveKey(header: string): Field | undefined {
  const h = normalizeHeader(header);

  // 1) точные совпадения
  const exact = EXACT[h];
  if (exact) return exact;

  // 2) startsWith
  for (const [prefix, key] of STARTS_WITH) {
    if (h.startsWith(prefix)) return key;
  }

  // 3) includesAll
  for (const [needles, key] of INCLUDES_ALL) {
    if (needles.every((n) => h.includes(n))) return key;
  }

  return undefined;
}

// Дата/число — зададим общие процессоры по множествам
function processValueByKey(key: Field, v: unknown, ctx: Ctx): any {
  // Специальный парсер, если задан
  const custom = processors[key];
  if (custom) return custom(v, ctx);

  if (DATE_FIELDS.has(key)) {
    const iso = excelDateToISO(v as any, ctx.date1904);
    return iso || undefined;
  }
  if (NUMBER_FIELDS.has(key)) {
    return toNumber(v);
  }

  const s = normalizeCell(v);
  return s || undefined;
}

// Построить карту соответствий заголовков один раз
function buildHeaderMap(headers: string[]): Map<string, Field> {
  const map = new Map<string, Field>();
  for (const h of headers) {
    const key = resolveKey(h);
    if (key) map.set(h, key);
  }
  return map;
}

export async function parseExcelToPurchases(
  file: File | Blob
): Promise<Partial<Purchase>[]> {
  const ab = await file.arrayBuffer();
  const wb = read(ab, { cellDates: false, raw: true }); // сырые значения: числа/строки
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];

  const date1904 = !!wb?.Workbook?.WBProps?.date1904;

  // Читаем как объекты с текстовыми заголовками
  const rawRows = utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: '',
  });

  // Собираем список заголовков и строим карту только один раз
  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  const headerMap = buildHeaderMap(headers);

  const ctx: Ctx = { date1904 };

  const result: Array<Partial<Purchase>> = [];

  for (const rawRow of rawRows) {
    const out: Partial<Purchase> = {};
    for (const [rawHeader, key] of headerMap) {
      const value = (rawRow as any)[rawHeader];
      const parsed = processValueByKey(key, value, ctx);
      if (parsed !== undefined) {
        (out as any)[key] = parsed;
      }
    }
    if (Object.keys(out).length > 0) {
      result.push(out);
    }
  }

  return result;
}
