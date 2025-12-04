import { PurchaseSite, PurchaseStatus } from '../schemas/purchase.schema';

export class ListPurchasesDto {
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  completed?: boolean;
  responsible?: string;

// Новые поля фильтрации
  status?: PurchaseStatus;
  site?: PurchaseSite;

// Диапазон по дате последнего изменения статуса
  lastStatusChangedFrom?: string; // ISO или YYYY-MM-DD
  lastStatusChangedTo?: string;

// Диапазоны по сроку действия БГ
  bankGuaranteeFromFrom?: string;
  bankGuaranteeFromTo?: string;
  bankGuaranteeToFrom?: string;
  bankGuaranteeToTo?: string;
}
