import { Injectable, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';
import { parseEntryNumberAndDate } from '../utils/entry-parser';
import { IEntryNumberService } from '../../domain/entities/entry-number.service.interface';
import type { UserRef } from 'shared';
import { randomUUID } from 'crypto';
import { UsersDirectoryPort } from '../../../identity/domain/interfaces/users-directory.port';

export type CreatePurchaseInput = Partial<Purchase> & {
  responsibleId?: string;
  responsibleManualFullName?: string;
};

@Injectable()
export class CreatePurchaseUseCase {
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository,
    @Inject('IEntryNumberService')
    private readonly entryNumberService: IEntryNumberService,
    private readonly identity: UsersDirectoryPort
  ) {}

  private sanitize(dto: CreatePurchaseInput): any {
    const data = { ...(dto as any) };

    // вычищаем "вычисляемые/системные"
    delete data.remainingContractAmount;
    delete data.createdAt;
    delete data.updatedAt;

    // вычищаем технические поля input (их нет в Purchase)
    delete data.responsibleId;
    delete data.responsibleManualFullName;

    return data;
  }

  async execute(dto: CreatePurchaseInput): Promise<Purchase> {
    const data: any = this.sanitize(dto);

    // 0) responsible -> UserRef
    let responsible: UserRef | undefined;

    if (dto.responsibleId) {
      const u = await this.identity.getUserById(dto.responsibleId);
      if (u) responsible = u;
    }

    if (!responsible && dto.responsibleManualFullName?.trim()) {
      responsible = {
        id: `manual:${randomUUID()}`,
        fullName: dto.responsibleManualFullName.trim(),
      };
    }

    if (responsible) data.responsible = responsible;

    // 1) parse entry
    const combined = data.incomingNumber ?? data.entryRaw ?? data.entryNumber;
    if (typeof combined === 'string' && combined.trim()) {
      const parsed = parseEntryNumberAndDate(combined);
      if (parsed.entryNumber) data.entryNumber = parsed.entryNumber;
      if (!data.entryDate && parsed.entryDate)
        data.entryDate = parsed.entryDate;
    }

    // 2) system defaults
    if (!data.entryDate) data.entryDate = new Date();
    if (!data.entryNumber) {
      data.entryNumber =
        await this.entryNumberService.nextPurchaseEntryNumber();
    }

    // 3) status history
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
