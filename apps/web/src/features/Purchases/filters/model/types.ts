export type PurchasesFiltersUi = {
  search: string;
  completed: '' | 'true' | 'false';
  responsible: string;

  year: number | null;
  dateRange: [string | null, string | null]; // 'YYYY-MM-DD'
};
