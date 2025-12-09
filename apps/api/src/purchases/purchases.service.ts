import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model } from 'mongoose';
import {
  Purchase,
  PurchaseDocument,
  PurchaseSite,
  PurchaseStatus,
} from './schemas/purchase.schema';
import { ListPurchasesDto } from './dto/list-purchases.dto';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PurchaseLean } from './schemas/purchaseVirtuals.types';

dayjs.extend(customParseFormat);

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>
  ) {}

  // Универсальный парсер даты (string.ts | number.ts | Date)
  private parseDate(v?: string | number | Date) {
    if (v === null || v === undefined || v === '') return undefined;

    if (typeof v === 'number') {
      // Поддержка timestamp/seconds/excel-serial
      if (v > 1e12) {
        const d = new Date(v); // миллисекунды
        return dayjs(d).isValid() ? d : undefined;
      }
      if (v > 1e9) {
        const d = new Date(v * 1000); // секунды
        return dayjs(d).isValid() ? d : undefined;
      }
      // excel serial date
      const epoch = new Date(Math.round((v - 25569) * 86400 * 1000));
      return dayjs(epoch).isValid() ? epoch : undefined;
    }

    if (v instanceof Date) return dayjs(v).isValid() ? v : undefined;

    const s = String(v).trim();
    // Сначала попробуем как ISO / свободный формат
    let d = dayjs(s);
    if (!d.isValid()) {
      // Пробуем строго DD.MM.YYYY
      d = dayjs(s, 'DD.MM.YYYY', true);
    }
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
    this.addDateRange(
      filter,
      'lastStatusChangedAt',
      query.lastStatusChangedFrom,
      query.lastStatusChangedTo
    );

    // Диапазоны по сроку действия банковской гарантии
    this.addDateRange(
      filter,
      'bankGuaranteeValidFrom',
      query.bankGuaranteeFromFrom,
      query.bankGuaranteeFromTo
    );
    this.addDateRange(
      filter,
      'bankGuaranteeValidTo',
      query.bankGuaranteeToFrom,
      query.bankGuaranteeToTo
    );

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
    const doc = await this.purchaseModel
      .findById(id)
      .lean<PurchaseLean>({ virtuals: true })
      .exec();
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
  async setStatus(
    id: string,
    status: PurchaseStatus,
    comment?: string
  ): Promise<PurchaseLean> {
    const now = new Date();
    const update: any = {
      $set: { status, lastStatusChangedAt: now },
      $push: {
        statusHistory: {
          status,
          changedAt: now,
          ...(comment ? { comment } : {}),
        },
      },
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

  // Экспорт в Excel
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
      {
        header: 'Остаток по договору',
        key: 'remainingContractAmount',
        width: 18,
      },
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
          Math.max(
            0,
            (r.currentContractAmount ?? 0) - (r.performanceAmount ?? 0)
          ),
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

  // -------------------------
  // BATCH: helpers
  // -------------------------
  private toNumber(v: any) {
    if (v === null || v === undefined || v === '') return undefined;
    const s = String(v)
      .replace(/[\s\u00A0]/g, '')
      .replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  }

  private toBool(v: any) {
    if (v === null || v === undefined || v === '') return undefined;
    if (typeof v === 'boolean') return v;
    const s = String(v).trim().toLowerCase();
    if (['true', '1', 'да', 'yes', 'y'].includes(s)) return true;
    if (['false', '0', 'нет', 'no', 'n'].includes(s)) return false;
    return undefined;
  }

  private stripUndefined<T extends Record<string, any>>(obj: T): T {
    const out: any = {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (v !== undefined) out[k] = v;
    }
    return out;
  }

  // Приводим поля к нужным типам
  private sanitizePurchase(input: any): Partial<Purchase> {
    const out: any = { ...input };

    // Даты
    out.contractDate = this.parseDate(input.contractDate);
    out.validFrom = this.parseDate(input.validFrom);
    out.validTo = this.parseDate(input.validTo);
    out.contractEnd = this.parseDate(input.contractEnd);
    out.placementDate = this.parseDate(input.placementDate);
    out.bankGuaranteeValidFrom = this.parseDate(input.bankGuaranteeValidFrom);
    out.bankGuaranteeValidTo = this.parseDate(input.bankGuaranteeValidTo);
    out.lastStatusChangedAt = this.parseDate(input.lastStatusChangedAt);

    // Числа
    out.initialPrice = this.toNumber(input.initialPrice);
    out.purchaseAmount = this.toNumber(input.purchaseAmount);
    out.savings = this.toNumber(input.savings);
    out.performanceAmount = this.toNumber(input.performanceAmount);
    out.currentContractAmount = this.toNumber(input.currentContractAmount);
    out.remainingContractAmount = this.toNumber(input.remainingContractAmount);
    out.applicationAmount = this.toNumber(input.applicationAmount);

    // Булевы
    const completed = this.toBool(input.completed);
    if (completed !== undefined) out.completed = completed;
    const smp = this.toBool(input.smp);
    if (smp !== undefined) out.smp = smp;

    // Ограничим статус и площадку, если пришли строки
    if (input.status) out.status = input.status as PurchaseStatus;
    if (input.site) out.site = input.site as PurchaseSite;

    // Пустые строки -> undefined
    for (const [k, v] of Object.entries(out)) {
      if (typeof v === 'string' && v.trim() === '') {
        (out as any)[k] = undefined;
      }
    }

    // Уберем undefined-поля, чтобы не затирать их в upsert
    return this.stripUndefined(out);
  }

  // -------------------------------
  // BATCH INSERT (только вставка)
  // -------------------------------
  async batchInsert(
    items: Partial<Purchase>[],
    opts?: { chunkSize?: number; session?: ClientSession }
  ) {
    if (!Array.isArray(items) || items.length === 0) {
      return { inserted: 0 };
    }
    const chunkSize = opts?.chunkSize ?? 1000;

    let inserted = 0;
    for (let i = 0; i < items.length; i += chunkSize) {
      const slice = items
        .slice(i, i + chunkSize)
        .map((x) => this.sanitizePurchase(x));
      try {
        const res = await this.purchaseModel.insertMany(slice, {
          ordered: false,
          session: opts?.session,
        });
        inserted += res.length;
      } catch (e: any) {
        if (e?.result?.result?.nInserted) {
          inserted += e.result.result.nInserted;
        }
      }
    }
    return { inserted };
  }

  // -------------------------------------
  // BATCH UPSERT (обновление/создание по ключу matchBy)
  // -------------------------------------
  async batchUpsert(
    items: Partial<Purchase>[],
    opts?: {
      matchBy?: keyof Purchase; // например, 'entryNumber'
      chunkSize?: number;
      session?: ClientSession;
      writeStatusHistoryOnInsert?: boolean;
    }
  ) {
    if (!Array.isArray(items) || items.length === 0) {
      return { upserted: 0, modified: 0, matched: 0 };
    }

    const matchBy = (opts?.matchBy ?? 'entryNumber') as string;
    const chunkSize = opts?.chunkSize ?? 1000;
    const now = new Date();

    let totalUpserted = 0;
    let totalModified = 0;
    let totalMatched = 0;

    for (let i = 0; i < items.length; i += chunkSize) {
      const slice = items
        .slice(i, i + chunkSize)
        .map((x) => this.sanitizePurchase(x));

      const prepared = slice.filter(
        (x) =>
          x &&
          x[matchBy] !== undefined &&
          x[matchBy] !== null &&
          x[matchBy] !== ''
      );

      const ops = prepared.map((doc) => {
        const $set = this.stripUndefined({
          ...doc,
          updatedAt: now,
        });

        const update: any = {
          $set,
          $setOnInsert: {
            createdAt: now,
          },
        };

        if (opts?.writeStatusHistoryOnInsert && doc.status) {
          update.$setOnInsert.statusHistory = [
            { status: doc.status, changedAt: now },
          ];
          update.$setOnInsert.lastStatusChangedAt =
            doc.lastStatusChangedAt ?? now;
        }

        return {
          updateOne: {
            filter: { [matchBy]: doc[matchBy] },
            update,
            upsert: true,
          },
        };
      });

      if (ops.length === 0) continue;

      try {
        const res = await this.purchaseModel.bulkWrite(ops, {
          ordered: false,
          session: opts?.session,
        });
        totalUpserted += res.upsertedCount ?? 0;
        totalModified += res.modifiedCount ?? 0;
        totalMatched += res.matchedCount ?? 0;
      } catch {
        // логируйте при необходимости; часть операций может быть успешной
      }
    }

    return {
      upserted: totalUpserted,
      modified: totalModified,
      matched: totalMatched,
    };
  }
}
