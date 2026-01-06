import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { PurchaseStatus } from 'shared';
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

    return this.purchaseRepo.changeStatus(id, newStatus, comment);
  }
}
