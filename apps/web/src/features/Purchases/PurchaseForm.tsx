import React from 'react'; import { Form, Input, InputNumber, DatePicker, Switch, Row, Col } from 'antd'; import dayjs, { Dayjs } from 'dayjs';
export type PurchaseFormValues = {
  entryNumber?: string;
  contractSubject?: string;
  supplierName?: string;
  smp?: string;
  supplierInn?: string;
  initialPrice?: number;
  purchaseAmount?: number;
  contractNumber?: string;
  contractDate?: Dayjs;
  validFrom?: Dayjs;
  validTo?: Dayjs;
  contractEnd?: Dayjs;
  placementDate?: Dayjs;
  methodOfPurchase?: string;
  documentNumber?: string;
  completed?: boolean;
  savings?: number;
  performanceAmount?: number;
  performanceForm?: string;
  additionalAgreementNumber?: string;
  currentContractAmount?: number;
  publication?: string;
  responsible?: string;
  planNumber?: string;
  applicationAmount?: number;
  comment?: string;
};

type Props = {
  form: any;
  initialValues?: Partial<PurchaseFormValues>;
};

export function PurchaseForm({ form, initialValues }: Props) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        completed: false,
        ...initialValues,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="entryNumber" label="Вход. №">
            <Input />
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

        <Col span={12}>
          <Form.Item
            name="supplierName"
            label="Поставщик"
            rules={[{ required: true, message: 'Укажите поставщика' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="smp" label="СМП">
            <Input placeholder="Да/Нет или значение" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="supplierInn" label="ИНН">
            <Input />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="initialPrice" label="НМЦ">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="purchaseAmount" label="Сумма закупки">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="contractNumber" label="Номер договора">
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="contractDate" label="Дата заключения">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="placementDate" label="Дата размещения">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="validFrom" label="Срок действия с">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="validTo" label="по">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="contractEnd" label="Исполнение до">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="methodOfPurchase" label="Способ закупки">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="documentNumber" label="Документ (№, дата)">
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="completed" label="Состоялась" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="savings" label="Экономия">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="performanceAmount" label="Сумма исполнения">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="performanceForm" label="Форма обеспечения">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="additionalAgreementNumber" label="Номер ДС">
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="currentContractAmount" label="Актуальная сумма">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="applicationAmount" label="Обеспечение заявки">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="planNumber" label="№ по плану">
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="publication" label="Размещение">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="responsible" label="Ответственный">
            <Input />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item name="comment" label="Примечания">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
