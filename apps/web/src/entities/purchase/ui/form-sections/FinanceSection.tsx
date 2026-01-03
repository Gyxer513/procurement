import { useEffect } from 'react';
import { Col, Form, InputNumber, Row } from 'antd';

export function FinanceSection({
  form,
  readOnly,
}: {
  form: any;
  readOnly: boolean;
}) {
  const current = Form.useWatch('currentContractAmount', form);
  const performed = Form.useWatch('performanceAmount', form);

  useEffect(() => {
    const cur = typeof current === 'number' ? current : Number(current) || 0;
    const perf =
      typeof performed === 'number' ? performed : Number(performed) || 0;
    form.setFieldsValue({ remainingContractAmount: Math.max(0, cur - perf) });
  }, [current, performed, form]);

  return (
    <Row gutter={16}>
      <Col span={4}>
        <Form.Item name="initialPrice" label="НМЦ">
          <InputNumber
            disabled={readOnly}
            min={0}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="purchaseAmount" label="Сумма закупки">
          <InputNumber
            disabled={readOnly}
            min={0}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="savings" label="Экономия">
          <InputNumber
            disabled={readOnly}
            min={0}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="performanceAmount" label="Сумма исполнения">
          <InputNumber
            disabled={readOnly}
            min={0}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="currentContractAmount" label="Актуальная сумма">
          <InputNumber
            disabled={readOnly}
            min={0}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item
          name="remainingContractAmount"
          label="Остаток по договору"
          tooltip="Автоподсчет: Актуальная сумма − Сумма исполнения"
        >
          <InputNumber disabled min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>
      </Col>
    </Row>
  );
}
