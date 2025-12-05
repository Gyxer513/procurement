import React, { useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Switch, Row, Col } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

export type PurchaseFormValues = {
  // основные
  entryNumber?: string;
  status?: string;
  site?: string;
  lastStatusChangedAt?: Dayjs;
  contractSubject?: string;
  supplierName?: string;
  smp?: boolean;
  supplierInn?: string;

  // суммы/номера
  initialPrice?: number;
  purchaseAmount?: number;
  contractNumber?: string;

  // даты договора
  contractDate?: Dayjs;
  validFrom?: Dayjs;
  validTo?: Dayjs;
  contractEnd?: Dayjs;
  placementDate?: Dayjs;

  // прочее
  methodOfPurchase?: string;
  documentNumber?: string;
  completed?: boolean;
  savings?: number;
  performanceAmount?: number;
  performanceForm?: string;
  additionalAgreementNumber?: string;
  currentContractAmount?: number;
  remainingContractAmount?: number; // добавлено (автоподсчёт)
  publication?: string;
  responsible?: string;
  planNumber?: string;
  applicationAmount?: number;
  comment?: string;

  // банковская гарантия
  bankGuaranteeValidFrom?: Dayjs; // добавлено
  bankGuaranteeValidTo?: Dayjs; // добавлено
};

type Props = {
  form: any;
  initialValues?: Partial<PurchaseFormValues>;
};

export function PurchaseForm({ form, initialValues }: Props) {
  // авто-подсчёт остатка по договору
  const current = Form.useWatch('currentContractAmount', form);
  const performed = Form.useWatch('performanceAmount', form);

  useEffect(() => {
    const cur = typeof current === 'number' ? current : Number(current) || 0;
    const perf =
      typeof performed === 'number' ? performed : Number(performed) || 0;
    const remaining = Math.max(0, cur - perf);
    form.setFieldsValue({ remainingContractAmount: remaining });
  }, [current, performed, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        completed: false,
        smp: false,
        ...initialValues,
        // Если initialValues приходят строками дат — можно раскомментировать и нормализовать:
        // contractDate: initialValues?.contractDate ? dayjs(initialValues.contractDate) : undefined,
        // validFrom: initialValues?.validFrom ? dayjs(initialValues.validFrom) : undefined,
        // validTo: initialValues?.validTo ? dayjs(initialValues.validTo) : undefined,
        // contractEnd: initialValues?.contractEnd ? dayjs(initialValues.contractEnd) : undefined,
        // placementDate: initialValues?.placementDate ? dayjs(initialValues.placementDate) : undefined,
        // bankGuaranteeValidFrom: initialValues?.bankGuaranteeValidFrom ? dayjs(initialValues.bankGuaranteeValidFrom) : undefined,
        // bankGuaranteeValidTo: initialValues?.bankGuaranteeValidTo ? dayjs(initialValues.bankGuaranteeValidTo) : undefined,
        // lastStatusChangedAt: initialValues?.lastStatusChangedAt ? dayjs(initialValues.lastStatusChangedAt) : undefined,
      }}
    >
      <Row gutter={16}>
        {/* Статус / Площадка / Вход. № */}
        <Col span={8}>
          <Form.Item name="status" label="Статус">
            <Input placeholder="Напр.: В работе, Завершена и т.п." />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="site" label="Площадка">
            <Input placeholder="Напр.: ЕИС, РТС, Сбер и т.п." />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="entryNumber" label="Вход. №">
            <Input />
          </Form.Item>
        </Col>

        {/* Дата изменения статуса (read-only) */}
        <Col span={8}>
          <Form.Item name="lastStatusChangedAt" label="Дата изм. статуса">
            <DatePicker
              format="DD.MM.YYYY"
              style={{ width: '100%' }}
              disabled
            />
          </Form.Item>
        </Col>

        {/* Предмет / Поставщик */}
        <Col span={8}>
          <Form.Item
            name="contractSubject"
            label="Предмет договора"
            rules={[{ required: true, message: 'Укажите предмет договора' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="supplierName"
            label="Поставщик"
            rules={[{ required: true, message: 'Укажите поставщика' }]}
          >
            <Input />
          </Form.Item>
        </Col>

        {/* СМП / ИНН */}
        <Col span={8}>
          <Form.Item name="smp" label="СМП" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="supplierInn" label="ИНН">
            <Input />
          </Form.Item>
        </Col>

        {/* Деньги: НМЦ / Сумма закупки */}
        <Col span={4}>
          <Form.Item name="initialPrice" label="НМЦ">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="purchaseAmount" label="Сумма закупки">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        {/* Договор: номер/даты */}
        <Col span={8}>
          <Form.Item name="contractNumber" label="Номер договора">
            <Input />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="contractDate" label="Дата заключения">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="placementDate" label="Дата размещения">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        {/* Срок действия / Исполнение */}
        <Col span={4}>
          <Form.Item name="validFrom" label="Срок действия с">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="validTo" label="Срок действия по">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="contractEnd" label="Исполнение до">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        {/* БГ: с/по */}
        <Col span={4}>
          <Form.Item name="bankGuaranteeValidFrom" label="БГ: с">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="bankGuaranteeValidTo" label="БГ: по">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        {/* Способ / Документ */}
        <Col span={8}>
          <Form.Item name="methodOfPurchase" label="Способ закупки">
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="documentNumber" label="Документ (№, дата)">
            <Input />
          </Form.Item>
        </Col>

        {/* Итоги/исполнение/статус */}
        <Col span={4}>
          <Form.Item
            name="completed"
            label="Состоялась"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="savings" label="Экономия">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="performanceAmount" label="Сумма исполнения">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="performanceForm" label="Форма обеспечения">
            <Input />
          </Form.Item>
        </Col>

        {/* ДС / суммы по договору */}
        <Col span={8}>
          <Form.Item name="additionalAgreementNumber" label="Номер ДС">
            <Input />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="currentContractAmount" label="Актуальная сумма">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            name="remainingContractAmount"
            label="Остаток по договору"
            tooltip="Автоподсчет: Актуальная сумма − Сумма исполнения"
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        {/* План/обеспечение заявки */}
        <Col span={4}>
          <Form.Item name="applicationAmount" label="Обеспечение заявки">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="planNumber" label="№ по плану">
            <Input />
          </Form.Item>
        </Col>

        {/* Размещение/ответственный */}
        <Col span={8}>
          <Form.Item name="publication" label="Размещение">
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="responsible" label="Ответственный">
            <Input />
          </Form.Item>
        </Col>

        {/* Примечания */}
        <Col span={24}>
          <Form.Item name="comment" label="Примечания">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
