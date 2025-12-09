import type { Field } from '@shared/types/Purchase';

const EXACT: Record<string, Field> = {
  'вход. №, дата служебной записки': 'entryNumber',
  'предмет договора (краткое наименование закупаемых товаров, работ, услуг)':
    'contractSubject',
  'наименование поставщика, подрядчика, исполнителя': 'supplierName',
  "сmp": 'smp',
  "смп": 'smp',
  'инн поставщика, подрядчика, исполнителя': 'supplierInn',
  'сумма закупки': 'purchaseAmount',
  'номер договора (счета)': 'contractNumber',
  'дата заключения (выставления)': 'contractDate',
  'срок действия с': 'validFrom',
  'срок действия по (поставка товара, услуг, работ)': 'validTo',
  'срок исполнения договора': 'contractEnd',
  'начальная максимальная цена': 'initialPrice',
  'дата размещения процедуры': 'placementDate',
  'способ закупки / способ закупки в электронной форме': 'methodOfPurchase',
  'номер и дата документа подведения итогов закупки': 'documentNumber',
  'процедура закупки: состоялась, не состоялась': 'completed',
  'экономия, полученная в результате проведения процедуры закупки': 'savings',
  'сумма обеспечение исполнения договора': 'performanceAmount',
  'сумма обеспечения исполнения договора': 'performanceAmount',
  'форма обеспечения исполнения договора': 'performanceForm',
  'номер и дата последнего дс': 'additionalAgreementNumber',
  'размещение (наличие подписанных документов)': 'publication',
  'ответственный исполнитель': 'responsible',
  'номер по плану закупок': 'planNumber',
  'обеспечение заявки, сумма': 'applicationAmount',
  "примечания": 'comment',
};

const STARTS_WITH: Array<[string, Field]> = [
  ['предмет договора', 'contractSubject'],
  ['наименование поставщика', 'supplierName'],
  ['инн поставщика', 'supplierInn'],
  ['номер договора', 'contractNumber'],
  ['дата заключения', 'contractDate'],
  ['срок действия с', 'validFrom'],
  ['срок действия по', 'validTo'],
  ['срок исполнения договора', 'contractEnd'],
  ['начальная максимальная цена', 'initialPrice'],
  ['дата размещения', 'placementDate'],
  ['экономия', 'savings'],
  ['размещение', 'publication'],
  ['ответственный', 'responsible'],
  ['номер по плану закуп', 'planNumber'],
];

const INCLUDES_ALL: Array<[string[], Field]> = [
  [['вход', 'служебной записки'], 'entryNumber'],
  [['способ закупки'], 'methodOfPurchase'],
  [['итогов закупки'], 'documentNumber'],
  [['процедура закупки'], 'completed'],
  [['обеспечени', 'исполнения договора', 'сумма'], 'performanceAmount'],
  [['форма обеспеч', 'исполнения договора'], 'performanceForm'],
  [['последнего дс'], 'additionalAgreementNumber'],
  [['обеспечение заявки'], 'applicationAmount'],
];

const DATE_FIELDS: ReadonlySet<Field> = new Set([
  'contractDate',
  'validFrom',
  'validTo',
  'contractEnd',
  'placementDate',
]);

const NUMBER_FIELDS: ReadonlySet<Field> = new Set([
  'initialPrice',
  'purchaseAmount',
  'savings',
  'performanceAmount',
  'applicationAmount',
]);

export { DATE_FIELDS, NUMBER_FIELDS, INCLUDES_ALL, STARTS_WITH, EXACT };
