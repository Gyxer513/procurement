import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchasesController } from './ui/purchases.controller';
import { PurchasesService } from './application/services/purchases.service';
import { Purchase, PurchaseSchema } from './infrastructure/schemas/purchase.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Purchase.name, schema: PurchaseSchema }])],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
