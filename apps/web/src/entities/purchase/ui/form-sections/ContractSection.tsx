import { Col, DatePicker, Form, Input, Row } from 'antd';

export function ContractSection({ readOnly }: { readOnly: boolean }) {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item name="contractNumber" label="Номер договора">
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="contractDate" label="Дата заключения">
          <DatePicker
            disabled={readOnly}
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="placementDate" label="Дата размещения">
          <DatePicker
            disabled={readOnly}
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="validFrom" label="Срок действия с">
          <DatePicker
            disabled={readOnly}
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="validTo" label="Срок действия по">
          <DatePicker
            disabled={readOnly}
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="contractEnd" label="Исполнение до">
          <DatePicker
            disabled={readOnly}
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item name="methodOfPurchase" label="Способ закупки">
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item name="documentNumber" label="Документ (№, дата)">
          <Input disabled={readOnly} />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="bankGuaranteeValidFrom" label="БГ: с">
          <DatePicker
            disabled={readOnly}
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="bankGuaranteeValidTo" label="БГ: по">
          <DatePicker
            disabled={readOnly}
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>
    </Row>
  );
}
