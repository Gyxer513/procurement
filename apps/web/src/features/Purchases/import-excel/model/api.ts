import { BASE_URL } from '@shared/api/base';
import type { Mode, BatchResponse } from './types';
import type { Purchase } from '@shared/types/Purchase';

export async function importPurchasesBatch(
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
