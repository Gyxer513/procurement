import { useCallback, useState } from 'react';
import type { PurchasesFiltersUi } from './types';
import type { PurchasesQuery } from '@/entities/purchase/model';

const initial: PurchasesFiltersUi = {
  search: '',
  completed: '',
  responsible: '',
  year: null,
  dateRange: [null, null],
};

export function usePurchasesFilters() {
  const [filters, setFilters] = useState<PurchasesFiltersUi>(initial);

  const setSearch = (v: string) => setFilters((s) => ({ ...s, search: v }));
  const setCompleted = (v: PurchasesFiltersUi['completed']) =>
    setFilters((s) => ({ ...s, completed: v }));
  const setResponsible = (v: string) =>
    setFilters((s) => ({ ...s, responsible: v }));

  const setYear = (v: number | null) => setFilters((s) => ({ ...s, year: v }));

  const setDateRange = (v: [string | null, string | null]) =>
    setFilters((s) => ({ ...s, dateRange: v }));

  const buildQueryPatch = useCallback((): Pick<
    PurchasesQuery,
    'q' | 'completed' | 'responsible' | 'dateFrom' | 'dateTo' | 'year'
  > => {
    const completedBool =
      filters.completed === ''
        ? undefined
        : filters.completed === 'true'
        ? true
        : filters.completed === 'false'
        ? false
        : undefined;

    return {
      q: filters.search.trim() || undefined,
      completed: completedBool,
      responsible: filters.responsible.trim() || undefined,

      year: filters.year ?? undefined,
      dateFrom: filters.dateRange[0] ?? undefined,
      dateTo: filters.dateRange[1] ?? undefined,
    };
  }, [filters]);

  const resetUi = () => setFilters(initial);

  return {
    filters,
    setSearch,
    setCompleted,
    setResponsible,
    setYear,
    setDateRange,
    buildQueryPatch,
    resetUi,
  };
}
