import { Button, Checkbox, CheckboxOptionType, Drawer, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useVisibleColumns } from '@widgets/columns-visibility/hooks/useVisibleColumns';

type Props = {
  options: CheckboxOptionType[];
  onChange: (v: string[]) => void;
  storageKey?: string;
};

export function ColumnsVisibility({
  options,
  onChange,
  storageKey = 'purchases.visibleColumns',
}: Props) {
  const [open, setOpen] = useState(false);
  const { checkedList, setCheckedList, allValues } = useVisibleColumns(
    options,
    storageKey
  );

  useEffect(() => {
    if (!options.length) return;
    onChange(checkedList);
  }, [checkedList, onChange, options.length]);

  return (
    <>
      <Button
        icon={<SettingOutlined />}
        shape="circle"
        size="small"
        style={{ marginLeft: 4 }}
        onClick={() => setOpen(true)}
        title="Выбрать столбцы"
      />
      <Drawer
        title="Отображаемые столбцы"
        open={open}
        onClose={() => setOpen(false)}
        width={360}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Checkbox.Group
            value={checkedList}
            options={options}
            onChange={(value) => setCheckedList(value as string[])}
          />
          <Space>
            <Button size="small" onClick={() => setCheckedList(allValues)}>
              Показать все
            </Button>
          </Space>
        </Space>
      </Drawer>
    </>
  );
}
