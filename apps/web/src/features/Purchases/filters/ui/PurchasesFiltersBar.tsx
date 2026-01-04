import { Button, Flex, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { ReactNode, useMemo } from 'react';

type Props = {
  search: string;
  setSearch: (v: string) => void;

  completed: '' | 'true' | 'false';
  setCompleted: (v: '' | 'true' | 'false') => void;

  responsible: string;
  setResponsible: (v: string) => void;

  year: number | null;
  setYear: (v: number | null) => void;

  dateRange: [string | null, string | null]; // YYYY-MM-DD
  setDateRange: (v: [string | null, string | null]) => void;

  onApply: () => void;
  onReset: () => void;
  onExport: () => void;
  onCreate: () => void;
  children?: ReactNode;
};

export function PurchasesFiltersBar(props: Props) {
  const {
    search,
    setSearch,
    completed,
    setCompleted,
    responsible,
    setResponsible,
    year,
    setYear,
    dateRange,
    setDateRange,
    onApply,
    onReset,
    onExport,
    onCreate,
    children,
  } = props;

  const yearOptions = useMemo(() => {
    const start = 2025;
    const current = dayjs().year();
    const end = Math.max(current, start);
    return Array.from({ length: end - start + 1 }, (_, i) => {
      const y = start + i;
      return { label: String(y), value: y };
    });
  }, []);

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

      <Select
        allowClear
        placeholder="Год"
        value={year ?? undefined}
        onChange={(v) => {
          const y = v ?? null;
          setYear(y);
          if (y) setDateRange([`${y}-01-01`, `${y}-12-31`]);
        }}
        style={{ width: 110 }}
        options={yearOptions}
      />

      <DatePicker.RangePicker
        value={[
          dateRange[0] ? dayjs(dateRange[0], 'YYYY-MM-DD') : null,
          dateRange[1] ? dayjs(dateRange[1], 'YYYY-MM-DD') : null,
        ]}
        onChange={(range) => {
          setYear(null);
          setDateRange([
            range?.[0] ? range[0].format('YYYY-MM-DD') : null,
            range?.[1] ? range[1].format('YYYY-MM-DD') : null,
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
        onChange={(v) => setCompleted((v ?? '') as any)}
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
