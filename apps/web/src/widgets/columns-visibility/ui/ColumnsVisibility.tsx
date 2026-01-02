import { Button, Checkbox, Drawer, Space } from 'antd';
import type { CheckboxOptionType } from 'antd';
import { useEffect, useState } from 'react';
import { useVisibleColumns } from '../hooks/useVisibleColumns';

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

  // Сообщаем родителю актуальный список (включая загрузку из localStorage)
  useEffect(() => {
    if (!options.length) return;
    onChange(checkedList);
  }, [checkedList, onChange, options.length]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Столбцы</Button>

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
