import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { Purchase } from '@shared/types/Purchase';

type Props = {
  loading: boolean;
  columns: ColumnsType<Purchase>;
  data: Purchase[];
  onRow?: TableProps<Purchase>['onRow'];
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
  onRow,
}: Props) {
  return (
    <Table<Purchase>
      rowKey="id"
      size="small"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (t, range) => `${range[0]}–${range[1]} из ${t}`,
      }}
      onChange={onChange}
      sticky
      scroll={{ x: 2700 }}
      onRow={onRow}
    />
  );
}
