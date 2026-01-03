import { Button, Flex, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { ReactNode } from 'react';

type Props = {
  search: string;
  setSearch: (v: string) => void;
  completed: string;
  setCompleted: (v: string) => void;
  responsible: string;
  setResponsible: (v: string) => void;
  dateRange: [string | null, string | null]; // ISO строки (или dayjs, если предпочитаете)
  setDateRange: (v: [string | null, string | null]) => void;
  onApply: () => void;
  onReset: () => void;
  onExport: () => void;
  onCreate: () => void;
  children?: ReactNode;
};

export function FiltersBar({
  search,
  setSearch,
  completed,
  setCompleted,
  responsible,
  setResponsible,
  dateRange,
  setDateRange,
  onApply,
  onReset,
  onExport,
  onCreate,
  children,
}: Props) {
  return (
    <Flex wrap="wrap" gap="small" align="center">
      <Input.Search
        allowClear
        placeholder="Поиск: поставщик, предмет договора, № договора..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSearch={onApply}
        style={{ width: 320 }}
      />
      <DatePicker.RangePicker
        value={[
          dateRange[0] ? dayjs(dateRange[0]) : null,
          dateRange[1] ? dayjs(dateRange[1]) : null,
        ]}
        onChange={(range) => {
          setDateRange([
            range && range[0] ? range[0].toISOString() : null,
            range && range[1] ? range[1].toISOString() : null,
          ]);
        }}
        format="DD.MM.YYYY"
        style={{ width: 270 }}
        allowClear
        placeholder={['Период с', 'по']}
      />
      <Select
        allowClear
        placeholder="Состоялась"
        value={completed === '' ? undefined : completed}
        onChange={(v) => setCompleted(v ?? '')}
        style={{ width: 120 }}
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
        style={{ width: 180 }}
      />
      {/* Кнопки справа */}
      <Button type="primary" onClick={onApply}>
        Применить
      </Button>
      <Button onClick={onReset}>Сбросить</Button>
      <Button onClick={onExport}>Экспорт</Button>
      <Button type="primary" onClick={onCreate}>
        Создать
      </Button>
      {children}
    </Flex>
  );
}
