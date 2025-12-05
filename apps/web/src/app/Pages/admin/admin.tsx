import React, { useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { read, utils } from 'xlsx';
import moment from 'moment';
import { BASE_URL } from '../../../shared/utils/Constants';
import { Purchase } from '../../../shared/types/Purchase';

type Mode = 'upsert' | 'insert';
type BatchResponse = {
  inserted?: number;
  upserted?: number;
  modified?: number;
  matched?: number;
};

// Наборы типов полей
const DATE_KEYS = new Set<keyof Purchase>([
  'contractDate',
  'validFrom',
  'validTo',
  'contractEnd',
  'placementDate',
]);
const BOOL_KEYS = new Set<keyof Purchase>(['completed', 'smp']);
const NUM_KEYS = new Set<keyof Purchase>([
  'initialPrice',
  'purchaseAmount',
  'savings',
  'performanceAmount',
  'applicationAmount',
]);

// Нормализация заголовка
function normalizeHeader(h: string) {
  return h.replace(/\s+/g, ' ').trim().toLowerCase();
}

// Гибкое определение ключа по заголовку (заточено под ваши колонки)
function resolveKey(header: string): keyof Purchase | undefined {
  const h = normalizeHeader(header);

  if (h === 'вход. №, дата служебной записки') return 'entryNumber';
  if (
    h ===
    'предмет договора (краткое наименование закупаемых товаров, работ, услуг)'
  )
    return 'contractSubject';
  if (h === 'наименование поставщика, подрядчика, исполнителя')
    return 'supplierName';
  if (h === 'сmp' || h === 'смп') return 'smp';
  if (h === 'инн поставщика, подрядчика, исполнителя') return 'supplierInn';
  if (h === 'сумма закупки') return 'purchaseAmount';
  if (h === 'номер договора (счета)') return 'contractNumber';
  if (h === 'дата заключения (выставления)') return 'contractDate';
  if (h === 'срок действия с') return 'validFrom';
  if (h === 'срок действия по (поставка товара, услуг, работ)')
    return 'validTo';
  if (h === 'срок исполнения договора') return 'contractEnd';
  if (h === 'начальная максимальная цена') return 'initialPrice';
  if (h === 'дата размещения процедуры') return 'placementDate';
  if (h === 'способ закупки / способ закупки в электронной форме')
    return 'methodOfPurchase';
  if (h === 'номер и дата документа подведения итогов закупки')
    return 'documentNumber';
  if (h === 'процедура закупки: состоялась, не состоялась') return 'completed';
  if (h === 'экономия, полученная в результате проведения процедуры закупки')
    return 'savings';
  if (
    h === 'сумма обеспечение исполнения договора' ||
    h === 'сумма обеспечения исполнения договора'
  )
    return 'performanceAmount';
  if (h === 'форма обеспечения исполнения договора') return 'performanceForm';
  if (h === 'номер и дата последнего дс') return 'additionalAgreementNumber';
  if (h === 'размещение (наличие подписанных документов)') return 'publication';
  if (h === 'ответственный исполнитель') return 'responsible';
  if (h === 'номер по плану закупок') return 'planNumber';
  if (h === 'обеспечение заявки, сумма') return 'applicationAmount';
  if (h === 'примечания') return 'comment';

  // Мягкие правила на случай микровариаций
  if (h.includes('вход') && h.includes('служебной записки'))
    return 'entryNumber';
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
  if (
    h.includes('обеспечени') &&
    h.includes('исполнения договора') &&
    h.includes('сумма')
  )
    return 'performanceAmount';
  if (h.includes('форма обеспеч') && h.includes('исполнения договора'))
    return 'performanceForm';
  if (h.includes('последнего дс')) return 'additionalAgreementNumber';
  if (h.startsWith('размещение')) return 'publication';
  if (h.startsWith('ответственный')) return 'responsible';
  if (h.startsWith('номер по плану закуп')) return 'planNumber';
  if (h.includes('обеспечение заявки')) return 'applicationAmount';

  return undefined;
}

// Конвертеры
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
  const s = String(v)
    .replace(/[\s\u00A0]/g, '')
    .replace(',', '.');
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

// «состоялась / не состоялась» -> completed
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

// Маппинг строки Excel -> Partial<Purchase>
function mapRow(rawRow: Record<string, any>): Partial<Purchase> {
  const out: Partial<Purchase> = {};

  for (const [rawHeader, value] of Object.entries(rawRow)) {
    const key = resolveKey(rawHeader);
    if (!key) continue;

    if (key === 'entryNumber') {
      const s = normalizeCell(value);
      if (s) out.entryNumber = s; // "898-вн/ск от 11.07.2025"
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

// POST /purchases/batch (одним запросом)
async function postBatch(
  items: Partial<Purchase>[],
  mode: Mode,
  matchBy?: string,
  signal?: AbortSignal
): Promise<BatchResponse> {
  const url = new URL(
    'purchases/batch',
    BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/'
  );
  const res = await fetch(url.href, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, mode, matchBy }),
    signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(
      `Ошибка загрузки (${res.status}): ${txt || res.statusText}`
    );
  }
  return res.json();
}

export default function AdminPage() {
  const [items, setItems] = useState<Partial<Purchase>[]>([]);
  const [mode, setMode] = useState<Mode>('upsert');
  const [matchBy, setMatchBy] = useState<string>('entryNumber');
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sample = useMemo(
    () => JSON.stringify(items.slice(0, 3), null, 2),
    [items]
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!items.length) throw new Error('Нет данных для загрузки');
      setError(null);
      setInfo(null);
      abortRef.current = new AbortController();
      return postBatch(
        items,
        mode,
        mode === 'upsert' ? matchBy : undefined,
        abortRef.current.signal
      );
    },
    onSuccess: (res) => {
      setInfo(
        mode === 'insert'
          ? `Готово. Вставлено: ${res.inserted ?? 0}`
          : `Готово. Upsert: ${res.upserted ?? 0}, Обновлено: ${
              res.modified ?? 0
            }, Совпало: ${res.matched ?? 0}`
      );
    },
    onError: (e: any) => setError(e?.message || 'Ошибка при отправке данных'),
    onSettled: () => {
      abortRef.current = null;
    },
  });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setInfo(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const ab = await file.arrayBuffer();
      const wb = read(ab);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = utils.sheet_to_json<Record<string, any>>(ws, {
        defval: '',
      });

      const list = rawRows
        .map(mapRow)
        .filter((row) => Object.keys(row).length > 0);
      setItems(list);
      setInfo(`Файл: ${file.name}. Строк: ${list.length}`);
    } catch (err: any) {
      console.error('Error reading Excel file:', err);
      setError('Ошибка чтения Excel: ' + (err?.message || 'unknown'));
    } finally {
      e.target.value = '';
    }
  }

  function handleClear() {
    setItems([]);
    setFileName('');
    setError(null);
    setInfo(null);
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Импорт закупок из Excel</h1>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: '1px solid #eee',
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Шаг 1. Выберите файл</h2>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            disabled={mutation.isPending}
          />
          <button
            type="button"
            onClick={handleClear}
            disabled={mutation.isPending}
          >
            Очистить
          </button>
          {fileName ? <span style={{ color: '#666' }}>{fileName}</span> : null}
        </div>
        <div style={{ marginTop: 8, color: '#666' }}>
          Ожидаются колонки в точности как в вашей таблице. Небольшие вариации
          пробелов/регистра поддерживаются.
        </div>
      </section>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: '1px solid #eee',
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Шаг 2. Настройки</h2>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <label>
            <span style={{ marginRight: 8 }}>Режим:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              disabled={mutation.isPending}
            >
              <option value="upsert">Upsert (обновить/создать)</option>
              <option value="insert">Insert (только вставка)</option>
            </select>
          </label>
          <label>
            <span style={{ marginRight: 8 }}>matchBy:</span>
            <input
              type="text"
              value={matchBy}
              onChange={(e) => setMatchBy(e.target.value)}
              disabled={mutation.isPending || mode === 'insert'}
              placeholder="entryNumber"
              style={{ width: 220 }}
            />
          </label>
        </div>
        <div style={{ marginTop: 8, color: '#666' }}>
          По умолчанию — upsert по entryNumber.
        </div>
      </section>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: '1px solid #eee',
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Шаг 3. Отправка</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!items.length || mutation.isPending}
          >
            Отправить на сервер
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={!mutation.isPending}
          >
            Отмена
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div>
            Подготовлено записей: <b>{items.length}</b>
          </div>
          {items.length > 0 && (
            <>
              <div style={{ marginTop: 8, color: '#666' }}>
                Пример первых записей
              </div>
              <pre
                style={{
                  background: '#fafafa',
                  border: '1px solid #eee',
                  borderRadius: 6,
                  padding: 12,
                  overflow: 'auto',
                  maxHeight: 220,
                }}
              >
                {sample}
              </pre>
            </>
          )}
        </div>

        {mutation.isPending && (
          <div style={{ marginTop: 12, color: '#555' }}>Отправка...</div>
        )}

        {mutation.isSuccess && (
          <div style={{ marginTop: 12, color: 'green' }}>
            {mode === 'insert'
              ? `Готово. Вставлено: ${mutation.data?.inserted ?? 0}`
              : `Готово. Upsert: ${mutation.data?.upserted ?? 0}, Обновлено: ${
                  mutation.data?.modified ?? 0
                }, Совпало: ${mutation.data?.matched ?? 0}`}
          </div>
        )}

        {error && (
          <div style={{ marginTop: 12, color: 'crimson' }}>{error}</div>
        )}
      </section>
    </div>
  );
}
