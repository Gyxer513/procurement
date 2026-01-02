import { PurchaseStatus } from '../enums/purchase-status.enum';
import { PurchaseSite } from '../enums/purchase-site.enum';
import { StatusHistoryEntry } from '../value-objects/status-history.vo';

export class Purchase {
  id?: string;
  entryNumber?: string;
  entryDate: Date;
  contractSubject?: string;
  supplierName?: string;
  smp?: boolean;
  supplierInn?: string;
  purchaseAmount?: number;
  contractNumber?: string;
  contractDate?: Date;
  validFrom?: Date;
  validTo?: Date;
  contractEnd?: Date;
  initialPrice?: number;
  placementDate?: Date;
  methodOfPurchase?: string;
  documentNumber?: string;
  completed = false;
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
  status: PurchaseStatus = PurchaseStatus.InProgress;
  site?: PurchaseSite;
  bankGuaranteeValidFrom?: Date;
  bankGuaranteeValidTo?: Date;

  private _statusHistory: StatusHistoryEntry[] = [];
  lastStatusChangedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  get statusHistory(): readonly StatusHistoryEntry[] {
    return this._statusHistory;
  }

  setStatusHistory(history: StatusHistoryEntry[]): void {
    this._statusHistory = history || [];
  }

  changeStatus(newStatus: PurchaseStatus, comment?: string): void {
    if (this.status === newStatus) return;

    const entry = StatusHistoryEntry.create(newStatus, comment);
    this._statusHistory.push(entry);
    this.status = newStatus;
    this.lastStatusChangedAt = entry.changedAt;
  }

  get remainingContractAmount(): number {
    if (
      this.currentContractAmount === undefined ||
      this.performanceAmount === undefined
    ) {
      return 0;
    }
    return Math.max(0, this.currentContractAmount - this.performanceAmount);
  }

  static fromMongo(doc: any): Purchase {
    const entity = new Purchase();

    entity.id = doc._id?.toString();
    entity.entryNumber = doc.entryNumber;
    entity.contractSubject = doc.contractSubject;
    entity.supplierName = doc.supplierName;
    entity.smp = doc.smp;
    entity.supplierInn = doc.supplierInn;
    entity.purchaseAmount = doc.purchaseAmount;
    entity.contractNumber = doc.contractNumber;
    entity.contractDate = doc.contractDate;
    entity.validFrom = doc.validFrom;
    entity.validTo = doc.validTo;
    entity.contractEnd = doc.contractEnd;
    entity.initialPrice = doc.initialPrice;
    entity.placementDate = doc.placementDate;
    entity.methodOfPurchase = doc.methodOfPurchase;
    entity.documentNumber = doc.documentNumber;
    entity.completed = doc.completed ?? false;
    entity.savings = doc.savings;
    entity.performanceAmount = doc.performanceAmount;
    entity.performanceForm = doc.performanceForm;
    entity.additionalAgreementNumber = doc.additionalAgreementNumber;
    entity.currentContractAmount = doc.currentContractAmount;
    entity.publication = doc.publication;
    entity.responsible = doc.responsible;
    entity.planNumber = doc.planNumber;
    entity.applicationAmount = doc.applicationAmount;
    entity.comment = doc.comment;
    entity.status = doc.status ?? PurchaseStatus.InProgress;
    entity.site = doc.site;
    entity.bankGuaranteeValidFrom = doc.bankGuaranteeValidFrom;
    entity.bankGuaranteeValidTo = doc.bankGuaranteeValidTo;

    if (doc.statusHistory) {
      entity.setStatusHistory(
        doc.statusHistory.map(
          (h: any) => new StatusHistoryEntry(h.status, h.changedAt, h.comment)
        )
      );
    }
    entity.lastStatusChangedAt = doc.lastStatusChangedAt;
    entity.createdAt = doc.createdAt;
    entity.updatedAt = doc.updatedAt;

    return entity;
  }
}
