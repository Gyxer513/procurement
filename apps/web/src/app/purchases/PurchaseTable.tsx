import { useMemo, useState } from 'react';
import { Flex, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CreatePurchaseModal } from '../../features/Purchases/CreatePurchaseModal';
import { EditPurchaseModal } from '../../features/Purchases/EditPurchaseModal';
import { buildPurchaseColumns, PURCHASE_COLUMN_KEYS } from './purchaseColumns';
import { ColumnsVisibility } from './ColumnsVisibility';
import { FiltersBar } from './FiltersBar';
import { PurchasesGrid } from './PurchasesGrid';
import { usePurchases } from './usePurchases';
import type { Purchase } from '../../shared/types/Purchase';

const { Text } = Typography;

export function PurchaseTable() {
  const {
    query,
    setQuery,
    data,
    isLoading,
    applyFilters,
    resetFilters,
    handleExport,
    search,
    setSearch,
    status,
    setStatus,
    responsible,
    setResponsible,
  } = usePurchases();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);

  const openEdit = (rec: Purchase) => {
    setEditing(rec);
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  const allColumns: ColumnsType<Purchase> = useMemo(
    () => buildPurchaseColumns(openEdit),
    []
  );

  const [checkedList, setCheckedList] =
    useState<string[]>(PURCHASE_COLUMN_KEYS);

  const visibleColumns = useMemo(
    () => allColumns.filter((c) => checkedList.includes(String(c.key))),
    [allColumns, checkedList]
  );

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      <FiltersBar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        responsible={responsible}
        setResponsible={setResponsible}
        onApply={applyFilters}
        onReset={resetFilters}
        onExport={handleExport}
        onCreate={() => setCreateOpen(true)}
      />

      <ColumnsVisibility
        options={allColumns.map(({ key, title }) => ({
          label: title as string,
          value: String(key),
        }))}
        checkedList={checkedList}
        onChange={setCheckedList}
      />

      <PurchasesGrid
        loading={isLoading}
        columns={visibleColumns}
        data={data?.items || []}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total: data?.total || 0,
        }}
        onChange={(pagination, _filters, sorter) => {
          const s = Array.isArray(sorter) ? sorter[0] : sorter;
          setQuery((q) => ({
            ...q,
            page: pagination.current || 1,
            pageSize: pagination.pageSize || 20,
            sortBy: s?.field ? String(s.field) : q.sortBy,
            sortOrder:
              s?.order === 'ascend'
                ? 'asc'
                : s?.order === 'descend'
                ? 'desc'
                : undefined,
          }));
        }}
      />

      <CreatePurchaseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EditPurchaseModal
        open={editOpen}
        onClose={closeEdit}
        purchase={editing || undefined}
      />

      <Text type="secondary">
        Подсказка: клик по заголовку сортирует по столбцу.
      </Text>
    </Flex>
  );
}
