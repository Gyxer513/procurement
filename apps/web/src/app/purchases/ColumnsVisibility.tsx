import { Checkbox, Divider } from 'antd';
import type { CheckboxOptionType } from 'antd';

type Props = {
  options: CheckboxOptionType[];
  checkedList: string[];
  onChange: (v: string[]) => void;
};

export function ColumnsVisibility({ options, checkedList, onChange }: Props) {
  return (
    <>
      <Divider>Отображаемые столбцы</Divider>
      <Checkbox.Group
        value={checkedList}
        options={options}
        onChange={(value) => onChange(value as string[])}
      />
    </>
  );
}
