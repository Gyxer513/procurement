// src/purchases/infrastructure/excel/excel-exporter.ts

import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { Purchase } from '../../domain/entities/purchase.entity';

@Injectable()
export class ExcelExporter {
  async export(purchases: Purchase[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Закупки');

    worksheet.columns = [
      { header: 'Вход. №', key: 'entryNumber', width: 16 },
      { header: 'Статус', key: 'status', width: 18 },
      { header: 'Дата изм. статуса', key: 'lastStatusChangedAt', width: 18 },
      { header: 'Площадка', key: 'site', width: 16 },
      { header: 'Предмет договора', key: 'contractSubject', width: 30 },
      { header: 'Поставщик', key: 'supplierName', width: 28 },
      { header: 'СМП', key: 'smp', width: 10 },
      { header: 'ИНН', key: 'supplierInn', width: 16 },
      { header: 'НМЦ', key: 'initialPrice', width: 16 },
      { header: 'Сумма закупки', key: 'purchaseAmount', width: 18 },
      { header: 'Номер договора', key: 'contractNumber', width: 18 },
      { header: 'Дата заключения', key: 'contractDate', width: 16 },
      { header: 'Срок действия с', key: 'validFrom', width: 16 },
      { header: 'по', key: 'validTo', width: 16 },
      { header: 'Исполнение до', key: 'contractEnd', width: 16 },
      { header: 'Дата размещения', key: 'placementDate', width: 16 },
      { header: 'Способ закупки', key: 'methodOfPurchase', width: 24 },
      { header: 'Документ (№, дата)', key: 'documentNumber', width: 20 },
      { header: 'Состоялась', key: 'completed', width: 12 },
      { header: 'Экономия', key: 'savings', width: 14 },
      { header: 'Сумма исполнения', key: 'performanceAmount', width: 18 },
      { header: 'Форма обеспечения', key: 'performanceForm', width: 20 },
      { header: 'Номер ДС', key: 'additionalAgreementNumber', width: 16 },
      { header: 'Актуальная сумма', key: 'currentContractAmount', width: 18 },
      {
        header: 'Остаток по договору',
        key: 'remainingContractAmount',
        width: 18,
      },
      { header: 'БГ: с', key: 'bankGuaranteeValidFrom', width: 16 },
      { header: 'БГ: по', key: 'bankGuaranteeValidTo', width: 16 },
      { header: 'Размещение', key: 'publication', width: 20 },
      { header: 'Ответственный', key: 'responsible', width: 18 },
      { header: '№ по плану', key: 'planNumber', width: 14 },
      { header: 'Обеспечение заявки', key: 'applicationAmount', width: 18 },
      { header: 'Примечания', key: 'comment', width: 30 },
    ];

    const fmt = (date?: Date | null): string =>
      date && dayjs(date).isValid() ? dayjs(date).format('DD.MM.YYYY') : '';

    const boolToText = (value?: boolean | null): string =>
      value === true ? 'Да' : value === false ? 'Нет' : '';

    for (const p of purchases) {
      worksheet.addRow({
        entryNumber: p.entryNumber ?? '',
        status: p.status ?? '',
        lastStatusChangedAt: fmt(p.lastStatusChangedAt),
        site: p.site ?? '',
        contractSubject: p.contractSubject ?? '',
        supplierName: p.supplierName ?? '',
        smp: p.smp != null ? boolToText(p.smp) : '',
        supplierInn: p.supplierInn ?? '',
        initialPrice: p.initialPrice ?? '',
        purchaseAmount: p.purchaseAmount ?? '',
        contractNumber: p.contractNumber ?? '',
        contractDate: fmt(p.contractDate),
        validFrom: fmt(p.validFrom),
        validTo: fmt(p.validTo),
        contractEnd: fmt(p.contractEnd),
        placementDate: fmt(p.placementDate),
        methodOfPurchase: p.methodOfPurchase ?? '',
        documentNumber: p.documentNumber ?? '',
        completed: boolToText(p.completed),
        savings: p.savings ?? '',
        performanceAmount: p.performanceAmount ?? '',
        performanceForm: p.performanceForm ?? '',
        additionalAgreementNumber: p.additionalAgreementNumber ?? '',
        currentContractAmount: p.currentContractAmount ?? '',
        remainingContractAmount: p.remainingContractAmount ?? 0,
        bankGuaranteeValidFrom: fmt(p.bankGuaranteeValidFrom),
        bankGuaranteeValidTo: fmt(p.bankGuaranteeValidTo),
        publication: p.publication ?? '',
        responsible: p.responsible ?? '',
        planNumber: p.planNumber ?? '',
        applicationAmount: p.applicationAmount ?? '',
        comment: p.comment ?? '',
      });
    }

    // Вот эта строчка — ключ к решению ошибки TS2740
    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(arrayBuffer);
  }
}
