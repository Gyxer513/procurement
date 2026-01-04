import { Inject, Injectable } from '@nestjs/common';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';
import { ListPurchasesDto } from '../dto/list-purchases.dto';
import { PurchaseStatus } from '../../domain';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function startOfDay(d: string) {
  // date-only 'YYYY-MM-DD' -> Date at 00:00:00
  return new Date(`${d}T00:00:00.000Z`);
}
function endOfDay(d: string) {
  // inclusive end of day
  return new Date(`${d}T23:59:59.999Z`);
}

@Injectable()
export class ListPurchasesUseCase {
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository
  ) {}

  async execute(dto: ListPurchasesDto) {
    const page = Math.max(1, Number(dto.page ?? 1));
    const pageSize = Math.max(1, Math.min(200, Number(dto.pageSize ?? 20)));
    const skip = (page - 1) * pageSize;

    // сортировка
    const sortBy = dto.sortBy ?? 'createdAt';
    const sortOrder = dto.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder } as Record<string, 1 | -1>;

    // БАЗОВО: удалённые не показываем
    const filter: any = { status: { $ne: PurchaseStatus.Deleted } };

    // Если явно запросили Deleted в общем списке — отдаём пусто
    if (dto.status === PurchaseStatus.Deleted) {
      return { items: [], total: 0, page, pageSize };
    }

    // Статус (кроме Deleted)
    if (dto.status) filter.status = dto.status;

    // site
    if (dto.site) filter.site = dto.site;

    // completed
    if (typeof dto.completed === 'boolean') filter.completed = dto.completed;

    // responsible
    if (dto.responsible) filter.responsible = dto.responsible;

    // q (по набору полей)
    if (dto.q?.trim()) {
      const rx = new RegExp(escapeRegExp(dto.q.trim()), 'i');
      filter.$or = [
        { entryNumber: rx },
        { contractSubject: rx },
        { supplierName: rx },
        { supplierInn: rx },
        { contractNumber: rx },
        { documentNumber: rx },
        { responsible: rx },
        { publication: rx },
        { planNumber: rx },
      ];
    }

    // lastStatusChangedAt range
    if (dto.lastStatusChangedFrom || dto.lastStatusChangedTo) {
      filter.lastStatusChangedAt = {};
      if (dto.lastStatusChangedFrom)
        filter.lastStatusChangedAt.$gte = new Date(dto.lastStatusChangedFrom);
      if (dto.lastStatusChangedTo)
        filter.lastStatusChangedAt.$lte = new Date(dto.lastStatusChangedTo);
    }

    // bankGuaranteeValidFrom range
    if (dto.bankGuaranteeFromFrom || dto.bankGuaranteeFromTo) {
      filter.bankGuaranteeValidFrom = {};
      if (dto.bankGuaranteeFromFrom)
        filter.bankGuaranteeValidFrom.$gte = new Date(
          dto.bankGuaranteeFromFrom
        );
      if (dto.bankGuaranteeFromTo)
        filter.bankGuaranteeValidFrom.$lte = new Date(dto.bankGuaranteeFromTo);
    }

    // bankGuaranteeValidTo range
    if (dto.bankGuaranteeToFrom || dto.bankGuaranteeToTo) {
      filter.bankGuaranteeValidTo = {};
      if (dto.bankGuaranteeToFrom)
        filter.bankGuaranteeValidTo.$gte = new Date(dto.bankGuaranteeToFrom);
      if (dto.bankGuaranteeToTo)
        filter.bankGuaranteeValidTo.$lte = new Date(dto.bankGuaranteeToTo);
    }

    // year / dateFrom / dateTo — фильтруем по contractDate (можешь заменить поле)
    if (dto.year) {
      const from = new Date(`${dto.year}-01-01T00:00:00.000Z`);
      const to = new Date(`${dto.year}-12-31T23:59:59.999Z`);
      filter.contractDate = { $gte: from, $lte: to };
    } else if (dto.dateFrom || dto.dateTo) {
      filter.contractDate = {};
      if (dto.dateFrom) filter.contractDate.$gte = startOfDay(dto.dateFrom);
      if (dto.dateTo) filter.contractDate.$lte = endOfDay(dto.dateTo);
    }

    const [items, total] = await Promise.all([
      this.purchaseRepo.findAll(filter, { skip, limit: pageSize, sort }),
      this.purchaseRepo.count(filter),
    ]);

    return { items, total, page, pageSize };
  }
}
