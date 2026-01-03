import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Space,
  Button,
  Tag,
  Row,
  Col,
  Divider,
} from 'antd';
import { fmtDate, rub } from '@shared/utils/format';
import { Purchase } from '@shared/types/Purchase';
import { purchasesApi } from '@shared/api/purchases';
import PurchaseStatusTimeline from '../../../widgets/status-timeline/ui/PurchaseStatusTimeline';
import { STATUS_COLORS } from '@shared/enums/statusColors';

const SITE_COLORS: Record<string, string> = {
  Скатертный: 'magenta',
  Ломоносовский: 'purple',
  Вороново: 'green',
};

export const PurchaseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    purchasesApi
      .getById(id)
      .then(setPurchase)
      .finally(() => setLoading(false));
  }, [id]);

  const remaining =
    (purchase as any)?.remainingContractAmount ??
    Math.max(
      0,
      (purchase?.currentContractAmount ?? 0) -
        (purchase?.performanceAmount ?? 0)
    );
  console.log('purchase statusHistory', purchase);
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Space wrap>
        <Button onClick={() => navigate(-1)}>Назад</Button>
        <Button
          type="primary"
          onClick={() => purchase && navigate(`/purchases/${purchase.id}/edit`)}
        >
          Редактировать
        </Button>
      </Space>

      <Card
        loading={loading}
        title={`Закупка${
          purchase?.entryNumber ? ` — ${purchase.entryNumber}` : ''
        }`}
      >
        {purchase && (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={14}>
              <Descriptions
                column={1}
                bordered
                size="middle"
                items={[
                  {
                    key: 'subject',
                    label: 'Предмет договора',
                    children: purchase.contractSubject || '-',
                  },
                  {
                    key: 'status',
                    label: 'Статус',
                    children: (
                      <Space>
                        <Tag
                          color={STATUS_COLORS[purchase.status] ?? 'default'}
                        >
                          {purchase.status || '-'}
                        </Tag>
                        <span style={{ color: '#888' }}>
                          {purchase.lastStatusChangedAt
                            ? `изменен: ${fmtDate(
                                purchase.lastStatusChangedAt as any
                              )}`
                            : ''}
                        </span>
                      </Space>
                    ),
                  },
                  {
                    key: 'site',
                    label: 'Площадка',
                    children: (
                      <Tag color={SITE_COLORS[purchase.site] ?? 'default'}>
                        {purchase.site || '-'}
                      </Tag>
                    ),
                  },
                  {
                    key: 'supplier',
                    label: 'Поставщик',
                    children: purchase.supplierName || '-',
                  },
                  {
                    key: 'inn',
                    label: 'ИНН',
                    children: purchase.supplierInn || '-',
                  },
                  { key: 'smp', label: 'СМП', children: purchase.smp || '-' },
                  {
                    key: 'method',
                    label: 'Способ закупки',
                    children: purchase.methodOfPurchase || '-',
                  },
                  {
                    key: 'doc',
                    label: 'Документ (№, дата)',
                    children: purchase.documentNumber || '-',
                  },
                  {
                    key: 'plan',
                    label: '№ по плану',
                    children: purchase.planNumber || '-',
                  },
                  {
                    key: 'resp',
                    label: 'Ответственный',
                    children: purchase.responsible || '-',
                  },
                  {
                    key: 'publication',
                    label: 'Размещение',
                    children: purchase.publication || '-',
                  },
                  {
                    key: 'comment',
                    label: 'Примечания',
                    children: purchase.comment || '-',
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
                    children: fmtDate(purchase.contractDate as any),
                  },
                  {
                    key: 'placementDate',
                    label: 'Дата размещения',
                    children: fmtDate(purchase.placementDate as any),
                  },
                  {
                    key: 'validFrom',
                    label: 'Срок действия с',
                    children: fmtDate(purchase.validFrom as any),
                  },
                  {
                    key: 'validTo',
                    label: 'Срок действия по',
                    children: fmtDate(purchase.validTo as any),
                  },
                  {
                    key: 'contractEnd',
                    label: 'Исполнение до',
                    children: fmtDate(purchase.contractEnd as any),
                  },
                  {
                    key: 'bgFrom',
                    label: 'БГ: с',
                    children: fmtDate(
                      (purchase as any).bankGuaranteeValidFrom as any
                    ),
                  },
                  {
                    key: 'bgTo',
                    label: 'БГ: по',
                    children: fmtDate(
                      (purchase as any).bankGuaranteeValidTo as any
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
                    children:
                      purchase.initialPrice || purchase.initialPrice === 0
                        ? rub.format(purchase.initialPrice)
                        : '-',
                  },
                  {
                    key: 'purchaseAmount',
                    label: 'Сумма закупки',
                    children:
                      purchase.purchaseAmount || purchase.purchaseAmount === 0
                        ? rub.format(purchase.purchaseAmount)
                        : '-',
                  },
                  {
                    key: 'current',
                    label: 'Актуальная сумма',
                    children:
                      purchase.currentContractAmount ||
                      purchase.currentContractAmount === 0
                        ? rub.format(purchase.currentContractAmount)
                        : '-',
                  },
                  {
                    key: 'performed',
                    label: 'Сумма исполнения',
                    children:
                      purchase.performanceAmount ||
                      purchase.performanceAmount === 0
                        ? rub.format(purchase.performanceAmount)
                        : '-',
                  },
                  {
                    key: 'savings',
                    label: 'Экономия',
                    children:
                      purchase.savings || purchase.savings === 0
                        ? rub.format(purchase.savings)
                        : '-',
                  },
                  {
                    key: 'remaining',
                    label: 'Остаток по договору',
                    children:
                      remaining || remaining === 0
                        ? rub.format(remaining)
                        : '-',
                  },
                  {
                    key: 'appAmount',
                    label: 'Обеспечение заявки',
                    children:
                      purchase.applicationAmount ||
                      purchase.applicationAmount === 0
                        ? rub.format(purchase.applicationAmount)
                        : '-',
                  },
                ]}
              />

              <Divider />

              <Card size="small" title="История статусов">
                <PurchaseStatusTimeline history={purchase._statusHistory} />
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </Space>
  );
};

export default PurchaseDetailsPage;
