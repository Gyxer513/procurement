import React from 'react';
import { Modal, Form, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasesApi } from '../../shared/api/purchases';
import { PurchaseForm, PurchaseFormValues } from './PurchaseForm';
import dayjs from 'dayjs';
import { Purchase } from '../../shared/types/Purchase';
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

export function EditPurchaseModal({ open, purchase, onClose }: Props) {
  const [form] = Form.useForm<PurchaseFormValues>();
  const qc = useQueryClient();

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (payload: any) => purchasesApi.update(purchase!._id, payload),
    onSuccess: () => {
      message.success('Изменения сохранены');
      qc.invalidateQueries({ queryKey: ['Purchases'] });
      onClose();
    },
    onError: (e: any) => {
      message.error(e?.message || 'Не удалось сохранить изменения');
    },
  });

  React.useEffect(() => {
    if (!purchase) return;
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
  }, [purchase, form]);

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

    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Редактировать закупку"
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
