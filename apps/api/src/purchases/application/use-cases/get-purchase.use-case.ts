import { Injectable, Inject } from '@nestjs/common'; // ←←←←←←←←←←←←←←←←←←←←←
import { Purchase } from '../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';

@Injectable()
export class GetPurchaseUseCase {
  constructor(
    @Inject('IPurchaseRepository') // ← теперь Nest видит этот декоратор!
    private readonly purchaseRepo: IPurchaseRepository
  ) {}

  async execute(id: string): Promise<Purchase> {
    const purchase = await this.purchaseRepo.findById(id);
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    return purchase;
  }
}
