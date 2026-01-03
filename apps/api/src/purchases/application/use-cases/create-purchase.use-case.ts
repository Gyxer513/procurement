import { Injectable, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';
import { parseEntryNumberAndDate } from '../utils/entry-parser';
import { IEntryNumberService } from '../../domain/entities/entry-number.service.interface';

@Injectable()
export class CreatePurchaseUseCase {
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository,

    @Inject('IEntryNumberService')
    private readonly entryNumberService: IEntryNumberService
  ) {}

  private sanitize(dto: Partial<Purchase>): any {
    const data = { ...(dto as any) };

    delete data.remainingContractAmount;
    delete data.createdAt;
    delete data.updatedAt;

    return data;
  }

  async execute(dto: Partial<Purchase>): Promise<Purchase> {
    const data: any = this.sanitize(dto);

    // 1) Импортный формат "956-вн/ск от 23.07.2025"
    const combined = data.incomingNumber ?? data.entryRaw ?? data.entryNumber;
    if (typeof combined === 'string' && combined.trim()) {
      const parsed = parseEntryNumberAndDate(combined);
      if (parsed.entryNumber) data.entryNumber = parsed.entryNumber;
      if (!data.entryDate && parsed.entryDate)
        data.entryDate = parsed.entryDate;
    }

    // 2) Системное присвоение для новых записей:
    //    если entryNumber/entryDate не пришли (и не распарсились) — генерируем
    if (!data.entryDate) data.entryDate = new Date();
    if (!data.entryNumber)
      data.entryNumber =
        await this.entryNumberService.nextPurchaseEntryNumber();

    // 3) История статуса при создании
    if (
      data.status &&
      (!Array.isArray(data.statusHistory) || data.statusHistory.length === 0)
    ) {
      const now = new Date();
      data.statusHistory = [{ status: data.status, changedAt: now }];
      data.lastStatusChangedAt = now;
    }

    return this.purchaseRepo.create(data as unknown as Purchase);
  }
}
