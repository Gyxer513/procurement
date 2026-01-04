// GetPurchaseUseCase.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';
import { PurchaseStatus } from '../../domain';
import { ListPurchasesDto } from '../dto/list-purchases.dto';

@Injectable()
export class GetPurchaseUseCase {
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository
  ) {}

  async execute(id: string) {
    const purchase = await this.purchaseRepo.findById(id);
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }

  async listDeleted(dto: ListPurchasesDto) {
    // берём ту же логику пагинации/сортировки, но статус фиксируем
    const page = Math.max(1, Number(dto.page ?? 1));
    const pageSize = Math.max(1, Math.min(200, Number(dto.pageSize ?? 20)));
    const skip = (page - 1) * pageSize;

    const sortBy = dto.sortBy ?? 'createdAt';
    const sortOrder = dto.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder } as Record<string, 1 | -1>;

    const filter: any = { status: PurchaseStatus.Deleted };

    const [items, total] = await Promise.all([
      this.purchaseRepo.findAll(filter, { skip, limit: pageSize, sort }),
      this.purchaseRepo.count(filter),
    ]);

    return { items, total, page, pageSize };
  }
}
