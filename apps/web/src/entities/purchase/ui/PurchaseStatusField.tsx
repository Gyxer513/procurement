import { Select, Tag, Form, Spin, message } from 'antd';
import { useState } from 'react';
import { STATUS_COLORS } from '@shared/enums/statusColors';

type Props = {
  status?: string;
  availableStatuses: string[];
  onChangeStatus: (newStatus: string) => Promise<any>;
  disabled?: boolean;
};

export function PurchaseStatusField({
  status,
  availableStatuses,
  onChangeStatus,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    if (!onChangeStatus || newStatus === status) return;
    setLoading(true);
    try {
      await onChangeStatus(newStatus);
      message.success('Статус изменён');
    } catch (e: any) {
      message.error(e?.message || 'Не удалось изменить статус');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form.Item label="Статус" colon={false}>
      <Spin spinning={loading}>
        <Select
          value={status}
          style={{ minWidth: 200 }}
          options={availableStatuses.map((st) => ({
            value: st,
            label: <Tag color={STATUS_COLORS[st] ?? 'default'}>{st}</Tag>,
          }))}
          onChange={handleChange}
          disabled={disabled || loading}
        />
      </Spin>
    </Form.Item>
  );
}
