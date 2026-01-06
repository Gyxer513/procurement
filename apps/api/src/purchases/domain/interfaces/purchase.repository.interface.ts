import { Purchase } from '../entities/purchase.entity';
import { ClientSession } from 'mongoose';
import { UserRef, PurchaseStatus } from 'shared';

export interface IPurchaseRepository {
  findAll(
    filter: any,
    options: {
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    }
  ): Promise<Purchase[]>;

  count(filter: any): Promise<number>;

  findById(id: string): Promise<Purchase | null>;

  create(purchase: Purchase, session?: ClientSession): Promise<Purchase>;

  update(
    id: string,
    data: Partial<Purchase>,
    session?: ClientSession
  ): Promise<Purchase>;

  changeStatus(
    id: string,
    status: PurchaseStatus,
    opts?: { comment?: string; procurementResponsible?: UserRef },
    session?: ClientSession
  ): Promise<Purchase>;

  setDeleted(
    id: string,
    isDeleted: boolean,
    session?: ClientSession
  ): Promise<Purchase>;

  bulkUpsert(
    items: Partial<Purchase>[],
    options: {
      matchBy: keyof Purchase;
      writeStatusHistoryOnInsert?: boolean;
      session?: ClientSession;
    }
  ): Promise<{ upserted: number; modified: number; matched: number }>;

  findForExport(filter: any, limit: number): Promise<Purchase[]>;
}
