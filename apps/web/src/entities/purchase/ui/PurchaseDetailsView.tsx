import { Card, Col, Descriptions, Divider, Row, Space, Tag } from 'antd';
import { fmtDate, rub } from '@shared/utils/format';
import PurchaseStatusTimeline from '@/widgets/status-timeline/ui/PurchaseStatusTimeline';
import { STATUS_COLORS } from '@shared/enums/statusColors';
import { CopyableValue } from '@/shared/ui/copy/CopyableValue';
import { Purchase } from '@shared/types/Purchase';

const SITE_COLORS: Record<string, string> = {
  Скатертный: 'blue',
  Ломоносовский: 'red',
  Вороново: 'green',
};

const yesNo = (v?: boolean) => (v === true ? 'Да' : v === false ? 'Нет' : '-');

function money(v?: number) {
  if (v === 0) return rub.format(0);
  if (!v) return '-';
  return rub.format(v);
}

function dateStr(v?: any) {
  const s = fmtDate(v);
  return s || '-';
}

export function PurchaseDetailsView(props: { purchase: Purchase }) {
  const { purchase } = props;

  const remaining =
    (purchase as any)?.remainingContractAmount ??
    Math.max(
      0,
      (purchase?.currentContractAmount ?? 0) -
        (purchase?.performanceAmount ?? 0)
    );

  const history =
    (purchase as any)._statusHistory ?? (purchase as any).statusHistory ?? [];

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={14}>
        <Descriptions
          title="Основное"
          column={1}
          bordered
          size="middle"
          items={[
            {
              key: 'entryNumber',
              label: 'Номер (entryNumber)',
              children: (
                <CopyableValue
                  display={purchase.entryNumber || '-'}
                  copyText={purchase.entryNumber || ''}
                />
              ),
            },
            {
              key: 'contractSubject',
              label: 'Предмет договора',
              children: (
                <CopyableValue
                  display={purchase.contractSubject || '-'}
                  copyText={purchase.contractSubject || ''}
                />
              ),
            },
            {
              key: 'status',
              label: 'Статус',
              children: (
                <CopyableValue
                  display={
                    <Space wrap>
                      <Tag color={STATUS_COLORS[purchase.status] ?? 'default'}>
                        {purchase.status || '-'}
                      </Tag>
                      <span style={{ color: '#888' }}>
                        {purchase.lastStatusChangedAt
                          ? `изменен: ${dateStr(purchase.lastStatusChangedAt)}`
                          : ''}
                      </span>
                    </Space>
                  }
                  copyText={purchase.status || ''}
                />
              ),
            },
            {
              key: 'site',
              label: 'Площадка',
              children: (
                <CopyableValue
                  display={
                    <Tag color={SITE_COLORS[purchase.site as any] ?? 'default'}>
                      {purchase.site || '-'}
                    </Tag>
                  }
                  copyText={(purchase.site as any) || ''}
                />
              ),
            },
            {
              key: 'supplierName',
              label: 'Поставщик',
              children: (
                <CopyableValue
                  display={purchase.supplierName || '-'}
                  copyText={purchase.supplierName || ''}
                />
              ),
            },
            {
              key: 'supplierInn',
              label: 'ИНН',
              children: (
                <CopyableValue
                  display={purchase.supplierInn || '-'}
                  copyText={purchase.supplierInn || ''}
                />
              ),
            },
            {
              key: 'smp',
              label: 'СМП',
              children: (
                <CopyableValue
                  display={yesNo(purchase.smp)}
                  copyText={
                    purchase.smp === undefined ? '' : String(purchase.smp)
                  }
                />
              ),
            },
            {
              key: 'methodOfPurchase',
              label: 'Способ закупки',
              children: (
                <CopyableValue
                  display={purchase.methodOfPurchase || '-'}
                  copyText={purchase.methodOfPurchase || ''}
                />
              ),
            },
            {
              key: 'documentNumber',
              label: 'Документ №',
              children: (
                <CopyableValue
                  display={purchase.documentNumber || '-'}
                  copyText={purchase.documentNumber || ''}
                />
              ),
            },
            {
              key: 'contractNumber',
              label: 'Номер договора',
              children: (
                <CopyableValue
                  display={purchase.contractNumber || '-'}
                  copyText={purchase.contractNumber || ''}
                />
              ),
            },
            {
              key: 'planNumber',
              label: '№ по плану',
              children: (
                <CopyableValue
                  display={purchase.planNumber || '-'}
                  copyText={purchase.planNumber || ''}
                />
              ),
            },
            {
              key: 'responsible',
              label: 'Ответственный',
              children: (
                <CopyableValue
                  display={purchase.responsible || '-'}
                  copyText={purchase.responsible || ''}
                />
              ),
            },
            {
              key: 'publication',
              label: 'Размещение',
              children: (
                <CopyableValue
                  display={purchase.publication || '-'}
                  copyText={purchase.publication || ''}
                />
              ),
            },
            {
              key: 'completed',
              label: 'Завершена (completed)',
              children: (
                <CopyableValue
                  display={yesNo(purchase.completed)}
                  copyText={
                    purchase.completed === undefined
                      ? ''
                      : String(purchase.completed)
                  }
                />
              ),
            },
            {
              key: 'performanceForm',
              label: 'Форма исполнения',
              children: (
                <CopyableValue
                  display={(purchase as any).performanceForm || '-'}
                  copyText={(purchase as any).performanceForm || ''}
                />
              ),
            },
            {
              key: 'additionalAgreementNumber',
              label: '№ доп. соглашения',
              children: (
                <CopyableValue
                  display={(purchase as any).additionalAgreementNumber || '-'}
                  copyText={(purchase as any).additionalAgreementNumber || ''}
                />
              ),
            },
            {
              key: 'comment',
              label: 'Примечания',
              children: (
                <CopyableValue
                  display={purchase.comment || '-'}
                  copyText={purchase.comment || ''}
                />
              ),
            },
          ]}
        />

        <Divider />

        <Descriptions
          title="Даты"
          column={2}
          bordered
          size="middle"
          items={[
            {
              key: 'contractDate',
              label: 'Дата заключения',
              children: (
                <CopyableValue
                  display={dateStr(purchase.contractDate)}
                  copyText={
                    purchase.contractDate ? String(purchase.contractDate) : ''
                  }
                />
              ),
            },
            {
              key: 'placementDate',
              label: 'Дата размещения',
              children: (
                <CopyableValue
                  display={dateStr(purchase.placementDate)}
                  copyText={
                    purchase.placementDate ? String(purchase.placementDate) : ''
                  }
                />
              ),
            },
            {
              key: 'validFrom',
              label: 'Срок действия с',
              children: (
                <CopyableValue
                  display={dateStr(purchase.validFrom)}
                  copyText={
                    purchase.validFrom ? String(purchase.validFrom) : ''
                  }
                />
              ),
            },
            {
              key: 'validTo',
              label: 'Срок действия по',
              children: (
                <CopyableValue
                  display={dateStr(purchase.validTo)}
                  copyText={purchase.validTo ? String(purchase.validTo) : ''}
                />
              ),
            },
            {
              key: 'contractEnd',
              label: 'Исполнение до',
              children: (
                <CopyableValue
                  display={dateStr(purchase.contractEnd)}
                  copyText={
                    purchase.contractEnd ? String(purchase.contractEnd) : ''
                  }
                />
              ),
            },
            {
              key: 'bgFrom',
              label: 'БГ: с',
              children: (
                <CopyableValue
                  display={dateStr((purchase as any).bankGuaranteeValidFrom)}
                  copyText={
                    (purchase as any).bankGuaranteeValidFrom
                      ? String((purchase as any).bankGuaranteeValidFrom)
                      : ''
                  }
                />
              ),
            },
            {
              key: 'bgTo',
              label: 'БГ: по',
              children: (
                <CopyableValue
                  display={dateStr((purchase as any).bankGuaranteeValidTo)}
                  copyText={
                    (purchase as any).bankGuaranteeValidTo
                      ? String((purchase as any).bankGuaranteeValidTo)
                      : ''
                  }
                />
              ),
            },
          ]}
        />
      </Col>

      <Col xs={24} lg={10}>
        <Descriptions
          title="Суммы"
          column={1}
          bordered
          size="middle"
          items={[
            {
              key: 'initialPrice',
              label: 'НМЦ',
              children: (
                <CopyableValue
                  display={money(purchase.initialPrice)}
                  copyText={
                    purchase.initialPrice === undefined
                      ? ''
                      : String(purchase.initialPrice)
                  }
                />
              ),
            },
            {
              key: 'purchaseAmount',
              label: 'Сумма закупки',
              children: (
                <CopyableValue
                  display={money(purchase.purchaseAmount)}
                  copyText={
                    purchase.purchaseAmount === undefined
                      ? ''
                      : String(purchase.purchaseAmount)
                  }
                />
              ),
            },
            {
              key: 'currentContractAmount',
              label: 'Актуальная сумма',
              children: (
                <CopyableValue
                  display={money(purchase.currentContractAmount)}
                  copyText={
                    purchase.currentContractAmount === undefined
                      ? ''
                      : String(purchase.currentContractAmount)
                  }
                />
              ),
            },
            {
              key: 'performanceAmount',
              label: 'Сумма исполнения',
              children: (
                <CopyableValue
                  display={money(purchase.performanceAmount)}
                  copyText={
                    purchase.performanceAmount === undefined
                      ? ''
                      : String(purchase.performanceAmount)
                  }
                />
              ),
            },
            {
              key: 'savings',
              label: 'Экономия',
              children: (
                <CopyableValue
                  display={money(purchase.savings)}
                  copyText={
                    purchase.savings === undefined
                      ? ''
                      : String(purchase.savings)
                  }
                />
              ),
            },
            {
              key: 'remaining',
              label: 'Остаток по договору',
              children: (
                <CopyableValue
                  display={money(remaining)}
                  copyText={String(remaining)}
                />
              ),
            },
            {
              key: 'applicationAmount',
              label: 'Обеспечение заявки',
              children: (
                <CopyableValue
                  display={money(purchase.applicationAmount)}
                  copyText={
                    purchase.applicationAmount === undefined
                      ? ''
                      : String(purchase.applicationAmount)
                  }
                />
              ),
            },
          ]}
        />

        <Divider />

        <Card size="small" title="История статусов">
          <PurchaseStatusTimeline history={history} />
        </Card>
      </Col>
    </Row>
  );
}
