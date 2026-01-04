export type PurchasesQuery = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';

  q?: string;
  completed?: boolean;
  responsible?: string;

  // новые фильтры
  dateFrom?: string; // 'YYYY-MM-DD'
  dateTo?: string; // 'YYYY-MM-DD'
  year?: number;
};
