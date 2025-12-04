import React from 'react';
import { Modal, Form, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasesApi } from '../../shared/api/purchases';
import { PurchaseForm, PurchaseFormValues } from './PurchaseForm';

type Props = {
  open: boolean;
  onClose: () => void;
};

function toIso(d?: any) {
  return d && typeof d.toISOString === 'function' ? d.toISOString() : undefined;
}

export function CreatePurchaseModal({ open, onClose }: Props) {
  const [form] = Form.useForm<PurchaseFormValues>();
  const qc = useQueryClient();

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (payload: any) => purchasesApi.create(payload),
    onSuccess: () => {
      message.success('Закупка создана');
// Обновить список; достаточно по префиксу 'Purchases'
      qc.invalidateQueries({ queryKey: ['Purchases'] });
      onClose();
    },
    onError: (e: any) => {
      message.error(e?.message || 'Не удалось создать закупку');
    },
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        contractDate: toIso(values.contractDate),
        validFrom: toIso(values.validFrom),
        validTo: toIso(values.validTo),
        contractEnd: toIso(values.contractEnd),
        placementDate: toIso(values.placementDate),
      };
      await mutateAsync(payload);
      form.resetFields();
    } catch {
// ошибки валидации — ничего
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Создать закупку"
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ loading: isLoading }}
      destroyOnClose
      width={900}
    >
      <PurchaseForm form={form} />
    </Modal>
  );
}
