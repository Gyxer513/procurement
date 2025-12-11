import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';
import { parseEntryNumberAndDate } from '../utils/entry-parser';

@Injectable()
export class UpdatePurchaseUseCase {
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository
  ) {}

  private sanitize(dto: Partial<Purchase>): any {
    const data = { ...(dto as any) };

    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.remainingContractAmount;

    delete data.status;
    delete data.statusHistory;
    delete data.lastStatusChangedAt;

    return data;
  }
  async execute(id: string, dto: Partial<Purchase>): Promise<Purchase> {
    const existing = await this.purchaseRepo.findById(id);
    if (!existing) throw new NotFoundException('Purchase not found');

    const data: any = this.sanitize(dto);

    // Нормализация "номер от дата" -> entryNumber + entryDate
    const combined = data.incomingNumber ?? data.entryRaw ?? data.entryNumber;
    if (typeof combined === 'string' && combined.trim()) {
      const parsed = parseEntryNumberAndDate(combined);
      if (parsed.entryNumber) data.entryNumber = parsed.entryNumber;
      if (!data.entryDate && parsed.entryDate)
        data.entryDate = parsed.entryDate;
    }

    // Если после санации обновлять нечего — вернём текущую сущность
    if (!Object.keys(data).length) return existing;

    return this.purchaseRepo.update(id, data);
  }
}
