import { useState } from 'react';
import { message } from 'antd';
import { purchasesApi } from '../../shared/api/purchases';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

type QueryState = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  q?: string;
  completed?: '' | boolean;
  responsible?: string;
};

export function usePurchases() {
  const [query, setQuery] = useState<QueryState>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    q: '',
    completed: '',
    responsible: '',
  });

  const [search, setSearch] = useState(query.q || '');
  const [status, setStatus] = useState<string>(
    query.completed === '' ? '' : String(query.completed)
  );
  const [responsible, setResponsible] = useState<string>(
    query.responsible || ''
  );

  const { data, isFetching, isPending } = useQuery({
    queryKey: ['Purchases', query],
    queryFn: ({ signal }) =>
      purchasesApi.list(
        {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          q: query.q,
          completed:
            query.completed === '' ? undefined : (query.completed as boolean),
          responsible: query.responsible || undefined,
        },
        signal
      ),
    placeholderData: keepPreviousData, // вместо keepPreviousData: true
  });

  const applyFilters = () => {
    setQuery((q) => ({
      ...q,
      page: 1,
      q: search.trim() || undefined,
      completed: status === '' ? '' : status === 'true',
      responsible: responsible?.trim() || undefined,
    }));
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setResponsible('');
    setQuery((q) => ({
      ...q,
      page: 1,
      q: undefined,
      completed: '',
      responsible: undefined,
    }));
  };

  const handleExport = async () => {
    try {
      const res = await purchasesApi.export({
        q: query.q,
        completed:
          typeof query.completed === 'boolean' ? query.completed : undefined,
        responsible: query.responsible,
      });
      const url = URL.createObjectURL(res.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename || 'Purchases.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      message.error(e?.message || 'Не удалось выполнить экспорт');
    }
  };

  return {
    query,
    setQuery,
    data,
    isLoading: isFetching,
    search,
    setSearch,
    status,
    setStatus,
    responsible,
    setResponsible,
    applyFilters,
    resetFilters,
    handleExport,
  };
}
