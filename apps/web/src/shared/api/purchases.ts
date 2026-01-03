import { checkResponse } from '../utils/checkResponse';
import { BASE_URL } from './base';
import {
  BatchResponse,
  Paginated,
  Purchase,
  PurchaseCreateDto,
  PurchaseListParams,
  PurchaseUpdateDto,
} from '../types/Purchase';
import { authFetch } from '@shared/api/authFetch';

function appendParam(url: URL, key: string, val: unknown) {
  if (val === undefined || val === null || val === '') return;
  url.searchParams.append(key, String(val));
}

export class PurchasesApi {
  private readonly baseUrl: URL;

  constructor(baseURL: string, slug = 'purchases') {
    // Удаляем ведущие слеши из slug
    const cleanedSlug = slug.replace(/^\/+/, '');

    // Гарантируем завершающий слэш в baseURL
    const normalizedBaseURL = baseURL.endsWith('/') ? baseURL : baseURL + '/';

    // Создаём базовый URL
    this.baseUrl = new URL(cleanedSlug, normalizedBaseURL);

    // Дополнительно гарантируем завершающий слэш в итоговом URL
    if (!this.baseUrl.href.endsWith('/')) {
      this.baseUrl = new URL(this.baseUrl.href + '/');
    }
  }

  // Список с пагинацией/сортировкой/поиском и новыми фильтрами
  async list(params: PurchaseListParams = {}, signal?: AbortSignal) {
    const url = new URL(this.baseUrl.href);
    appendParam(url, 'page', params.page ?? 1);
    appendParam(url, 'pageSize', params.pageSize ?? 20);
    appendParam(url, 'sortBy', params.sortBy);
    appendParam(url, 'sortOrder', params.sortOrder);
    appendParam(url, 'q', params.q);
    if (typeof params.completed === 'boolean')
      appendParam(url, 'completed', params.completed);
    appendParam(url, 'responsible', params.responsible);

    // Новые фильтры
    appendParam(url, 'status', params.status);
    appendParam(url, 'site', params.site);
    appendParam(url, 'lastStatusChangedFrom', params.lastStatusChangedFrom);
    appendParam(url, 'lastStatusChangedTo', params.lastStatusChangedTo);
    appendParam(url, 'bankGuaranteeFromFrom', params.bankGuaranteeFromFrom);
    appendParam(url, 'bankGuaranteeFromTo', params.bankGuaranteeFromTo);
    appendParam(url, 'bankGuaranteeToFrom', params.bankGuaranteeToFrom);
    appendParam(url, 'bankGuaranteeToTo', params.bankGuaranteeToTo);

    const res = await authFetch(url.href, { signal, credentials: 'include' });
    return checkResponse<Paginated<Purchase>>(res);
  }

  async getById(id: string, signal?: AbortSignal) {
    const url = new URL(`${this.baseUrl.href}${id}`);
    const res = await authFetch(url.href, { signal, credentials: 'include' });
    return checkResponse<Purchase>(res);
  }

  async create(payload: PurchaseCreateDto) {
    const res = await authFetch(this.baseUrl.href, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return checkResponse<Purchase>(res);
  }

  async update(id: string, payload: PurchaseUpdateDto) {
    const url = new URL(`${this.baseUrl.href}${id}`);
    const res = await authFetch(url.href, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return checkResponse<Purchase>(res);
  }

  // Смена статуса
  async setStatus(id: string, status: string, comment?: string) {
    const url = new URL(`${this.baseUrl.href}${id}/status`);
    const res = await authFetch(url.href, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment }),
    });
    return checkResponse<Purchase>(res);
  }

  async remove(id: string) {
    const url = new URL(`${this.baseUrl.href}${id}`);
    const res = await authFetch(url.href, {
      method: 'DELETE',
      credentials: 'include',
    });
    return checkResponse<{ deleted: boolean }>(res);
  }

  // Экспорт в Excel — с теми же фильтрами, что и list
  async export(params: PurchaseListParams = {}) {
    const url = new URL(`${this.baseUrl.href}export`);
    appendParam(url, 'q', params.q);
    if (typeof params.completed === 'boolean')
      appendParam(url, 'completed', params.completed);
    appendParam(url, 'responsible', params.responsible);
    appendParam(url, 'status', params.status);
    appendParam(url, 'site', params.site);
    appendParam(url, 'lastStatusChangedFrom', params.lastStatusChangedFrom);
    appendParam(url, 'lastStatusChangedTo', params.lastStatusChangedTo);
    appendParam(url, 'bankGuaranteeFromFrom', params.bankGuaranteeFromFrom);
    appendParam(url, 'bankGuaranteeFromTo', params.bankGuaranteeFromTo);
    appendParam(url, 'bankGuaranteeToFrom', params.bankGuaranteeToFrom);
    appendParam(url, 'bankGuaranteeToTo', params.bankGuaranteeToTo);

    const res = await authFetch(url.href, { credentials: 'include' });
    if (!res.ok) return checkResponse(res);

    const blob = await res.blob();
    // имя файла из Content-Disposition (учитываем filename*)
    const cd = res.headers.get('content-disposition') || '';
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
    const filename = decodeURIComponent(
      match?.[1] || match?.[2] || 'Purchases.xlsx'
    );
    return { blob, filename };
  }

  private async postBatchOnce(
    body: {
      items: Partial<Purchase>[];
      mode: 'insert' | 'upsert';
      matchBy?: string;
    },
    signal?: AbortSignal
  ) {
    const url = new URL(`${this.baseUrl.href}batch`);
    const res = await authFetch(url.href, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    return checkResponse<BatchResponse>(res);
  }

  // Основной метод: отправка большого массива, разбиение на чанки, суммирование результатов
  async batch(
    items: Partial<Purchase>[],
    opts?: {
      mode?: 'insert' | 'upsert';
      matchBy?: string; // для upsert, например 'entryNumber'
      chunkSize?: number; // дефолт 1000
      signal?: AbortSignal;
      onChunk?: (info: {
        chunkIndex: number;
        chunkSize: number;
        totalChunks: number;
        result: BatchResponse;
        totals: BatchResponse;
      }) => void;
    }
  ) {
    const mode = opts?.mode ?? 'upsert';
    const matchBy = opts?.matchBy ?? 'entryNumber';
    let chunkSize = Math.max(1, opts?.chunkSize ?? 1000);

    if (!Array.isArray(items) || items.length === 0) {
      return mode === 'insert'
        ? ({ inserted: 0 } as BatchResponse)
        : ({ upserted: 0, modified: 0, matched: 0 } as BatchResponse);
    }

    const totals: BatchResponse = {
      inserted: 0,
      upserted: 0,
      modified: 0,
      matched: 0,
    };
    const totalChunks = Math.ceil(items.length / chunkSize);

    let i = 0;
    let chunkIndex = 0;
    while (i < items.length) {
      const end = Math.min(i + chunkSize, items.length);
      const slice = items.slice(i, end);

      try {
        const res = await this.postBatchOnce(
          { items: slice, mode, matchBy },
          opts?.signal
        );

        // Суммируем результаты
        if (typeof res.inserted === 'number')
          totals.inserted = (totals.inserted || 0) + res.inserted;
        if (typeof res.upserted === 'number')
          totals.upserted = (totals.upserted || 0) + res.upserted;
        if (typeof res.modified === 'number')
          totals.modified = (totals.modified || 0) + res.modified;
        if (typeof res.matched === 'number')
          totals.matched = (totals.matched || 0) + res.matched;

        opts?.onChunk?.({
          chunkIndex,
          chunkSize: slice.length,
          totalChunks,
          result: res,
          totals,
        });

        // Переходим к следующему чанку
        i = end;
        chunkIndex += 1;
      } catch (err: any) {
        // Если получили 413, уменьшаем размер чанка и пробуем снова с того же места
        const status = err?.status || err?.response?.status;
        if (status === 413 && chunkSize > 50) {
          chunkSize = Math.max(50, Math.floor(chunkSize / 2));
          // Пересчитать totalChunks только для колбэка не обязательно, опционально можно не менять
          continue;
        }
        throw err;
      }
    }

    // Возвращаем агрегированный результат, совместимый по ключам с бэком
    if (mode === 'insert') {
      return { inserted: totals.inserted || 0 } as BatchResponse;
    }
    return {
      upserted: totals.upserted || 0,
      modified: totals.modified || 0,
      matched: totals.matched || 0,
    } as BatchResponse;
  }
}

export const purchasesApi = new PurchasesApi(BASE_URL, 'purchases/');
