import { Injectable, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { PurchaseStatus, type UserRef } from 'shared';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';
import { ListPurchasesUseCase } from '../use-cases/list-purchases.use-case';
import { GetPurchaseUseCase } from '../use-cases/get-purchase.use-case';
import { CreatePurchaseUseCase } from '../use-cases/create-purchase.use-case';
import { UpdatePurchaseUseCase } from '../use-cases/update-purchase.use-case';
import { ChangeStatusUseCase } from '../use-cases/change-status.use-case';
import { ExportPurchasesUseCase } from '../use-cases/export-purchases.use-case';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly listUseCase: ListPurchasesUseCase,
    private readonly getUseCase: GetPurchaseUseCase,
    private readonly createUseCase: CreatePurchaseUseCase,
    private readonly updateUseCase: UpdatePurchaseUseCase,
    private readonly changeStatusUseCase: ChangeStatusUseCase,
    private readonly exportUseCase: ExportPurchasesUseCase,

    @Inject('IPurchaseRepository')
    private readonly purchaseRepository: IPurchaseRepository
  ) {}

  list = (dto: any) => this.listUseCase.execute(dto);

  listDeleted = (dto: any) =>
    this.listUseCase.execute({ ...dto, isDeleted: true });

  findOne = (id: string) => this.getUseCase.execute(id);

  // ✅ createdBy берём ТОЛЬКО с бэка (из токена)
  create = (dto: Partial<Purchase>, createdBy: UserRef) =>
    this.createUseCase.execute({ ...dto, createdBy });

  // ✅ запрещаем менять createdBy через update
  update = (id: string, dto: Partial<Purchase>) => {
    const { createdBy, ...safeDto } = dto as any;
    return this.updateUseCase.execute(id, safeDto);
  };

  setStatus = (id: string, status: PurchaseStatus, comment?: string) =>
    this.changeStatusUseCase.execute(id, status, comment);

  remove = async (id: string) => {
    await this.purchaseRepository.setDeleted(id, true);
    return { deleted: true };
  };

  setDeleted = (id: string, isDeleted: boolean) =>
    this.purchaseRepository.setDeleted(id, isDeleted);

  restore = async (id: string) => {
    await this.purchaseRepository.setDeleted(id, false);
    return { restored: true };
  };

  export = (dto: any) => this.exportUseCase.execute(dto);

  async batchUpsert(
    items: Partial<Purchase>[],
    options: {
      matchBy?: keyof Purchase;
      writeStatusHistoryOnInsert?: boolean;
    } = {}
  ) {
    return this.purchaseRepository.bulkUpsert(items, {
      matchBy: options.matchBy ?? 'entryNumber',
      writeStatusHistoryOnInsert: options.writeStatusHistoryOnInsert ?? true,
    });
  }
}
