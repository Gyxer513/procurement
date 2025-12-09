import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';

@Injectable()
export class UpdatePurchaseUseCase {
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository) {}

  async execute(id: string, dto: Partial<Purchase>): Promise<Purchase> {
    const existing = await this.purchaseRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Purchase not found');
    }

    Object.assign(existing, dto);
    return this.purchaseRepo.update(id, dto);
  }
}
