import { PurchaseStatus } from '@shared/enums/purchase-status.enum';
import { PurchaseSite } from '@shared/enums/purchase-site.enum';

export type Purchase = {
  id: string;
  entryNumber?: string;
  contractSubject?: string;
  supplierName?: string;
  smp?: boolean;
  supplierInn?: string;
  purchaseAmount?: number;
  contractNumber?: string;
  contractDate?: string;
  validFrom?: string;
  validTo?: string;
  contractEnd?: string;
  initialPrice?: number;
  placementDate?: string;
  methodOfPurchase?: string;
  documentNumber?: string;
  completed?: boolean;
  savings?: number;
  performanceAmount?: number;
  performanceForm?: string;
  additionalAgreementNumber?: string;
  currentContractAmount?: number;
  publication?: string;
  responsible?: string;
  planNumber?: string;
  applicationAmount?: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  status: PurchaseStatus;
  site: PurchaseSite;
  bankGuaranteeValidFrom?: string | Date;
  bankGuaranteeValidTo?: string | Date;
  lastStatusChangedAt?: string | Date;
  remainingContractAmount?: number;
  _statusHistory?: {
    status: PurchaseStatus;
    changedAt: string;
    comment?: string;
  }[];
};

export type Paginated<T> = { items: T[]; total: number };

export type PurchaseListParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';

  q?: string;
  completed?: boolean;
  responsible?: string;

  year?: number;
  dateFrom?: string; // 'YYYY-MM-DD'
  dateTo?: string; // 'YYYY-MM-DD'

  status?: string;
  site?: string;
  lastStatusChangedFrom?: string;
  lastStatusChangedTo?: string;
  bankGuaranteeFromFrom?: string;
  bankGuaranteeFromTo?: string;
  bankGuaranteeToFrom?: string;
  bankGuaranteeToTo?: string;
};

export type BatchResponse = {
  inserted?: number;
  upserted?: number;
  modified?: number;
  matched?: number;
};

export type PurchaseCreateDto = Omit<
  Purchase,
  '_id' | 'createdAt' | 'updatedAt'
>;
export type PurchaseUpdateDto = Partial<PurchaseCreateDto>;
export type Field = keyof Purchase;
