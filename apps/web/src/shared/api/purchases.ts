import { checkResponse } from '../utils/checkResponse';
import { BASE_URL } from '../utils/Constants';
import {
  Paginated,
  Purchase,
  PurchaseCreateDto,
  PurchaseListParams,
  PurchaseUpdateDto,
} from '../types/Purchase';

function appendParam(url: URL, key: string, val: unknown) {
  if (val === undefined || val === null || val === '') return;
  url.searchParams.append(key, String(val));
}

export class PurchasesApi {
  private readonly baseUrl: URL;

  constructor(baseURL: string, slug = 'Purchases') {
    this.baseUrl = new URL(
      slug.replace(/^\/+/, ''),
      baseURL.endsWith('/') ? baseURL : baseURL + '/'
    );
  }

  // Список с пагинацией/сортировкой/поиском
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

    const res = await fetch(url.href, { signal, credentials: 'include' });
    return checkResponse<Paginated<Purchase>>(res);
  }

  // Поиск (если на бэке есть /Purchases/search)
  async search(name: string, signal?: AbortSignal) {
    const url = new URL(`${this.baseUrl.href}search`);
    appendParam(url, 'title', name);
    const res = await fetch(url.href, { signal, credentials: 'include' });
    return checkResponse<Purchase[]>(res);
  }

  async getById(id: string, signal?: AbortSignal) {
    const url = new URL(`${this.baseUrl.href}${id}`);
    const res = await fetch(url.href, { signal, credentials: 'include' });
    return checkResponse<Purchase>(res);
  }

  async create(payload: PurchaseCreateDto) {
    const res = await fetch(this.baseUrl.href, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return checkResponse<Purchase>(res);
  }

  async update(id: string, payload: PurchaseUpdateDto) {
    const url = new URL(`${this.baseUrl.href}${id}`);
    const res = await fetch(url.href, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return checkResponse<Purchase>(res);
  }

  async remove(id: string) {
    const url = new URL(`${this.baseUrl.href}${id}`);
    const res = await fetch(url.href, {
      method: 'DELETE',
      credentials: 'include',
    });
    return checkResponse<{ deleted: boolean }>(res);
  }

  // Экспорт, допустим /Purchases/export (excel)
  async export(params: PurchaseListParams = {}) {
    const url = new URL(`${this.baseUrl.href}export`);
    appendParam(url, 'q', params.q);
    if (typeof params.completed === 'boolean')
      appendParam(url, 'completed', params.completed);
    appendParam(url, 'responsible', params.responsible);

    const res = await fetch(url.href, { credentials: 'include' });
    if (!res.ok) return checkResponse(res);

    const blob = await res.blob();
    // Попробуем имя файла из заголовка
    const cd = res.headers.get('content-disposition') || '';
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
    const filename = decodeURIComponent(
      match?.[1] || match?.[2] || 'Purchases.xlsx'
    );
    return { blob, filename };
  }
}

export const purchasesApi = new PurchasesApi(BASE_URL, 'Purchases/');
