import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Purchase, PurchaseDocument, PurchaseSite, PurchaseStatus } from './schemas/purchase.schema';
import { ListPurchasesDto } from './dto/list-purchases.dto';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { PurchaseLean } from './schemas/purchaseVirtuals.types';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>
  ) {}

  private parseDate(v?: string) {
    if (!v) return undefined;
    const d = dayjs(v);
    return d.isValid() ? d.toDate() : undefined;
  }

  private addDateRange(
    filter: FilterQuery<PurchaseDocument>,
    field: keyof FilterQuery<PurchaseDocument>,
    from?: string,
    to?: string
  ) {
    const gte = this.parseDate(from);
    const lte = this.parseDate(to);
    if (gte || lte) {
      (filter as any)[field as string] = {
        ...(gte ? { $gte: gte } : {}),
        ...(lte ? { $lte: lte } : {}),
      };
    }
  }

  private buildFilter(query: ListPurchasesDto): FilterQuery<PurchaseDocument> {
    const filter: FilterQuery<PurchaseDocument> = {};
    const or: FilterQuery<PurchaseDocument>[] = [];

    if (query.q) {
      const rx = new RegExp(query.q.trim(), 'i');
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

    if (typeof query.completed === 'boolean') {
      filter.completed = query.completed;
    }

    if (query.responsible) {
      filter.responsible = new RegExp(query.responsible.trim(), 'i');
    }

// Новые фильтры
    if (query.status) {
      filter.status = query.status as any as PurchaseStatus;
    }
    if (query.site) {
      filter.site = query.site as any as PurchaseSite;
    }

// Диапазон по дате последнего изменения статуса
    this.addDateRange(filter, 'lastStatusChangedAt', query.lastStatusChangedFrom, query.lastStatusChangedTo);

// Диапазоны по сроку действия банковской гарантии
    this.addDateRange(filter, 'bankGuaranteeValidFrom', query.bankGuaranteeFromFrom, query.bankGuaranteeFromTo);
    this.addDateRange(filter, 'bankGuaranteeValidTo', query.bankGuaranteeToFrom, query.bankGuaranteeToTo);

    return filter;
  }

  async list(query: ListPurchasesDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const filter = this.buildFilter(query);

    const sort: Record<string, 1 | -1> = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['createdAt'] = -1;
    }

    const [items, total] = await Promise.all([
      this.purchaseModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<PurchaseLean>({ virtuals: true })
        .exec(),
      this.purchaseModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  async findOne(id: string): Promise<PurchaseLean> {
    const doc = await this.purchaseModel.findById(id).lean<PurchaseLean>({ virtuals: true }).exec();
    if (!doc) throw new NotFoundException('Purchase not found');
    return doc;
  }

  async create(dto: Partial<Purchase>): Promise<PurchaseLean> {
    const doc = await this.purchaseModel.create(dto);
    return doc.toObject({ virtuals: true }) as PurchaseLean;
  }

  async update(id: string, dto: Partial<Purchase>): Promise<PurchaseLean> {
    const doc = await this.purchaseModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean<PurchaseLean>({ virtuals: true })
      .exec();
    if (!doc) throw new NotFoundException('Purchase not found');
    return doc;
  }

// Смена статуса с комментарием и записью в историю (атомарно)
  async setStatus(id: string, status: PurchaseStatus, comment?: string): Promise<PurchaseLean> {
    const now = new Date();
    const update: any = {
      $set: { status, lastStatusChangedAt: now },
      $push: { statusHistory: { status, changedAt: now, ...(comment ? { comment } : {}) } },
    };

    const doc = await this.purchaseModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean<PurchaseLean>({ virtuals: true })
      .exec();

    if (!doc) throw new NotFoundException('Purchase not found');
    return doc;
  }

  async remove(id: string) {
    await this.purchaseModel.findByIdAndDelete(id).exec();
  }

  async export(query: ListPurchasesDto) {
    const filter = this.buildFilter(query);
    const MAX_EXPORT = 20000;

    const rows: any = await this.purchaseModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(MAX_EXPORT)
      .lean<PurchaseLean>({ virtuals: true })
      .exec();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Закупки');

    ws.columns = [
      { header: 'Вход. №', key: 'entryNumber', width: 16 },
      { header: 'Статус', key: 'status', width: 18 },
      { header: 'Дата изм. статуса', key: 'lastStatusChangedAt', width: 18 },
      { header: 'Площадка', key: 'site', width: 16 },
      { header: 'Предмет договора', key: 'contractSubject', width: 30 },
      { header: 'Поставщик', key: 'supplierName', width: 28 },
      { header: 'СМП', key: 'smp', width: 10 },
      { header: 'ИНН', key: 'supplierInn', width: 16 },
      { header: 'НМЦ', key: 'initialPrice', width: 16 },
      { header: 'Сумма закупки', key: 'purchaseAmount', width: 18 },
      { header: 'Номер договора', key: 'contractNumber', width: 18 },
      { header: 'Дата заключения', key: 'contractDate', width: 16 },
      { header: 'Срок действия с', key: 'validFrom', width: 16 },
      { header: 'по', key: 'validTo', width: 16 },
      { header: 'Исполнение до', key: 'contractEnd', width: 16 },
      { header: 'Дата размещения', key: 'placementDate', width: 16 },
      { header: 'Способ закупки', key: 'methodOfPurchase', width: 24 },
      { header: 'Документ (№, дата)', key: 'documentNumber', width: 20 },
      { header: 'Состоялась', key: 'completed', width: 12 },
      { header: 'Экономия', key: 'savings', width: 14 },
      { header: 'Сумма исполнения', key: 'performanceAmount', width: 18 },
      { header: 'Форма обеспечения', key: 'performanceForm', width: 20 },
      { header: 'Номер ДС', key: 'additionalAgreementNumber', width: 16 },
      { header: 'Актуальная сумма', key: 'currentContractAmount', width: 18 },
      { header: 'Остаток по договору', key: 'remainingContractAmount', width: 18 },
      { header: 'БГ: с', key: 'bankGuaranteeValidFrom', width: 16 },
      { header: 'БГ: по', key: 'bankGuaranteeValidTo', width: 16 },
      { header: 'Размещение', key: 'publication', width: 20 },
      { header: 'Ответственный', key: 'responsible', width: 18 },
      { header: '№ по плану', key: 'planNumber', width: 14 },
      { header: 'Обеспечение заявки', key: 'applicationAmount', width: 18 },
      { header: 'Примечания', key: 'comment', width: 30 },
    ] as any;

    const fmtDate = (v?: any) =>
      v ? (dayjs(v).isValid() ? dayjs(v).format('DD.MM.YYYY') : '') : '';

    for (const r of rows) {
      ws.addRow({
        entryNumber: r.entryNumber ?? '',
        status: r.status ?? '',
        lastStatusChangedAt: fmtDate((r as any).lastStatusChangedAt),
        site: r.site ?? '',
        contractSubject: r.contractSubject ?? '',
        supplierName: r.supplierName ?? '',
        smp: r.smp ?? '',
        supplierInn: r.supplierInn ?? '',
        initialPrice: r.initialPrice ?? '',
        purchaseAmount: r.purchaseAmount ?? '',
        contractNumber: r.contractNumber ?? '',
        contractDate: fmtDate(r.contractDate),
        validFrom: fmtDate(r.validFrom),
        validTo: fmtDate(r.validTo),
        contractEnd: fmtDate(r.contractEnd),
        placementDate: fmtDate(r.placementDate),
        methodOfPurchase: r.methodOfPurchase ?? '',
        documentNumber: r.documentNumber ?? '',
        completed: r.completed ? 'Да' : 'Нет',
        savings: r.savings ?? '',
        performanceAmount: r.performanceAmount ?? '',
        performanceForm: r.performanceForm ?? '',
        additionalAgreementNumber: r.additionalAgreementNumber ?? '',
        currentContractAmount: r.currentContractAmount ?? '',
        remainingContractAmount:
          r.remainingContractAmount ??
          Math.max(0, (r.currentContractAmount ?? 0) - (r.performanceAmount ?? 0)),
        bankGuaranteeValidFrom: fmtDate((r as any).bankGuaranteeValidFrom),
        bankGuaranteeValidTo: fmtDate((r as any).bankGuaranteeValidTo),
        publication: r.publication ?? '',
        responsible: r.responsible ?? '',
        planNumber: r.planNumber ?? '',
        applicationAmount: r.applicationAmount ?? '',
        comment: r.comment ?? '',
      });
    }

    const buffer = await wb.xlsx.writeBuffer();
    const filename = `purchases-${dayjs().format('YYYY-MM-DD')}.xlsx`;
    return { buffer, filename };
  }
}
