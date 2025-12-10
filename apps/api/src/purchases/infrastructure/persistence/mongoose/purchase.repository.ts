import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Purchase } from '../../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../../domain/interfaces/purchase.repository.interface';
import { PurchaseDocument, PurchaseDoc } from './schemas/purchase.schema';
import { PurchaseStatus } from '../../../domain';
import { parseEntryNumberAndDate } from '../../../application/utils/entry-parser';

@Injectable()
export class PurchaseRepository implements IPurchaseRepository, OnModuleInit {
  constructor(
    @InjectModel(PurchaseDocument.name)
    private readonly model: Model<PurchaseDoc>
  ) {}

  onModuleInit() {
    this.model.collection.createIndex(
      { entryNumber: 1 },
      { unique: true, sparse: true }
    );
  }

  private normalizeEntryFields(doc: Partial<Purchase>): Partial<Purchase> {
    // поддержим разные входы: incomingNumber / entryRaw / entryNumber
    const combined =
      (doc as any).incomingNumber ?? (doc as any).entryRaw ?? doc.entryNumber;

    if (typeof combined === 'string' && combined.trim()) {
      const parsed = parseEntryNumberAndDate(combined);

      // если entryNumber выглядит как "номер от дата" — всегда заменим на "чистый" номер
      // если даты нет в dto — поставим распарсенную
      const shouldReplaceNumber =
        parsed.entryNumber &&
        (/(^|[^а-яa-z])от([^а-яa-z]|$)/i.test(combined) ||
          /\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}/.test(combined));

      return {
        ...doc,
        entryNumber: shouldReplaceNumber
          ? parsed.entryNumber
          : doc.entryNumber ?? parsed.entryNumber,
        entryDate: doc.entryDate ?? parsed.entryDate,
      };
    }

    return doc;
  }

  // ──────────────────────────────────────────────────────────────
  // Универсальные мапперы
  // ──────────────────────────────────────────────────────────────
  private toEntity(doc: PurchaseDoc | null): Purchase | null {
    if (!doc) return null;
    const plain = 'toObject' in doc ? doc.toObject({ virtuals: true }) : doc;
    const entity = Purchase.fromMongo(plain);
    (entity as any).id = doc._id.toString();
    return entity;
  }

  private toEntityArray(docs: PurchaseDoc | PurchaseDoc[] | null): Purchase[] {
    if (!docs) return [];
    const array = Array.isArray(docs) ? docs : [docs];
    return array.map((d) => this.toEntity(d)!);
  }

  // ──────────────────────────────────────────────────────────────
  // Реализация интерфейса IPurchaseRepository
  // ──────────────────────────────────────────────────────────────
  async findAll(
    filter: any,
    options: { skip?: number; limit?: number; sort?: Record<string, 1 | -1> }
  ): Promise<Purchase[]> {
    const query = this.model.find(filter);
    if (options.sort) query.sort(options.sort);
    if (options.skip !== undefined) query.skip(options.skip);
    if (options.limit !== undefined) query.limit(options.limit);

    const docs = await query.lean<PurchaseDoc>({ virtuals: true }).exec();
    return this.toEntityArray(docs);
  }

  async count(filter: any): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async findById(id: string): Promise<Purchase | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model
      .findById(id)
      .lean<PurchaseDoc>({ virtuals: true })
      .exec();
    return this.toEntity(doc);
  }

  async create(purchase: Purchase, session?: ClientSession): Promise<Purchase> {
    const toInsert = {
      ...purchase,
      _id: purchase.id ? new Types.ObjectId(purchase.id) : undefined,
    };

    const created = await this.model.create([toInsert], { session });
    const doc = Array.isArray(created) ? created[0] : created;
    return this.toEntity(doc)!;
  }

  async update(
    id: string,
    data: Partial<Purchase>,
    session?: ClientSession
  ): Promise<Purchase> {
    const updated = await this.model
      .findByIdAndUpdate(id, { $set: data }, { new: true, session })
      .lean<PurchaseDoc>({ virtuals: true })
      .exec();

    if (!updated) throw new Error('Purchase not found');
    return this.toEntity(updated)!;
  }

  async changeStatus(
    id: string,
    status: PurchaseStatus,
    comment?: string,
    session?: ClientSession
  ): Promise<Purchase> {
    const now = new Date();
    const update = {
      $set: { status, lastStatusChangedAt: now },
      $push: {
        statusHistory: {
          status,
          changedAt: now,
          ...(comment && { comment }),
        },
      },
    };

    const doc = await this.model
      .findByIdAndUpdate(id, update, { new: true, session })
      .lean<PurchaseDoc>({ virtuals: true })
      .exec();

    if (!doc) throw new Error('Purchase not found');
    return this.toEntity(doc)!;
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async findForExport(filter: any, limit: number): Promise<Purchase[]> {
    const docs = await this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<PurchaseDoc>({ virtuals: true })
      .exec();

    return this.toEntityArray(docs);
  }

  async bulkUpsert(
    items: Partial<Purchase>[],
    options: {
      matchBy: keyof Purchase;
      writeStatusHistoryOnInsert?: boolean;
      session?: ClientSession;
    }
  ): Promise<{ upserted: number; modified: number; matched: number }> {
    const { matchBy, writeStatusHistoryOnInsert, session } = options;
    const now = new Date();

    // Нормализуем номер/дату до записи
    const normalizedItems = items.map((i) => this.normalizeEntryFields(i));

    const ops = normalizedItems
      .filter((item) => item[matchBy] != null)
      .map((doc) => {
        const filter = { [matchBy]: doc[matchBy] };
        const $set = { ...doc, updatedAt: now };
        const $setOnInsert: any = { createdAt: now };

        if (writeStatusHistoryOnInsert && doc.status) {
          $setOnInsert.statusHistory = [{ status: doc.status, changedAt: now }];
          $setOnInsert.lastStatusChangedAt = now;
        }

        return {
          updateOne: {
            filter,
            update: { $set, $setOnInsert },
            upsert: true,
          },
        };
      });

    if (ops.length === 0) {
      return { upserted: 0, modified: 0, matched: 0 };
    }

    const result = await this.model.bulkWrite(ops, {
      ordered: false,
      session,
    });

    return {
      upserted: result.upsertedCount ?? 0,
      modified: result.modifiedCount ?? 0,
      matched: result.matchedCount ?? 0,
    };
  }
}
