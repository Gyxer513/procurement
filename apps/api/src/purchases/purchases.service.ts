import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { ListPurchasesDto } from './dto/list-purchases.dto';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>
  ) {}

  private buildFilter(query: ListPurchasesDto): FilterQuery<PurchaseDocument> {
    const filter: FilterQuery<PurchaseDocument> = {};
    const or: FilterQuery<PurchaseDocument>[] = [];

    if (query.q) {
      const rx = new RegExp(query.q.trim(), 'i');
      // поля для поиска: подстрой под твой schema
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
      sort['createdAt'] = -1; // дефолт
    }

    const [items, total] = await Promise.all([
      this.purchaseModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec(),
      this.purchaseModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  async findOne(id: string): Promise<Purchase> {
    const doc = await this.purchaseModel.findById(id).lean().exec();
    if (!doc) throw new NotFoundException('Purchase not found');
    return doc as unknown as Purchase;
  }

  async create(dto: Partial<Purchase>): Promise<Purchase> {
    const doc = await this.purchaseModel.create(dto);
    return doc.toObject() as unknown as Purchase;
  }

  async update(id: string, dto: Partial<Purchase>): Promise<Purchase> {
    const doc = await this.purchaseModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('Purchase not found');
    return doc as unknown as Purchase;
  }

  async remove(id: string) {
    await this.purchaseModel.findByIdAndDelete(id).exec();
  }

  async export(query: ListPurchasesDto) {
    const filter = this.buildFilter(query);
    // лимит на экспорт, чтобы не положить память (подстрой при необходимости)
    const MAX_EXPORT = 20000;

    const rows = await this.purchaseModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(MAX_EXPORT)
      .lean()
      .exec();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Закупки');

    ws.columns = [
      { header: 'Вход. №', key: 'entryNumber', width: 20 },
      { header: 'Предмет договора', key: 'contractSubject', width: 30 },
      { header: 'Поставщик', key: 'supplierName', width: 30 },
      { header: 'СМП', key: 'smp', width: 10 },
      { header: 'ИНН', key: 'supplierInn', width: 18 },
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
      { header: 'Состоялась', key: 'completed', width: 14 },
      { header: 'Экономия', key: 'savings', width: 16 },
      { header: 'Сумма исполнения', key: 'performanceAmount', width: 18 },
      { header: 'Форма обеспечения', key: 'performanceForm', width: 20 },
      { header: 'Номер ДС', key: 'additionalAgreementNumber', width: 18 },
      { header: 'Актуальная сумма', key: 'currentContractAmount', width: 18 },
      { header: 'Размещение', key: 'publication', width: 20 },
      { header: 'Ответственный', key: 'responsible', width: 20 },
      { header: '№ по плану', key: 'planNumber', width: 16 },
      { header: 'Обеспечение заявки', key: 'applicationAmount', width: 20 },
      { header: 'Примечания', key: 'comment', width: 30 },
    ] as any;

    const fmtDate = (v?: any) =>
      v ? (dayjs(v).isValid() ? dayjs(v).format('DD.MM.YYYY') : '') : '';

    for (const r of rows) {
      ws.addRow({
        entryNumber: r.entryNumber ?? '',
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
        publication: r.publication ?? '',
        responsible: r.responsible ?? '',
        planNumber: r.planNumber ?? '',
        applicationAmount: r.applicationAmount ?? '',
        comment: r.comment ?? '',
      });
    }

    // можно добавить форматирование чисел/дат по желанию

    const buffer = await wb.xlsx.writeBuffer();
    const filename = `purchases-${dayjs().format('YYYY-MM-DD')}.xlsx`;
    return { buffer, filename };
  }
}
