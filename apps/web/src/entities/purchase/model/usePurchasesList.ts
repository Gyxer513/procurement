import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { purchasesApi } from '@/shared/api/purchases';
import type { PurchasesQuery } from './types';

export function usePurchasesList() {
  const [query, setQuery] = useState<PurchasesQuery>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isFetching } = useQuery({
    queryKey: ['Purchases', query],
    queryFn: ({ signal }) => purchasesApi.list(query, signal),
    placeholderData: keepPreviousData,
  });

  return {
    query,
    setQuery,
    data,
    isLoading: isFetching,
  };
}
