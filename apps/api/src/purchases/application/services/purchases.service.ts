import { Injectable, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { PurchaseStatus } from '../../domain';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';

// Use-cases
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

    // ВОТ ЭТО ИСПРАВЛЕНИЕ — используем токен!
    @Inject('IPurchaseRepository')
    private readonly purchaseRepository: IPurchaseRepository
  ) {}

  // Публичные методы
  list = (dto: any) => this.listUseCase.execute(dto);
  findOne = (id: string) => this.getUseCase.execute(id);
  create = (dto: Partial<Purchase>) => this.createUseCase.execute(dto);
  update = (id: string, dto: Partial<Purchase>) =>
    this.updateUseCase.execute(id, dto);
  setStatus = (id: string, status: PurchaseStatus, comment?: string) =>
    this.changeStatusUseCase.execute(id, status, comment);
  remove = async (id: string) => {
    await this.getUseCase.execute(id); // проверяем существование
    // потом soft-delete
  };
  export = (dto: any) => this.exportUseCase.execute(dto);

  // Batch-операции
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
