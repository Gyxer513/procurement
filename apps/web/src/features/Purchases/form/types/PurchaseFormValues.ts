import type { Dayjs } from 'dayjs';
import { PurchaseStatus } from '@shared/enums/purchase-status.enum';
import { PurchaseSite } from '@shared/enums/purchase-site.enum';

export type PurchaseFormValues = {
  entryNumber?: string; // системное (можно read-only)
  entryDate?: Dayjs; // системное/или из импорта
  status?: PurchaseStatus;
  site?: PurchaseSite;
  lastStatusChangedAt?: Dayjs; // read-only

  contractSubject?: string;
  supplierName?: string;
  smp?: boolean;
  supplierInn?: string;

  purchaseAmount?: number;
  initialPrice?: number;

  contractNumber?: string;
  contractDate?: Dayjs;

  validFrom?: Dayjs;
  validTo?: Dayjs;
  contractEnd?: Dayjs;

  placementDate?: Dayjs;
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

  bankGuaranteeValidFrom?: Dayjs;
  bankGuaranteeValidTo?: Dayjs;

  // вычисляемое (только отображение)
  remainingContractAmount?: number;
};
