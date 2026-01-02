import { useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Switch, Row, Col, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { PurchaseFormValues } from '../types/PurchaseFormValues';
import { PurchaseStatus } from '@shared/enums/purchase-status.enum';
import { PurchaseSite } from '@shared/enums/purchase-site.enum';

type Props = {
  form: any;
  initialValues?: Partial<{
    // можно передавать прямо Purchase с бэка:
    entryNumber?: string;
    entryDate?: Date | string;
    status?: PurchaseStatus;
    site?: PurchaseSite;
    lastStatusChangedAt?: Date | string;

    contractSubject?: string;
    supplierName?: string;
    smp?: boolean;
    supplierInn?: string;
    purchaseAmount?: number;
    initialPrice?: number;
    contractNumber?: string;
    contractDate?: Date | string;
    validFrom?: Date | string;
    validTo?: Date | string;
    contractEnd?: Date | string;
    placementDate?: Date | string;
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
    bankGuaranteeValidFrom?: Date | string;
    bankGuaranteeValidTo?: Date | string;
  }>;

  /** true = создание новой записи (номер/дата будут присвоены системой) */
  isCreate?: boolean;
};

const toDayjs = (v?: Date | string) => (v ? dayjs(v) : undefined);

export function PurchaseForm({ form, initialValues, isCreate = false }: Props) {
  // пересчитать "остаток" (только отображаем)
  const current = Form.useWatch('currentContractAmount', form);
  const performed = Form.useWatch('performanceAmount', form);

  useEffect(() => {
    const cur = typeof current === 'number' ? current : Number(current) || 0;
    const perf = typeof performed === 'number' ? performed : Number(performed) || 0;
    form.setFieldsValue({ remainingContractAmount: Math.max(0, cur - perf) });
  }, [current, performed, form]);

  // важно: initialValues через setFieldsValue (а не initialValues у Form), чтобы работало при редактировании
  useEffect(() => {
    if (!initialValues) return;

    const mapped: PurchaseFormValues = {
      ...initialValues,
      entryDate: toDayjs(initialValues.entryDate),
      contractDate: toDayjs(initialValues.contractDate),
      validFrom: toDayjs(initialValues.validFrom),
      validTo: toDayjs(initialValues.validTo),
      contractEnd: toDayjs(initialValues.contractEnd),
      placementDate: toDayjs(initialValues.placementDate),
      bankGuaranteeValidFrom: toDayjs(initialValues.bankGuaranteeValidFrom),
      bankGuaranteeValidTo: toDayjs(initialValues.bankGuaranteeValidTo),
      lastStatusChangedAt: toDayjs(initialValues.lastStatusChangedAt),
    };

    form.setFieldsValue({
      completed: false,
      smp: false,
      ...mapped,
    });
  }, [initialValues, form]);

  return (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="status" label="Статус">
            <Select
              options={Object.values(PurchaseStatus).map((v) => ({ value: v, label: v }))}
              allowClear
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="site" label="Площадка">
            <Select
              options={Object.values(PurchaseSite).map((v) => ({ value: v, label: v }))}
              allowClear
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item name="entryNumber" label="Вход. №">
            <Input disabled={isCreate} placeholder={isCreate ? 'Присвоит система' : ''} />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item name="entryDate" label="Дата вход.">
            <DatePicker
              format="DD.MM.YYYY"
              style={{ width: '100%' }}
              disabled={isCreate}
              placeholder={isCreate ? 'Присвоит система' : undefined}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="lastStatusChangedAt" label="Дата изм. статуса">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} disabled />
          </Form.Item>
        </Col>

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

        <Col span={4}>
          <Form.Item name="smp" label="СМП" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item name="supplierInn" label="ИНН">
            <Input />
          </Form.Item>
        </Col>

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

        <Col span={4}>
          <Form.Item name="completed" label="Состоялась" valuePropName="checked">
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
            <InputNumber disabled min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

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

        <Col span={24}>
          <Form.Item name="comment" label="Примечания">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
