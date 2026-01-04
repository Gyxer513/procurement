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

    // === ДОБАВИТЬ: период/год ===
    const range = this.buildDateRange(dto);
    if (range) {
      // Фильтруем по createdAt (или замени на нужное поле)
      filter.createdAt = range;
    }

    return filter;
  }

  // range для Mongo: { $gte: Date, $lte: Date }
  private buildDateRange(
    dto: ListPurchasesDto
  ): { $gte?: Date; $lte?: Date } | null {
    let from = dto.dateFrom ?? null;
    let to = dto.dateTo ?? null;

    // Если пришёл year и не пришли dateFrom/dateTo — разворачиваем год в диапазон
    if (from === null && to === null && dto.year) {
      from = `${dto.year}-01-01`;
      to = `${dto.year}-12-31`;
    }

    if (!from && !to) return null;

    const range: { $gte?: Date; $lte?: Date } = {};

    if (from) {
      // начало дня UTC
      range.$gte = new Date(`${from}T00:00:00.000Z`);
    }
    if (to) {
      // конец дня UTC (включительно)
      range.$lte = new Date(`${to}T23:59:59.999Z`);
    }

    return range;
  }
}
