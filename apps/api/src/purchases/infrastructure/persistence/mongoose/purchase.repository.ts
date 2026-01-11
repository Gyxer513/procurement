import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model, Types } from 'mongoose';
import { Purchase } from '../../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../../domain/interfaces/purchase.repository.interface';
import { PurchaseDocument, PurchaseDoc } from './schemas/purchase.schema';
import { PurchaseStatus, type UserRef } from 'shared';
import { parseEntryNumberAndDate } from '../../../application/utils/entry-parser';
import {
  EntityNotFoundError,
  DomainValidationError,
  DuplicateKeyError,
} from '../../../domain/errors/errors';

@Injectable()
export class PurchaseRepository implements IPurchaseRepository, OnModuleInit {
  constructor(
    @InjectModel(PurchaseDocument.name)
    private readonly model: Model<PurchaseDoc>
  ) {}

  async onModuleInit() {
    try {
      await this.model.collection.createIndex(
        { entryNumber: 1 },
        { unique: true, sparse: true }
      );
    } catch (e: any) {
      throw this.mapMongoError(e);
    }
  }

  private applyNotDeleted(filter: any = {}) {
    if (filter?.isDeleted !== undefined) return filter;
    return { ...filter, isDeleted: { $ne: true } };
  }

  private assertObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new DomainValidationError('Invalid id (ObjectId expected)', { id });
    }
  }

  private normalizeEntryFields(doc: Partial<Purchase>): Partial<Purchase> {
    const combined =
      (doc as any).incomingNumber ?? (doc as any).entryRaw ?? doc.entryNumber;

    if (typeof combined === 'string' && combined.trim()) {
      const parsed = parseEntryNumberAndDate(combined);

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
  // Mongo/Mongoose -> domain errors
  // ──────────────────────────────────────────────────────────────
  private mapMongoError(e: any): Error {
    // Mongoose validation
    if (e instanceof mongoose.Error.ValidationError) {
      const details = Object.fromEntries(
        Object.entries(e.errors).map(([k, v]: any) => [k, v?.message ?? v])
      );
      return new DomainValidationError('Validation error', details);
    }

    // CastError (в т.ч. некорректный ObjectId если где-то не провалидировали)
    if (e instanceof mongoose.Error.CastError) {
      return new DomainValidationError(`Invalid value for "${e.path}"`, {
        path: e.path,
        value: e.value,
      });
    }

    if (e?.code === 11000) {
      return new DuplicateKeyError(
        'Duplicate key',
        e?.keyValue ?? e?.keyPattern ?? e
      );
    }

    // bulkWrite может кидать MongoBulkWriteError (структура отличается)
    if (e?.name === 'MongoBulkWriteError') {
      if (e?.code === 11000) {
        return new DuplicateKeyError(
          'Duplicate key (bulk write)',
          e?.writeErrors ?? e
        );
      }
      return new DomainValidationError('Bulk write error', e?.writeErrors ?? e);
    }

    return e;
  }

  // ──────────────────────────────────────────────────────────────
  // Mappers
  // ──────────────────────────────────────────────────────────────
  private toEntity(doc: PurchaseDoc | null): Purchase | null {
    if (!doc) return null;

    const plain =
      'toObject' in doc ? doc.toObject({ virtuals: true }) : (doc as any);
    const entity = Purchase.fromMongo(plain);

    (entity as any).id =
      (plain as any)?._id?.toString?.() ?? (doc as any)?._id?.toString?.();

    return entity;
  }

  private toEntityArray(docs: PurchaseDoc | PurchaseDoc[] | null): Purchase[] {
    if (!docs) return [];
    const arr = Array.isArray(docs) ? docs : [docs];
    return arr.map((d) => this.toEntity(d)!).filter(Boolean);
  }

  // ──────────────────────────────────────────────────────────────
  // IPurchaseRepository
  // ──────────────────────────────────────────────────────────────
  async findById(id: string): Promise<Purchase | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.model
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .lean<PurchaseDoc>({ virtuals: true })
      .exec();

    return this.toEntity(doc);
  }

  async findAll(
    filter: any,
    options: { skip?: number; limit?: number; sort?: Record<string, 1 | -1> }
  ): Promise<Purchase[]> {
    try {
      const finalFilter = this.applyNotDeleted(filter);

      const query = this.model.find(finalFilter);
      if (options.sort) query.sort(options.sort);
      if (options.skip !== undefined) query.skip(options.skip);
      if (options.limit !== undefined) query.limit(options.limit);

      const docs = await query.lean<PurchaseDoc>({ virtuals: true }).exec();
      return this.toEntityArray(docs);
    } catch (e: any) {
      throw this.mapMongoError(e);
    }
  }

  async count(filter: any): Promise<number> {
    try {
      const finalFilter = this.applyNotDeleted(filter);
      return await this.model.countDocuments(finalFilter).exec();
    } catch (e: any) {
      throw this.mapMongoError(e);
    }
  }

  async create(purchase: Purchase, session?: ClientSession): Promise<Purchase> {
    if (!(purchase as any).createdBy) {
      throw new DomainValidationError('createdBy is required');
    }

    try {
      const toInsert = {
        ...purchase,
        _id: purchase.id ? new Types.ObjectId(purchase.id) : undefined,
      };

      const created = await this.model.create([toInsert], { session });
      const doc = Array.isArray(created) ? created[0] : created;

      return this.toEntity(doc)!;
    } catch (e: any) {
      throw this.mapMongoError(e);
    }
  }

  async update(
    id: string,
    data: Partial<Purchase>,
    session?: ClientSession
  ): Promise<Purchase> {
    this.assertObjectId(id);

    try {
      const normalized = this.normalizeEntryFields(data);

      const { createdBy, ...rest } = normalized as any;
      const safeUpdate = { ...rest };

      const updated = await this.model
        .findByIdAndUpdate(id, { $set: safeUpdate }, { new: true, session })
        .lean<PurchaseDoc>({ virtuals: true })
        .exec();

      if (!updated) throw new EntityNotFoundError('Purchase not found');
      return this.toEntity(updated)!;
    } catch (e: any) {
      throw this.mapMongoError(e);
    }
  }

  async changeStatus(
    id: string,
    status: PurchaseStatus,
    commentOrOpts?:
      | string
      | { comment?: string; procurementResponsible?: UserRef },
    session?: ClientSession
  ): Promise<Purchase> {
    this.assertObjectId(id);

    try {
      const now = new Date();

      const opts =
        typeof commentOrOpts === 'string'
          ? { comment: commentOrOpts }
          : commentOrOpts ?? {};

      const update = {
        $set: {
          status,
          lastStatusChangedAt: now,
          ...(opts.procurementResponsible && {
            procurementResponsible: opts.procurementResponsible,
          }),
        },
        $push: {
          statusHistory: {
            status,
            changedAt: now,
            ...(opts.comment && { comment: opts.comment }),
            ...(opts.procurementResponsible && {
              procurementResponsible: opts.procurementResponsible,
            }),
          },
        },
      };

      const doc = await this.model
        .findByIdAndUpdate(id, update, { new: true, session })
        .lean<PurchaseDoc>({ virtuals: true })
        .exec();

      if (!doc) throw new EntityNotFoundError('Purchase not found');
      return this.toEntity(doc)!;
    } catch (e: any) {
      throw this.mapMongoError(e);
    }
  }

  async setDeleted(
    id: string,
    isDeleted: boolean,
    session?: ClientSession
  ): Promise<Purchase> {
    this.assertObjectId(id);

    try {
      const updated = await this.model
        .findByIdAndUpdate(id, { $set: { isDeleted } }, { new: true, session })
        .lean<PurchaseDoc>({ virtuals: true })
        .exec();

      if (!updated) throw new EntityNotFoundError('Purchase not found');
      return this.toEntity(updated)!;
    } catch (e: any) {
      throw this.mapMongoError(e);
    }
  }

  async findForExport(filter: any, limit: number): Promise<Purchase[]> {
    try {
      const finalFilter = this.applyNotDeleted(filter);

      const docs = await this.model
        .find(finalFilter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean<PurchaseDoc>({ virtuals: true })
        .exec();

      return this.toEntityArray(docs);
    } catch (e: any) {
      throw this.mapMongoError(e);
    }
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

    try {
      const normalizedItems = items.map((i) => this.normalizeEntryFields(i));

      const ops = normalizedItems
        .filter((item) => item[matchBy] != null)
        .map((doc) => {
          const filter = { [matchBy]: doc[matchBy] };
          const $set = { ...doc, updatedAt: now };
          const $setOnInsert: any = { createdAt: now };

          if (writeStatusHistoryOnInsert && (doc as any).status) {
            $setOnInsert.statusHistory = [
              { status: (doc as any).status, changedAt: now },
            ];
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
    } catch (e: any) {
      throw this.mapMongoError(e);
    }
  }
}
