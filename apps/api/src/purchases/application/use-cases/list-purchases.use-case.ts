import { Injectable, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';
import { ListPurchasesDto } from '../dto/list-purchases.dto';

interface ListResult {
  items: Purchase[];
  total: number;
}

@Injectable()
export class ListPurchasesUseCase {
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository
  ) {}

  async execute(dto: ListPurchasesDto): Promise<ListResult> {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 20;

    const filter = this.buildFilter(dto);

    const sort: Record<string, 1 | -1> = dto.sortBy
      ? { [dto.sortBy]: dto.sortOrder === 'asc' ? 1 : -1 }
      : { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.purchaseRepo.findAll(filter, {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        sort,
      }),
      this.purchaseRepo.count(filter),
    ]);

    return { items, total };
  }

  // ... buildFilter остаётся как есть
  private buildFilter(dto: ListPurchasesDto): any {
    const filter: any = {};
    const or: any[] = [];

    if (dto.q) {
      const rx = new RegExp(dto.q.trim(), 'i');
      or.push(
        { supplierName: rx },
        { contractSubject: rx },
        { contractNumber: rx },
        { entryNumber: rx },
        { supplierInn: rx },
        { methodOfPurchase: rx },
        { documentNumber: rx },
        { planNumber: rx },
        { publication: rx },
        { responsible: rx },
        { comment: rx }
      );
    }

    if (or.length) filter.$or = or;
    if (dto.completed !== undefined) filter.completed = dto.completed;
    if (dto.responsible)
      filter.responsible = new RegExp(dto.responsible.trim(), 'i');
    if (dto.status) filter.status = dto.status;
    if (dto.site) filter.site = dto.site;

    return filter;
  }
}
