import { Button, Flex, Input, Select } from 'antd';

type Props = {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  responsible: string;
  setResponsible: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
  onExport: () => void;
  onCreate: () => void;
};

export function FiltersBar({
  search,
  setSearch,
  status,
  setStatus,
  responsible,
  setResponsible,
  onApply,
  onReset,
  onExport,
  onCreate,
}: Props) {
  return (
    <Flex wrap="wrap" gap="small" align="center">
      <Input.Search
        allowClear
        placeholder="Поиск: поставщик, предмет договора, № договора..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSearch={onApply}
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
      <Button type="primary" onClick={onApply}>
        Применить
      </Button>
      <Button onClick={onReset}>Сбросить</Button>
      <Button onClick={onExport}>Экспорт</Button>
      <Button type="primary" onClick={onCreate}>
        Создать
      </Button>
    </Flex>
  );
}
