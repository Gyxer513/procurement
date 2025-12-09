import { useMemo, useState } from 'react';
import { Flex, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CreatePurchaseModal } from '../../../features/Purchases/create/ui/CreatePurchaseModal';
import { EditPurchaseModal } from '../../../features/Purchases/edit/ui/EditPurchaseModal';
import { buildPurchaseColumns } from '@entities/purchase/lib/columns';
import { ColumnsVisibility } from '../../../widgets/columns-visibility/ui/ColumnsVisibility';
import { FiltersBar } from '../../../widgets/purchase-filters/ui/FiltersBar';
import { PurchasesGrid } from '../../../widgets/purchases-table/ui/PurchasesGrid';
import { hooks } from '../../../entities/purchase/model/hooks';
import type { Purchase } from '../../../shared/types/Purchase';
import { PURCHASE_COLUMN_KEYS } from '../../../shared/utils/Constants';
import { useNavigate } from 'react-router-dom';
const { Text } = Typography;

export function PurchasePage() {
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
    completed,
    setCompleted,
    responsible,
    setResponsible,
  } = hooks();
  const navigate = useNavigate();
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
  const openView = (rec: Purchase) => navigate(`/purchases/${rec._id}`);
  const allColumns: ColumnsType<Purchase> = useMemo(
    () => buildPurchaseColumns(openEdit, openView),
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
        completed={completed}
        setCompleted={setCompleted}
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
