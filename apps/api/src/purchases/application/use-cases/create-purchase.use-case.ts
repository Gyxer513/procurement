import { Injectable, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';
import { parseEntryNumberAndDate } from '../utils/entry-parser';

@Injectable()
export class CreatePurchaseUseCase {
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository
  ) {}

  private sanitize(dto: Partial<Purchase>): any {
    const data = { ...(dto as any) };

    // Удаляем вычисляемые/системные поля, чтобы не пытаться их сетить
    delete data.remainingContractAmount; // геттер
    delete data.createdAt;
    delete data.updatedAt;
    // Если статус/историю будете выставлять здесь — входящие statusHistory/lastStatusChangedAt тоже лучше убрать, чтобы не перетирать вашей логикой:
    // delete data.statusHistory;
    // delete data.lastStatusChangedAt;

    return data;
  }

  async execute(dto: Partial<Purchase>): Promise<Purchase> {
    const data: any = this.sanitize(dto);

    // Нормализация "956-вн/ск от 23.07.2025" -> entryNumber + entryDate
    const combined = data.incomingNumber ?? data.entryRaw ?? data.entryNumber;
    if (typeof combined === 'string' && combined.trim()) {
      const parsed = parseEntryNumberAndDate(combined);
      if (parsed.entryNumber) data.entryNumber = parsed.entryNumber;
      if (!data.entryDate && parsed.entryDate)
        data.entryDate = parsed.entryDate;
    }

    // Если нужно — пишем историю статуса при создании (как в bulkUpsert)
    if (
      data.status &&
      (!Array.isArray(data.statusHistory) || data.statusHistory.length === 0)
    ) {
      const now = new Date();
      data.statusHistory = [{ status: data.status, changedAt: now }];
      data.lastStatusChangedAt = now;
    }

    // Критично: НЕ создаём инстанс класса и не делаем Object.assign — передаём plain-объект
    return this.purchaseRepo.create(data as unknown as Purchase);
  }
}
