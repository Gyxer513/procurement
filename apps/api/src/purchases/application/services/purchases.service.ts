import { Injectable, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { PurchaseStatus } from 'shared';
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

  // обычный список должен исключать удалённые (лучше сделать это внутри use-case, см. ниже)
  list = (dto: any) => this.listUseCase.execute(dto);

  // список удалённых — тоже лучше делать через listUseCase, но с фильтром isDeleted:true
  listDeleted = (dto: any) =>
    this.listUseCase.execute({ ...dto, isDeleted: true });

  findOne = (id: string) => this.getUseCase.execute(id);
  create = (dto: Partial<Purchase>) => this.createUseCase.execute(dto);
  update = (id: string, dto: Partial<Purchase>) =>
    this.updateUseCase.execute(id, dto);

  setStatus = (id: string, status: PurchaseStatus, comment?: string) =>
    this.changeStatusUseCase.execute(id, status, comment);

  // soft-delete вместо смены статуса
  remove = async (id: string) => {
    // если нужно "идемпотентно" — можно сначала прочитать, но не обязательно
    await this.purchaseRepository.setDeleted(id, true);
    return { deleted: true };
  };
  setDeleted = (id: string, isDeleted: boolean) =>
    this.purchaseRepository.setDeleted(id, isDeleted);
  // (опционально) восстановление
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
