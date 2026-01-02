import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { Purchase } from '@shared/types/Purchase';

type Props = {
  loading: boolean;
  columns: ColumnsType<Purchase>;
  data: Purchase[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onChange: TableProps<Purchase>['onChange'];
};

export function PurchasesGrid({
  loading,
  columns,
  data,
  pagination,
  onChange,
}: Props) {
  return (
    <Table<Purchase>
      rowKey="id"
      size="small"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (t, range) => `${range[0]}–${range[1]} из ${t}`,
      }}
      onChange={onChange}
      sticky
      scroll={{ x: 2700 }}
    />
  );
}
