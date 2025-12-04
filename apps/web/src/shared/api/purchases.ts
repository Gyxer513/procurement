import { checkResponse } from '../utils/checkResponse';
import { BASE_URL } from '../utils/Constants';
import {
  Paginated,
  Purchase,
  PurchaseCreateDto,
  PurchaseListParams,
  PurchaseUpdateDto,
  // Если есть enum-ы на фронте — импортируйте их тоже
  // PurchaseStatus,
  // PurchaseSite,
} from '../types/Purchase';

function appendParam(url: URL, key: string, val: unknown) {
  if (val === undefined || val === null || val === '') return;
  url.searchParams.append(key, String(val));
}

export class PurchasesApi {
  private readonly baseUrl: URL;

  // меняем дефолтный slug на 'purchases' (нижний регистр)
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

    const res = await fetch(url.href, { signal, credentials: 'include' });
    return checkResponse<Paginated<Purchase>>(res);
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

  // Смена статуса
  async setStatus(id: string, payload: { status: string; comment?: string }) {
    const url = new URL(`${this.baseUrl.href}${id}/status`);
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

    const res = await fetch(url.href, { credentials: 'include' });
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
}

export const purchasesApi = new PurchasesApi(BASE_URL, 'purchases/');
