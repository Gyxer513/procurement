import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { purchasesApi } from '@shared/api/purchases';
import { useState } from 'react';
import { PurchasesQuery } from '@entities/purchase/model/types';

export function usePurchasesList() {
  const [query, setQuery] = useState<PurchasesQuery>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const q = useQuery({
    queryKey: ['Purchases', query] as const,
    queryFn: ({ queryKey, signal }) => purchasesApi.list(queryKey[1], signal),
    placeholderData: keepPreviousData,
    retry: false,
  });

  if (q.isError) {
    console.error('Purchases query error:', q.error);
  }

  return {
    query,
    setQuery,
    data: q.data,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    error: q.error,
  };
}
