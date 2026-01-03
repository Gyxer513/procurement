import { Col, Form, Input, InputNumber, Row, Switch } from 'antd';

export function OtherSection({ readOnly }: { readOnly: boolean }) {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item name="performanceForm" label="Форма обеспечения">
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item name="additionalAgreementNumber" label="Номер ДС">
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="completed" label="Состоялась" valuePropName="checked">
          <Switch disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="applicationAmount" label="Обеспечение заявки">
          <InputNumber
            disabled={readOnly}
            min={0}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="planNumber" label="№ по плану">
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item name="publication" label="Размещение">
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item name="responsible" label="Ответственный">
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item name="comment" label="Примечания">
          <Input.TextArea disabled={readOnly} rows={3} />
        </Form.Item>
      </Col>
    </Row>
  );
}
