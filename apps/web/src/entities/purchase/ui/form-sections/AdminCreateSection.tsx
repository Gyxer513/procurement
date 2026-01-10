import { Form, Input, DatePicker, Select, InputNumber } from 'antd';
import { PURCHASE_SITE_OPTIONS } from '@shared/config/purchaseSites';
import { InitiatorField } from '@features/select-initiator/ui/InitiatorField';

type Props = {
  readOnly: boolean;
  disableEntryDate: boolean;
  disableEntryNumber: boolean;
};

export function AdminCreateSection({
  readOnly,
  disableEntryDate,
  disableEntryNumber,
}: Props) {
  return (
    <>
      <Form.Item
        name="entryNumber"
        label="Номер заявки"
        rules={[{ required: true, message: 'Укажите номер заявки' }]}
      >
        <Input disabled={readOnly || disableEntryNumber} />
      </Form.Item>

      <Form.Item name="entryDate" label="Дата заявки">
        <DatePicker
          style={{ width: '100%' }}
          disabled={readOnly || disableEntryDate}
        />
      </Form.Item>

      <InitiatorField disabled={readOnly} />

      <Form.Item
        name="site"
        label="Площадка"
        rules={[{ required: true, message: 'Выберите площадку' }]}
      >
        <Select options={PURCHASE_SITE_OPTIONS} />
      </Form.Item>

      <Form.Item
        name="contractAmount"
        label="Сумма договора"
        rules={[{ required: true, message: 'Укажите сумму договора' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          precision={2}
          stringMode={false}
          placeholder="Например, 1500000"
        />
      </Form.Item>

      <Form.Item
        name="contractSubject"
        label="Предмет договора"
        rules={[{ required: true, message: 'Укажите предмет договора' }]}
      >
        <Input.TextArea rows={3} disabled={readOnly} />
      </Form.Item>
    </>
  );
}
