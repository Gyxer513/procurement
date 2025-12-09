import { Injectable, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';
import { ListPurchasesDto } from '../dto/list-purchases.dto';
import { ExcelExporter } from '../../infrastructure/excel/excel-exporter';

@Injectable()
export class ExportPurchasesUseCase {
  private readonly MAX_EXPORT = 20000;

  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository,
    private readonly excelExporter: ExcelExporter
  ) {}

  async execute(
    query: ListPurchasesDto
  ): Promise<{ buffer: Buffer; filename: string }> {
    // Берём тот же фильтр, что и в ListPurchasesUseCase
    const filter = this.buildFilter(query);

    const purchases: Purchase[] = await this.purchaseRepo.findForExport(
      filter,
      this.MAX_EXPORT
    );

    const buffer = await this.excelExporter.export(purchases);

    const filename = `purchases-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return { buffer, filename };
  }

  private buildFilter(dto: ListPurchasesDto): any {
    // Можно вынести в отдельный FilterBuilder сервис, пока дублируем логику
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

    // Диапазоны дат (можно вынести в отдельный метод/сервис)
    this.addDateRange(
      filter,
      'lastStatusChangedAt',
      dto.lastStatusChangedFrom,
      dto.lastStatusChangedTo
    );
    this.addDateRange(
      filter,
      'bankGuaranteeValidFrom',
      dto.bankGuaranteeFromFrom,
      dto.bankGuaranteeFromTo
    );
    this.addDateRange(
      filter,
      'bankGuaranteeValidTo',
      dto.bankGuaranteeToFrom,
      dto.bankGuaranteeToTo
    );

    return filter;
  }

  private parseDate(v?: string | number | Date): Date | undefined {
    if (!v) return undefined;
    // Такой же парсер, как у тебя был
    // (можно вынести в отдельный DateParser сервис)
    const dayjs = require('dayjs');
    require('dayjs/plugin/customParseFormat');
    dayjs.extend(require('dayjs/plugin/customParseFormat'));

    if (v instanceof Date) return v;
    if (typeof v === 'number') {
      if (v > 1e12) return new Date(v);
      if (v > 1e9) return new Date(v * 1000);
      return new Date(Math.round((v - 25569) * 86400 * 1000));
    }
    let d = dayjs(String(v), ['DD.MM.YYYY', 'YYYY-MM-DD'], true);
    if (!d.isValid()) d = dayjs(String(v));
    return d.isValid() ? d.toDate() : undefined;
  }

  private addDateRange(filter: any, field: string, from?: string, to?: string) {
    const gte = this.parseDate(from);
    const lte = this.parseDate(to);
    if (gte || lte) {
      filter[field] = {
        ...(gte ? { $gte: gte } : {}),
        ...(lte ? { $lte: lte } : {}),
      };
    }
  }
}
