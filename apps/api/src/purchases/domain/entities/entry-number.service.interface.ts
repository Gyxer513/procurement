export interface IEntryNumberService {
  nextPurchaseEntryNumber(): Promise<string>;
}
