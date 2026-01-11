import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchasesController } from './interfaces/http/purchases.controller';
import { PurchasesService } from './application/services/purchases.service';
import { ListPurchasesUseCase } from './application/use-cases/list-purchases.use-case';
import { GetPurchaseUseCase } from './application/use-cases/get-purchase.use-case';
import { CreatePurchaseUseCase } from './application/use-cases/create-purchase.use-case';
import { UpdatePurchaseUseCase } from './application/use-cases/update-purchase.use-case';
import { ChangeStatusUseCase } from './application/use-cases/change-status.use-case';
import { ExportPurchasesUseCase } from './application/use-cases/export-purchases.use-case';
import { PurchaseRepository } from './infrastructure/persistence/mongoose/purchase.repository';
import { ExcelExporter } from './infrastructure/excel/excel-exporter';
import {
  PurchaseDocument,
  PurchaseSchema,
} from './infrastructure/persistence/mongoose/schemas/purchase.schema';
import { EntryNumberService } from './domain/interfaces/services/entry-number.service';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [
    IdentityModule,
    MongooseModule.forFeature([
      { name: PurchaseDocument.name, schema: PurchaseSchema },
    ]),
  ],
  controllers: [PurchasesController],
  providers: [
    PurchasesService,

    // Все use-cases
    ListPurchasesUseCase,
    GetPurchaseUseCase,
    CreatePurchaseUseCase,
    UpdatePurchaseUseCase,
    ChangeStatusUseCase,
    ExportPurchasesUseCase,

    // Infrastructure
    PurchaseRepository,
    ExcelExporter,

    {
      provide: 'IPurchaseRepository',
      useClass: PurchaseRepository,
    },
    { provide: 'IEntryNumberService', useClass: EntryNumberService },
  ],
  exports: [PurchasesService],
})
export class PurchasesModule {}
