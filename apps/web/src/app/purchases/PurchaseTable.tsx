import React from 'react';
import { Table, Input, Space, Tag, Typography, Select, Button, message } from 'antd';
import type { TableProps, ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { purchasesApi } from '../../shared/api/purchases';
import dayjs from 'dayjs';
import { Purchase } from '../../shared/types/Purchase';

const { Text } = Typography;

function fmtDate(v?: string) {
  if (!v) return '';
  const d = dayjs(v);
  return d.isValid() ? d.format('DD.MM.YYYY') : '';
}

const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 });

type QueryState = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  q?: string;
  completed?: '' | boolean;
  responsible?: string;
};

export function PurchaseTable() {
  const [query, setQuery] = React.useState<QueryState>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    q: '',
    completed: '',
    responsible: '',
  });

  const [search, setSearch] = React.useState(query.q || '');
  const [status, setStatus] = React.useState<string>(query.completed === '' ? '' : String(query.completed));
  const [responsible, setResponsible] = React.useState<string>(query.responsible || '');

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', query],
    queryFn: ({ signal }) =>
      purchasesApi.list(
        {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          q: query.q,
          completed: query.completed === '' ? undefined : (query.completed as boolean),
          responsible: query.responsible || undefined,
        },
        signal
      ),
    keepPreviousData: true,
  });

  const onTableChange: TableProps<Purchase>['onChange'] = (pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setQuery(q => ({
      ...q,
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 20,
      sortBy: s?.field ? String(s.field) : q.sortBy,
      sortOrder: s?.order === 'ascend' ? 'asc' : s?.order === 'descend' ? 'desc' : undefined,
    }));
  };

  const applyFilters = () => {
    setQuery(q => ({
      ...q,
      page: 1,
      q: search.trim() || undefined,
      completed: status === '' ? '' : status === 'true',
      responsible: responsible?.trim() || undefined,
    }));
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setResponsible('');
    setQuery(q => ({
      ...q,
      page: 1,
      q: undefined,
      completed: '',
      responsible: undefined,
    }));
  };

  const handleExport = async () => {
    try {
      const res = await purchasesApi.export({
        q: query.q,
        completed: typeof query.completed === 'boolean' ? query.completed : undefined,
        responsible: query.responsible,
      });
      const url = URL.createObjectURL(res.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename || 'purchases.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      message.error(e?.message || 'Не удалось выполнить экспорт');
    }
  };

  const columns: ColumnsType<Purchase> = [
    { title: 'Вход. №', dataIndex: 'entryNumber', key: 'entryNumber', width: 160, ellipsis: true, sorter: true },
    { title: 'Предмет договора', dataIndex: 'contractSubject', key: 'contractSubject', width: 220, ellipsis: true },
    { title: 'Поставщик', dataIndex: 'supplierName', key: 'supplierName', width: 220, ellipsis: true },
    { title: 'СМП', dataIndex: 'smp', key: 'smp', width: 90, ellipsis: true },
    { title: 'ИНН', dataIndex: 'supplierInn', key: 'supplierInn', width: 140, ellipsis: true },
    { title: 'НМЦ', dataIndex: 'initialPrice', key: 'initialPrice', width: 140, sorter: true, render: v => (v || v === 0 ? rub.format(v) : '') },
    { title: 'Сумма закупки', dataIndex: 'purchaseAmount', key: 'purchaseAmount', width: 160, sorter: true, render: v => (v || v === 0 ? rub.format(v) : '') },
    { title: 'Номер договора', dataIndex: 'contractNumber', key: 'contractNumber', width: 160, ellipsis: true },
    { title: 'Дата заключения', dataIndex: 'contractDate', key: 'contractDate', width: 150, sorter: true, render: fmtDate },
    { title: 'Срок действия с', dataIndex: 'validFrom', key: 'validFrom', width: 140, render: fmtDate },
    { title: 'по', dataIndex: 'validTo', key: 'validTo', width: 140, render: fmtDate },
    { title: 'Исполнение до', dataIndex: 'contractEnd', key: 'contractEnd', width: 150, render: fmtDate },
    { title: 'Дата размещения', dataIndex: 'placementDate', key: 'placementDate', width: 150, sorter: true, render: fmtDate },
    { title: 'Способ закупки', dataIndex: 'methodOfPurchase', key: 'methodOfPurchase', width: 180, ellipsis: true },
    { title: 'Документ (№, дата)', dataIndex: 'documentNumber', key: 'documentNumber', width: 180, ellipsis: true },
    {
      title: 'Состоялась',
      dataIndex: 'completed',
      key: 'completed',
      width: 130,
      sorter: true,
      render: v => (v ? <Tag color="green">Да</Tag> : <Tag>Нет</Tag>),
    },
    { title: 'Экономия', dataIndex: 'savings', key: 'savings', width: 130, render: v => (v || v === 0 ? rub.format(v) : '') },
    { title: 'Сумма исполнения', dataIndex: 'performanceAmount', key: 'performanceAmount', width: 170, render: v => (v || v === 0 ? rub.format(v) : '') },
    { title: 'Форма обеспечения', dataIndex: 'performanceForm', key: 'performanceForm', width: 180, ellipsis: true },
    { title: 'Номер ДС', dataIndex: 'additionalAgreementNumber', key: 'additionalAgreementNumber', width: 140, ellipsis: true },
    { title: 'Актуальная сумма', dataIndex: 'currentContractAmount', key: 'currentContractAmount', width: 170, render: v => (v || v === 0 ? rub.format(v) : '') },
    { title: 'Размещение', dataIndex: 'publication', key: 'publication', width: 180, ellipsis: true },
    { title: 'Ответственный', dataIndex: 'responsible', key: 'responsible', width: 160, ellipsis: true },
    { title: '№ по плану', dataIndex: 'planNumber', key: 'planNumber', width: 140, ellipsis: true },
    { title: 'Обеспечение заявки', dataIndex: 'applicationAmount', key: 'applicationAmount', width: 180, render: v => (v || v === 0 ? rub.format(v) : '') },
    { title: 'Примечания', dataIndex: 'comment', key: 'comment', width: 240, ellipsis: true },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Space wrap>
        <Input.Search
          allowClear
          placeholder="Поиск: поставщик, предмет договора, № договора..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onSearch={applyFilters}
          style={{ width: 420 }}
        />
        <Select
          allowClear
          placeholder="Состоялась"
          value={status === '' ? undefined : status}
          onChange={(v) => setStatus(v ?? '')}
          style={{ width: 160 }}
          options={[
            { label: 'Да', value: 'true' },
            { label: 'Нет', value: 'false' },
          ]}
        />
        <Input
          allowClear
          placeholder="Ответственный"
          value={responsible}
          onChange={(e) => setResponsible(e.target.value)}
          style={{ width: 220 }}
        />
        <Button type="primary" onClick={applyFilters}>Применить</Button>
        <Button onClick={resetFilters}>Сбросить</Button>
        <Button onClick={handleExport}>Экспорт</Button>
      </Space>

      <Table<Purchase>
        rowKey="_id"
        size="small"
        loading={isLoading}
        columns={columns}
        dataSource={data?.items || []}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (t, range) => `${range[0]}–${range[1]} из ${t}`,
        }}
        onChange={onTableChange}
        sticky
        scroll={{ x: 2700, y: 600 }}
      />
      <Text type="secondary">Подсказка: клик по заголовку сортирует по столбцу.</Text>
    </Space>
  );
}
