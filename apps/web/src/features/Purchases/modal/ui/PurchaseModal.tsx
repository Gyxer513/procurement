import { Modal, Form, message, Button } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasesApi } from '@shared/api/purchases';
import { PurchaseForm } from '../../form/ui/PurchaseForm';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import type { Purchase } from '@shared/types/Purchase';
import type { PurchaseFormValues } from '@features/Purchases/form/types/PurchaseFormValues';

type Props = {
  open: boolean;
  purchase?: Purchase | null;
  onClose: () => void;
};

function toIso(d?: any) {
  return d && typeof d.toISOString === 'function' ? d.toISOString() : undefined;
}
function toDay(v?: string | Date | null) {
  return v ? dayjs(v) : undefined;
}

export function PurchaseModal({ open, purchase, onClose }: Props) {
  const [form] = Form.useForm<PurchaseFormValues>();
  const qc = useQueryClient();
  const isEdit = Boolean(purchase); // флаг: создаём или редактируем

  // Установка начальных значений для редактирования
  useEffect(() => {
    if (!open) return;
    if (!purchase) {
      form.resetFields(); // при создании — чистая форма
    } else {
      form.setFieldsValue({
        entryNumber: purchase.entryNumber,
        contractSubject: purchase.contractSubject,
        supplierName: purchase.supplierName,
        smp: purchase.smp,
        supplierInn: purchase.supplierInn,
        initialPrice: purchase.initialPrice,
        purchaseAmount: purchase.purchaseAmount,
        contractNumber: purchase.contractNumber,
        contractDate: toDay(purchase.contractDate),
        validFrom: toDay(purchase.validFrom),
        validTo: toDay(purchase.validTo),
        contractEnd: toDay(purchase.contractEnd),
        placementDate: toDay(purchase.placementDate),
        methodOfPurchase: purchase.methodOfPurchase,
        documentNumber: purchase.documentNumber,
        completed: purchase.completed,
        savings: purchase.savings,
        performanceAmount: purchase.performanceAmount,
        performanceForm: purchase.performanceForm,
        additionalAgreementNumber: purchase.additionalAgreementNumber,
        currentContractAmount: purchase.currentContractAmount,
        publication: purchase.publication,
        responsible: purchase.responsible,
        planNumber: purchase.planNumber,
        applicationAmount: purchase.applicationAmount,
        comment: purchase.comment,
      });
    }
    // eslint-disable-next-line
  }, [open, purchase]);

  // Мутация
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      if (isEdit) {
        return purchasesApi.update((purchase as Purchase).id, payload);
      } else {
        return purchasesApi.create(payload);
      }
    },
    onSuccess: () => {
      message.success(isEdit ? 'Изменения сохранены' : 'Закупка создана');
      qc.invalidateQueries({ queryKey: ['Purchases'] });
      onClose();
    },
    onError: (e: any) => {
      message.error(
        e?.message ||
          (isEdit
            ? 'Не удалось сохранить изменения'
            : 'Не удалось создать закупку')
      );
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
      // ошибки валидации полей — ничего
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Редактировать закупку' : 'Создать закупку'}
      onCancel={handleCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isPending}>
          Отмена
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk} loading={isPending}>
          {isEdit ? 'Сохранить' : 'Создать'}
        </Button>,
      ]}
    >
      <PurchaseForm form={form} isCreate={!isEdit} />
    </Modal>
  );
}
