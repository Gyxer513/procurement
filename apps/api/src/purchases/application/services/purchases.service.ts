import { Injectable, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { PurchaseStatus } from '../../domain';
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
  listDeleted = (dto: any) => this.getUseCase.listDeleted(dto);
  findOne = (id: string) => this.getUseCase.execute(id);
  create = (dto: Partial<Purchase>) => this.createUseCase.execute(dto);
  update = (id: string, dto: Partial<Purchase>) =>
    this.updateUseCase.execute(id, dto);
  setStatus = (id: string, status: PurchaseStatus, comment?: string) =>
    this.changeStatusUseCase.execute(id, status, comment);

  // вместо физического удаления — ставим статус Deleted
  remove = async (id: string) => {
    // если уже Deleted — можно либо вернуть ok, либо кинуть ошибку
    const purchase = await this.getUseCase.execute(id);
    if (purchase.status === PurchaseStatus.Deleted) {
      return { deleted: true };
    }

    await this.changeStatusUseCase.execute(
      id,
      PurchaseStatus.Deleted,
      'Удалено'
    );

    return { deleted: true };
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
