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
import { LIST_KEYS } from '@shared/config/listKeys';
import { addQuery, Query } from '@shared/utils/addQuery';

export class PurchasesApi {
  private baseHref: string;

  constructor(baseURL: string, slug = 'purchases/') {
    const cleanedSlug = slug.replace(/^\/+/, '');
    const normalizedBaseURL = baseURL.endsWith('/') ? baseURL : baseURL + '/';
    const u = new URL(cleanedSlug, normalizedBaseURL);
    this.baseHref = u.href.endsWith('/') ? u.href : u.href + '/';
  }

  private url(path = '', query?: Query) {
    const u = new URL(path, this.baseHref);
    return addQuery(u, query);
  }

  private async json<T>(url: URL | string, init?: RequestInit) {
    const res = await authFetch(String(url), {
      credentials: 'include',
      ...init,
    });
    return checkResponse<T>(res);
  }

  private jsonInit(method: string, body?: unknown): RequestInit {
    return {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    };
  }

  // ───── list / deleted: один генератор query
  async list(params: PurchaseListParams = {}, signal?: AbortSignal) {
    const query = toQueryRecord(params, LIST_KEYS);
    return this.json<Paginated<Purchase>>(this.url('', query), { signal });
  }

  async listDeleted(params: PurchaseListParams = {}, signal?: AbortSignal) {
    const query = toQueryRecord(params, LIST_KEYS);
    return this.json<Paginated<Purchase>>(this.url('deleted', query), {
      signal,
    });
  }

  async getById(id: string, signal?: AbortSignal) {
    return this.json<Purchase>(this.url(id), { signal });
  }

  async create(payload: PurchaseCreateDto) {
    return this.json<Purchase>(this.url(''), this.jsonInit('POST', payload));
  }

  async update(id: string, payload: PurchaseUpdateDto) {
    return this.json<Purchase>(this.url(id), this.jsonInit('PATCH', payload));
  }

  async setStatus(id: string, status: string, comment?: string) {
    return this.json<Purchase>(
      this.url(`${id}/status`),
      this.jsonInit('PATCH', { status, comment })
    );
  }

  async setDeleted(id: string, isDeleted: boolean) {
    return this.json<Purchase>(
      this.url(`${id}/deleted`),
      this.jsonInit('PATCH', { isDeleted })
    );
  }

  async export(params: PurchaseListParams = {}) {
    const query = toQueryRecord(params, LIST_KEYS);
    const u = this.url('export', query);

    const res = await authFetch(u.href, { credentials: 'include' });
    if (!res.ok) return checkResponse(res);

    const blob = await res.blob();
    const cd = res.headers.get('content-disposition') || '';
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
    const filename = decodeURIComponent(
      match?.[1] || match?.[2] || 'Purchases.xlsx'
    );

    return { blob, filename };
  }

  async postBatchOnce(
    body: {
      items: Partial<Purchase>[];
      mode: 'insert' | 'upsert';
      matchBy?: string;
    },
    signal?: AbortSignal
  ) {
    return this.json<BatchResponse>(this.url('batch'), {
      ...this.jsonInit('POST', body),
      signal,
    });
  }
}

export const purchasesApi = new PurchasesApi(BASE_URL, 'purchases/');
