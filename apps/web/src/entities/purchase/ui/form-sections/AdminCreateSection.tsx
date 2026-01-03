import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { PurchaseSite } from '@shared/enums/purchase-site.enum';

export function AdminCreateSection({ entryDate }: { entryDate?: Dayjs }) {
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Form.Item
          name="entryNumber"
          label="Номер заявки"
          rules={[{ required: true, message: 'Укажите номер заявки' }]}
        >
          <Input />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          name="site"
          label="Площадка"
          rules={[{ required: true, message: 'Укажите площадку' }]}
        >
          <Select
            options={Object.values(PurchaseSite).map((v) => ({
              value: v,
              label: v,
            }))}
            allowClear
          />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          name="contractSubject"
          label="Предмет договора"
          rules={[{ required: true, message: 'Укажите предмет договора' }]}
        >
          <Input />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item name="status" label="Статус">
          <Input disabled />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item name="entryDate" label="Дата создания">
          <DatePicker
            value={entryDate ?? dayjs()}
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
            disabled
          />
        </Form.Item>
      </Col>
    </Row>
  );
}
