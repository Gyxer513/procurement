import { PurchaseStatus } from '../enums/purchase-status.enum';

export class StatusHistoryEntry {
  constructor(
    public readonly status: PurchaseStatus,
    public readonly changedAt: Date,
    public readonly comment?: string,
  ) {}

  static create(status: PurchaseStatus, comment?: string): StatusHistoryEntry {
    return new StatusHistoryEntry(status, new Date(), comment);
  }
}
