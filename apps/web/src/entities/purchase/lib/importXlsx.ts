import { read, utils } from 'xlsx';
import moment from 'moment';
import type { Purchase } from '@shared/types/Purchase';

// поля
const DATE_KEYS = new Set<keyof Purchase>([
  'contractDate',
  'validFrom',
  'validTo',
  'contractEnd',
  'placementDate',
]);
const NUM_KEYS = new Set<keyof Purchase>([
  'initialPrice',
  'purchaseAmount',
  'savings',
  'performanceAmount',
  'applicationAmount',
]);

function normalizeHeader(h: string) {
  return h.replace(/\s+/g, ' ').trim().toLowerCase();
}

function resolveKey(header: string): keyof Purchase | undefined {
  const h = normalizeHeader(header);

  if (h === 'вход. №, дата служебной записки') return 'entryNumber';
  if (h === 'предмет договора (краткое наименование закупаемых товаров, работ, услуг)') return 'contractSubject';
  if (h === 'наименование поставщика, подрядчика, исполнителя') return 'supplierName';
  if (h === 'сmp' || h === 'смп') return 'smp';
  if (h === 'инн поставщика, подрядчика, исполнителя') return 'supplierInn';
  if (h === 'сумма закупки') return 'purchaseAmount';
  if (h === 'номер договора (счета)') return 'contractNumber';
  if (h === 'дата заключения (выставления)') return 'contractDate';
  if (h === 'срок действия с') return 'validFrom';
  if (h === 'срок действия по (поставка товара, услуг, работ)') return 'validTo';
  if (h === 'срок исполнения договора') return 'contractEnd';
  if (h === 'начальная максимальная цена') return 'initialPrice';
  if (h === 'дата размещения процедуры') return 'placementDate';
  if (h === 'способ закупки / способ закупки в электронной форме') return 'methodOfPurchase';
  if (h === 'номер и дата документа подведения итогов закупки') return 'documentNumber';
  if (h === 'процедура закупки: состоялась, не состоялась') return 'completed';
  if (h === 'экономия, полученная в результате проведения процедуры закупки') return 'savings';
  if (h === 'сумма обеспечение исполнения договора' || h === 'сумма обеспечения исполнения договора') return 'performanceAmount';
  if (h === 'форма обеспечения исполнения договора') return 'performanceForm';
  if (h === 'номер и дата последнего дс') return 'additionalAgreementNumber';
  if (h === 'размещение (наличие подписанных документов)') return 'publication';
  if (h === 'ответственный исполнитель') return 'responsible';
  if (h === 'номер по плану закупок') return 'planNumber';
  if (h === 'обеспечение заявки, сумма') return 'applicationAmount';
  if (h === 'примечания') return 'comment';

  if (h.includes('вход') && h.includes('служебной записки')) return 'entryNumber';
  if (h.startsWith('предмет договора')) return 'contractSubject';
  if (h.startsWith('наименование поставщика')) return 'supplierName';
  if (h.startsWith('инн поставщика')) return 'supplierInn';
  if (h.startsWith('номер договора')) return 'contractNumber';
  if (h.startsWith('дата заключения')) return 'contractDate';
  if (h.startsWith('срок действия с')) return 'validFrom';
  if (h.startsWith('срок действия по')) return 'validTo';
  if (h.startsWith('срок исполнения договора')) return 'contractEnd';
  if (h.startsWith('начальная максимальная цена')) return 'initialPrice';
  if (h.startsWith('дата размещения')) return 'placementDate';
  if (h.includes('способ закупки')) return 'methodOfPurchase';
  if (h.includes('итогов закупки')) return 'documentNumber';
  if (h.includes('процедура закупки')) return 'completed';
  if (h.startsWith('экономия')) return 'savings';
  if (h.includes('обеспечени') && h.includes('исполнения договора') && h.includes('сумма')) return 'performanceAmount';
  if (h.includes('форма обеспеч') && h.includes('исполнения договора')) return 'performanceForm';
  if (h.includes('последнего дс')) return 'additionalAgreementNumber';
  if (h.startsWith('размещение')) return 'publication';
  if (h.startsWith('ответственный')) return 'responsible';
  if (h.startsWith('номер по плану закуп')) return 'planNumber';
  if (h.includes('обеспечение заявки')) return 'applicationAmount';

  return undefined;
}

function excelDateToISO(input: string | number | Date): string {
  if (input === null || input === undefined || input === '') return '';
  if (typeof input === 'number' && !isNaN(input)) {
    const date = new Date((input - 25569) * 86400 * 1000);
    return moment(date).format('YYYY-MM-DD');
  }
  if (input instanceof Date) {
    return moment(input).isValid() ? moment(input).format('YYYY-MM-DD') : '';
  }
  const raw = String(input).trim();
  let m = moment(raw, 'DD.MM.YYYY', true);
  if (m.isValid()) return m.format('YYYY-MM-DD');
  m = moment(raw, 'D.M.YYYY', true);
  if (m.isValid()) return m.format('YYYY-MM-DD');
  m = moment(raw, moment.ISO_8601, true);
  if (m.isValid()) return m.format('YYYY-MM-DD');
  m = moment(raw, 'DD/MM/YYYY', true);
  if (m.isValid()) return m.format('YYYY-MM-DD');
  return '';
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  const s = String(v).replace(/[\s\u00A0]/g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function toBoolGeneric(v: unknown): boolean | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  if (['да', 'true', '1', 'yes', 'y'].includes(s)) return true;
  if (['нет', 'false', '0', 'no', 'n'].includes(s)) return false;
  return undefined;
}

function toCompleted(v: unknown): boolean | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const s = String(v).trim().toLowerCase();
  if (s.includes('не состоя')) return false;
  if (s.includes('состоя')) return true;
  return toBoolGeneric(v);
}

function normalizeCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\s+/g, ' ').trim();
}

export function mapRow(rawRow: Record<string, any>): Partial<Purchase> {
  const out: Partial<Purchase> = {};
  for (const [rawHeader, value] of Object.entries(rawRow)) {
    const key = resolveKey(rawHeader);
    if (!key) continue;

    if (key === 'entryNumber') {
      const s = normalizeCell(value);
      if (s) out.entryNumber = s;
      continue;
    }
    if (key === 'completed') {
      const b = toCompleted(value);
      if (b !== undefined) out.completed = b;
      continue;
    }
    if (key === 'smp') {
      const b = toBoolGeneric(value);
      if (b !== undefined) out.smp = b;
      continue;
    }
    if (DATE_KEYS.has(key)) {
      const iso = excelDateToISO(value);
      if (iso) (out as any)[key] = iso;
      continue;
    }
    if (NUM_KEYS.has(key)) {
      const n = toNumber(value);
      if (n !== undefined) (out as any)[key] = n;
      continue;
    }
    const s = normalizeCell(value);
    if (s) (out as any)[key] = s;
  }
  return out;
}

export async function parseExcelToPurchases(file: File | Blob): Promise<Partial<Purchase>[]> {
  const ab = await file.arrayBuffer();
  const wb = read(ab);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
  return rawRows.map(mapRow).filter((row) => Object.keys(row).length > 0);
}
