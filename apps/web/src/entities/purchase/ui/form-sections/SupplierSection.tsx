import { Col, Form, Input, Row, Switch } from 'antd';

export function SupplierSection({ readOnly }: { readOnly: boolean }) {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item
          name="contractSubject"
          label="Предмет договора"
          rules={[{ required: !readOnly, message: 'Укажите предмет договора' }]}
        >
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          name="supplierName"
          label="Поставщик"
          rules={[{ required: !readOnly, message: 'Укажите поставщика' }]}
        >
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="smp" label="СМП" valuePropName="checked">
          <Switch disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="supplierInn" label="ИНН">
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>
    </Row>
  );
}
