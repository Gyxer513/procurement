import { Purchase } from './purchase.schema';

export type PurchaseVirtuals = {
  remainingContractAmount: number;
  statusChangeDates: Record<string, Date>;
};
export type PurchaseLean = Purchase & Partial<PurchaseVirtuals>;
