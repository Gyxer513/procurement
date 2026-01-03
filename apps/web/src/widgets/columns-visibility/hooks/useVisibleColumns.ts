import { useEffect, useState } from 'react';
import type { CheckboxOptionType } from 'antd';

export function useVisibleColumns(options: CheckboxOptionType[], storageKey: string) {
  const allValues = options.map(o => String(o.value));
  const valuesKey = allValues.join('|'); // стабильный ключ для deps

  const [checkedList, setCheckedList] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(storageKey);
    if (!raw) return []; // пусто -> позже заменим на "все"
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  });

  // Когда options готовы/изменились: выкинуть несуществующие, и если пусто -> показать все
  useEffect(() => {
    if (!allValues.length) return;

    setCheckedList(prev => {
      const normalized = prev.filter(v => allValues.includes(v));
      return normalized.length ? normalized : allValues;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesKey]);

  // Сохраняем в localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(checkedList));
  }, [checkedList, storageKey]);

  return { checkedList, setCheckedList, allValues };
}
