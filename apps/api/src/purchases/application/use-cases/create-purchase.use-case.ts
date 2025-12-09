import { Injectable, Inject } from '@nestjs/common';
import { Purchase } from '../../domain/entities/purchase.entity';
import { IPurchaseRepository } from '../../domain/interfaces/purchase.repository.interface';

@Injectable()
export class CreatePurchaseUseCase {
  constructor(
    @Inject('IPurchaseRepository')
    private readonly purchaseRepo: IPurchaseRepository) {}

  async execute(dto: Partial<Purchase>): Promise<Purchase> {
    const purchase = new Purchase();
    Object.assign(purchase, dto);

    // Можно добавить валидацию домена здесь или через отдельный сервис
    return this.purchaseRepo.create(purchase);
  }
}
