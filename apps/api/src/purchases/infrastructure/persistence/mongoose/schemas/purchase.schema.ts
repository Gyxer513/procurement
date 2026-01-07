import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  PurchaseStatus,
  PurchaseSite,
  PURCHASE_CATEGORIES,
  PurchaseCategory,
  UserRefSchemaFactory,
  UserRef,
} from 'shared';

// ──────────────────────────────────────────────────────────────
// Вложенная схема для истории статусов
// ──────────────────────────────────────────────────────────────
@Schema({ _id: false })
export class StatusHistoryEntrySchema {
  @Prop({
    type: String,
    enum: PurchaseStatus,
    required: true,
  })
  status!: PurchaseStatus;

  @Prop({ type: Date, required: true, default: Date.now })
  changedAt!: Date;

  @Prop({ type: String })
  comment?: string;
}

export const StatusHistoryEntrySchemaFactory = SchemaFactory.createForClass(
  StatusHistoryEntrySchema
);

// ──────────────────────────────────────────────────────────────
// Основная схема закупки
// ──────────────────────────────────────────────────────────────
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class PurchaseDocument {
  @Prop({ unique: true, sparse: true })
  entryNumber?: string;

  @Prop() contractSubject?: string;
  @Prop() supplierName?: string;
  @Prop() smp?: boolean;
  @Prop() supplierInn?: string;
  @Prop() purchaseAmount?: number;
  @Prop() contractNumber?: string;
  @Prop() contractDate?: Date;
  @Prop() validFrom?: Date;
  @Prop() validTo?: Date;
  @Prop() contractEnd?: Date;
  @Prop() initialPrice?: number;
  @Prop() placementDate?: Date;
  @Prop() methodOfPurchase?: string;
  @Prop() documentNumber?: string;
  @Prop({ default: false }) completed?: boolean;
  @Prop() savings?: number;
  @Prop() performanceAmount?: number;
  @Prop() performanceForm?: string;
  @Prop() additionalAgreementNumber?: string;
  @Prop() currentContractAmount?: number;
  @Prop() publication?: string;
  @Prop() responsible?: string;
  @Prop() planNumber?: string;
  @Prop() applicationAmount?: number;
  @Prop() comment?: string;

  @Prop({
    type: String,
    enum: PurchaseStatus,
    default: PurchaseStatus.InProgress,
    index: true,
  })
  status!: PurchaseStatus;

  @Prop({ type: Date })
  bankGuaranteeValidFrom?: Date;

  @Prop({ type: Date })
  bankGuaranteeValidTo?: Date;

  @Prop({ type: String, enum: PurchaseSite, index: true })
  site?: PurchaseSite;

  @Prop({ type: [StatusHistoryEntrySchemaFactory], default: [] })
  statusHistory!: StatusHistoryEntrySchema[];

  @Prop({ type: Date })
  lastStatusChangedAt?: Date;

  @Prop({
    type: String,
    enum: PURCHASE_CATEGORIES,
    index: true,
  })
  category?: PurchaseCategory;

  @Prop({ type: UserRefSchemaFactory, required: true })
  createdBy!: UserRef;

  @Prop({ type: UserRefSchemaFactory })
  procurementResponsible?: UserRef;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted!: boolean;
}

export const PurchaseSchema = SchemaFactory.createForClass(PurchaseDocument);

export type PurchaseDoc = HydratedDocument<PurchaseDocument>;
