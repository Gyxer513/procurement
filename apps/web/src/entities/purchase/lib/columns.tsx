import { Button, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Purchase } from '../../../shared/types/Purchase';
import { fmtDate, rub } from '../../../shared/utils/format';

const STATUS_COLORS: Record<string, string> = {
  'в работе': 'blue',
  'на рассмотрении': 'gold',
  'получено отделом закупок': 'geekblue',
  'на доработку': 'orange',
  отказано: 'red',
  аннулировано: 'default',
};

const SITE_COLORS: Record<string, string> = {
  Скатертный: 'magenta',
  Ломоносовский: 'purple',
  Вороново: 'green',
};

export function buildPurchaseColumns(
  onEdit: (p: Purchase) => void,
  onOpen: (p: Purchase) => void
): ColumnsType<Purchase> {
  return [
    {
      title: 'Вход. №',
      dataIndex: 'entryNumber',
      key: 'entryNumber',
      width: 160,
      ellipsis: true,
      sorter: true,
    },

    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      sorter: true,
      render: (v: string, record) => {
        const color = STATUS_COLORS[v] ?? 'default';
        const dateText = fmtDate(record.lastStatusChangedAt as any);
        return (
          <Tooltip title={dateText ? `Изменен: ${dateText}` : undefined}>
            <Tag color={color}>{v || '-'}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Дата изм. статуса',
      dataIndex: 'lastStatusChangedAt',
      key: 'lastStatusChangedAt',
      width: 160,
      sorter: true,
      render: fmtDate,
    },
    {
      title: 'Площадка',
      dataIndex: 'site',
      key: 'site',
      width: 150,
      sorter: true,
      render: (v: string) => (
        <Tag color={SITE_COLORS[v] ?? 'default'}>{v || '-'}</Tag>
      ),
    },

    {
      title: 'Предмет договора',
      dataIndex: 'contractSubject',
      key: 'contractSubject',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Поставщик',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 220,
      ellipsis: true,
    },
    { title: 'СМП', dataIndex: 'smp', key: 'smp', width: 90, ellipsis: true },
    {
      title: 'ИНН',
      dataIndex: 'supplierInn',
      key: 'supplierInn',
      width: 140,
      ellipsis: true,
    },

    {
      title: 'НМЦ',
      dataIndex: 'initialPrice',
      key: 'initialPrice',
      width: 140,
      sorter: true,
      render: (v) => (v || v === 0 ? rub.format(v) : ''),
    },
    {
      title: 'Сумма закупки',
      dataIndex: 'purchaseAmount',
      key: 'purchaseAmount',
      width: 160,
      sorter: true,
      render: (v) => (v || v === 0 ? rub.format(v) : ''),
    },

    {
      title: 'Номер договора',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      width: 160,
      ellipsis: true,
    },
    {
      title: 'Дата заключения',
      dataIndex: 'contractDate',
      key: 'contractDate',
      width: 150,
      sorter: true,
      render: fmtDate,
    },
    {
      title: 'Срок действия с',
      dataIndex: 'validFrom',
      key: 'validFrom',
      width: 140,
      render: fmtDate,
    },
    {
      title: 'по',
      dataIndex: 'validTo',
      key: 'validTo',
      width: 140,
      render: fmtDate,
    },
    {
      title: 'Исполнение до',
      dataIndex: 'contractEnd',
      key: 'contractEnd',
      width: 150,
      render: fmtDate,
    },
    {
      title: 'Дата размещения',
      dataIndex: 'placementDate',
      key: 'placementDate',
      width: 150,
      sorter: true,
      render: fmtDate,
    },

    {
      title: 'Способ закупки',
      dataIndex: 'methodOfPurchase',
      key: 'methodOfPurchase',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Документ (№, дата)',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      width: 180,
      ellipsis: true,
    },

    {
      title: 'Состоялась',
      dataIndex: 'completed',
      key: 'completed',
      width: 130,
      sorter: true,
      render: (v) => (v ? <Tag color="green">Да</Tag> : <Tag>Нет</Tag>),
    },
    {
      title: 'Экономия',
      dataIndex: 'savings',
      key: 'savings',
      width: 130,
      render: (v) => (v || v === 0 ? rub.format(v) : ''),
    },
    {
      title: 'Сумма исполнения',
      dataIndex: 'performanceAmount',
      key: 'performanceAmount',
      width: 170,
      render: (v) => (v || v === 0 ? rub.format(v) : ''),
    },
    {
      title: 'Форма обеспечения',
      dataIndex: 'performanceForm',
      key: 'performanceForm',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Номер ДС',
      dataIndex: 'additionalAgreementNumber',
      key: 'additionalAgreementNumber',
      width: 140,
      ellipsis: true,
    },

    {
      title: 'Актуальная сумма',
      dataIndex: 'currentContractAmount',
      key: 'currentContractAmount',
      width: 170,
      render: (v) => (v || v === 0 ? rub.format(v) : ''),
    },
    {
      title: 'Остаток по договору',
      dataIndex: 'remainingContractAmount',
      key: 'remainingContractAmount',
      width: 170,
      render: (_: any, record) => {
        const value =
          (record as any).remainingContractAmount ??
          Math.max(
            0,
            (record.currentContractAmount ?? 0) -
              (record.performanceAmount ?? 0)
          );
        return value || value === 0 ? rub.format(value) : '';
      },
    },

    {
      title: 'БГ: с',
      dataIndex: 'bankGuaranteeValidFrom',
      key: 'bankGuaranteeValidFrom',
      width: 140,
      sorter: true,
      render: fmtDate,
    },
    {
      title: 'БГ: по',
      dataIndex: 'bankGuaranteeValidTo',
      key: 'bankGuaranteeValidTo',
      width: 140,
      sorter: true,
      render: fmtDate,
    },

    {
      title: 'Размещение',
      dataIndex: 'publication',
      key: 'publication',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Ответственный',
      dataIndex: 'responsible',
      key: 'responsible',
      width: 160,
      ellipsis: true,
    },
    {
      title: '№ по плану',
      dataIndex: 'planNumber',
      key: 'planNumber',
      width: 140,
      ellipsis: true,
    },
    {
      title: 'Обеспечение заявки',
      dataIndex: 'applicationAmount',
      key: 'applicationAmount',
      width: 180,
      render: (v) => (v || v === 0 ? rub.format(v) : ''),
    },
    {
      title: 'Примечания',
      dataIndex: 'comment',
      key: 'comment',
      width: 240,
      ellipsis: true,
    },

    {
      title: 'Действия',
      key: 'actions',
      width: 160,
      fixed: 'right' as const,
      render: (_: any, record: Purchase) => (
        <>
          <Button type="link" onClick={() => onOpen(record)}>
            Открыть
          </Button>
          <Button type="link" onClick={() => onEdit(record)}>
            Изменить
          </Button>
        </>
      ),
    },
  ];
}
