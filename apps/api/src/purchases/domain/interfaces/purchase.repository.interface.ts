import { Purchase } from '../entities/purchase.entity';
import { PurchaseStatus } from '../enums/purchase-status.enum';
import { ClientSession } from 'mongoose';

export interface IPurchaseRepository {
  findAll(filter: any, options: {
    skip?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
  }): Promise<Purchase[]>;

  count(filter: any): Promise<number>;

  findById(id: string): Promise<Purchase | null>;

  create(purchase: Purchase, session?: ClientSession): Promise<Purchase>;

  update(id: string, data: Partial<Purchase>, session?: ClientSession): Promise<Purchase>;

  changeStatus(id: string, status: PurchaseStatus, comment?: string, session?: ClientSession): Promise<Purchase>;

  delete(id: string): Promise<void>;

  bulkUpsert(items: Partial<Purchase>[], options: {
    matchBy: keyof Purchase;
    writeStatusHistoryOnInsert?: boolean;
    session?: ClientSession;
  }): Promise<{ upserted: number; modified: number; matched: number }>;

  findForExport(filter: any, limit: number): Promise<Purchase[]>;
}
