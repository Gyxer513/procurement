export type Purchase = {
  _id: string;
  entryNumber?: string;
  contractSubject?: string;
  supplierName?: string;
  smp?: string;
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
  status: string
  site: string
  bankGuaranteeValidFrom?: string | Date
  bankGuaranteeValidTo?: string | Date
  lastStatusChangedAt?: string | Date
  remainingContractAmount?: number
  statusHistory?: { status: string; changedAt: string | Date; comment?: string }[]
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
  status?: string
  site?: string
  lastStatusChangedFrom?: string
  lastStatusChangedTo?: string
  bankGuaranteeFromFrom?: string
  bankGuaranteeFromTo?: string
  bankGuaranteeToFrom?: string
  bankGuaranteeToTo?: string
};

export type BatchResponse = {
  inserted?: number;
  upserted?: number;
  modified?: number;
  matched?: number;
};

export type PurchaseCreateDto = Omit<Purchase, '_id' | 'createdAt' | 'updatedAt'>;
export type PurchaseUpdateDto = Partial<PurchaseCreateDto>;
export type Field = keyof Purchase;
