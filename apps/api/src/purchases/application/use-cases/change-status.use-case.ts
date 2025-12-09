import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { PurchaseStatus } from '../../domain';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';

@Injectable()
export class ChangeStatusUseCase {
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository
  ) {}

  async execute(
    id: string,
    newStatus: PurchaseStatus,
    comment?: string
  ): Promise<Purchase> {
    const purchase = await this.purchaseRepo.findById(id);
    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Здесь можно добавить проверку допустимости перехода статусов
    // например: из "отказано" нельзя перейти в "в работе" и т.д.

    return this.purchaseRepo.changeStatus(id, newStatus, comment);
  }
}
