import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Purchase extends Document {
  @Prop() entryNumber: string; // Вход. №, дата служебной записки
  @Prop() contractSubject: string; // Предмет договора
  @Prop() supplierName: string; // Наименование поставщика
  @Prop() smp: string; // СМП
  @Prop() supplierInn: string; // ИНН поставщика
  @Prop() purchaseAmount: number; // Сумма закупки
  @Prop() contractNumber: string; // Номер договора
  @Prop() contractDate: Date; // Дата заключения
  @Prop() validFrom: Date; // Срок действия с
  @Prop() validTo: Date; // Срок действия по
  @Prop() contractEnd: Date; // Срок исполнения договора
  @Prop() initialPrice: number; // Начальная максимальная цена
  @Prop() placementDate: Date; // Дата размещения процедуры
  @Prop() methodOfPurchase: string; // Способ закупки
  @Prop() documentNumber: string; // Номер и дата документа
  @Prop() completed: boolean; // Процедура закупки состоялась
  @Prop() savings: number; // Экономия
  @Prop() performanceAmount: number; // Сумма исполнения договора
  @Prop() performanceForm: string; // Форма обеспечения исполнения
  @Prop() additionalAgreementNumber: string; // Номер ДС
  @Prop() currentContractAmount: number; // Актуальная сумма
  @Prop() publication: string; // Размещение (наличие подписанных документов)
  @Prop() responsible: string; // Ответственный исполнитель
  @Prop() planNumber: string; // Номер по плану закупок
  @Prop() applicationAmount: number; // Обеспечение заявки, сумма
  @Prop() comment: string; // Примечания
}

export type PurchaseDocument = Purchase & Document;
export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
