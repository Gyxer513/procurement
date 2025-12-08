import { useState } from 'react';
import { message } from 'antd';
import { purchasesApi } from '../../../shared/api/purchases';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

type QueryState = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  q?: string;
  completed?: boolean;
  responsible?: string;
};

export function hooks() {
  // Основной query — то, что реально уходит в API
  const [query, setQuery] = useState<QueryState>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Локальные состояния для полей фильтров (строки из инпутов/селектов)
  const [search, setSearch] = useState('');
  const [completed, setCompleted] = useState(''); // '', 'true', 'false'
  const [responsible, setResponsible] = useState('');

  const { data, isFetching } = useQuery({
    queryKey: ['Purchases', query],
    queryFn: ({ signal }) =>
      purchasesApi.list(
        {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          q: query.q,
          completed: query.completed,
          responsible: query.responsible,
        },
        signal
      ),
    placeholderData: keepPreviousData,
  });

  // Применить фильтры (строки -> типы)
  const applyFilters = () => {
    const completedBool =
      completed === ''
        ? undefined
        : completed === 'true'
        ? true
        : completed === 'false'
        ? false
        : undefined;

    setQuery((q) => ({
      ...q,
      page: 1,
      q: search.trim() || undefined,
      completed: completedBool,
      responsible: responsible?.trim() || undefined,
    }));
  };

  // Сбросить фильтры
  const resetFilters = () => {
    setSearch('');
    setCompleted('');
    setResponsible('');
    setQuery((q) => ({
      ...q,
      page: 1,
      q: undefined,
      completed: undefined,
      responsible: undefined,
    }));
  };

  // Экспорт
  const handleExport = async () => {
    try {
      const res: any = await purchasesApi.export({
        q: query.q,
        completed: query.completed,
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
      console.error(e);
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
    completed,
    setCompleted,
    responsible,
    setResponsible,
    applyFilters,
    resetFilters,
    handleExport,
  };
}
