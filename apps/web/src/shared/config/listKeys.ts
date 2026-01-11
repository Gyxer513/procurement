import { PurchaseListParams } from '@shared/types/Purchase';

export const LIST_KEYS = [
  'page',
  'pageSize',
  'sortBy',
  'sortOrder',
  'q',
  'completed',
  'responsible',
  'year',
  'dateFrom',
  'dateTo',
  'status',
  'site',
  'lastStatusChangedFrom',
  'lastStatusChangedTo',
  'bankGuaranteeFromFrom',
  'bankGuaranteeFromTo',
  'bankGuaranteeToFrom',
  'bankGuaranteeToTo',
] as const satisfies readonly (keyof PurchaseListParams)[];
