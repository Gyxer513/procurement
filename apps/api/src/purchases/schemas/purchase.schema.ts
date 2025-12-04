import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export enum PurchaseStatus {
  InProgress = 'в работе',
  UnderReview = 'на рассмотрении',
  ReceivedByProcurement = 'получено отделом закупок',
  Rework = 'на доработку',
  Rejected = 'отказано',
  Canceled = 'аннулировано',
}

export enum PurchaseSite {
  Skatertny = 'Скатертный',
  Lomonosovsky = 'Ломоносовский',
  Voronovo = 'Вороново',
}

@Schema({ _id: false })
export class StatusHistoryEntry {
  @Prop({ enum: PurchaseStatus, required: true })
  status: PurchaseStatus;

  @Prop({ type: Date, required: true, default: Date.now })
  changedAt: Date;

  @Prop()
  comment?: string;
}
export const StatusHistoryEntrySchema = SchemaFactory.createForClass(StatusHistoryEntry);

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Purchase extends Document {
  @Prop() entryNumber: string;
  @Prop() contractSubject: string;
  @Prop() supplierName: string;
  @Prop() smp: string;
  @Prop() supplierInn: string;
  @Prop() purchaseAmount: number;
  @Prop() contractNumber: string;
  @Prop() contractDate: Date;
  @Prop() validFrom: Date;
  @Prop() validTo: Date;
  @Prop() contractEnd: Date;
  @Prop() initialPrice: number;
  @Prop() placementDate: Date;
  @Prop() methodOfPurchase: string;
  @Prop() documentNumber: string;
  @Prop() completed: boolean;
  @Prop() savings: number;
  @Prop() performanceAmount: number;
  @Prop() performanceForm: string;
  @Prop() additionalAgreementNumber: string;
  @Prop() currentContractAmount: number;
  @Prop() publication: string;
  @Prop() responsible: string;
  @Prop() planNumber: string;
  @Prop() applicationAmount: number;
  @Prop() comment: string;

// Новые поля из прошлого ответа
  @Prop({ enum: PurchaseStatus, default: PurchaseStatus.InProgress, index: true })
  status: PurchaseStatus;

  @Prop() bankGuaranteeValidFrom: Date;
  @Prop() bankGuaranteeValidTo: Date;

  @Prop({ enum: PurchaseSite, index: true })
  site: PurchaseSite;

// История изменений статусов
  @Prop({ type: [StatusHistoryEntrySchema], default: [] })
  statusHistory: StatusHistoryEntry[];

// Последняя дата изменения статуса (для быстрого доступа/сортировки)
  @Prop({ type: Date })
  lastStatusChangedAt?: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
export type PurchaseDocument = HydratedDocument<Purchase>;
