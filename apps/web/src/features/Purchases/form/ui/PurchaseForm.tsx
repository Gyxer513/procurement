import { useEffect } from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';

import type { PurchaseFormValues } from '../types/PurchaseFormValues';
import { PurchaseStatus } from '@shared/enums/purchase-status.enum';

import { useUserRoles } from '@/lib/auth/useUserRoles';
import { Role } from '@/lib/auth/roles';

import { AdminCreateSection } from '@/entities/purchase/ui/form-sections/AdminCreateSection';
import { MetaSection } from '@/entities/purchase/ui/form-sections/MetaSection';
import { SupplierSection } from '@/entities/purchase/ui/form-sections/SupplierSection';
import { ContractSection } from '@/entities/purchase/ui/form-sections/ContractSection';
import { FinanceSection } from '@/entities/purchase/ui/form-sections/FinanceSection';
import { OtherSection } from '@/entities/purchase/ui/form-sections/OtherSection';

type Props = {
  form: any;
  initialValues?: any;
  isCreate?: boolean;
  id?: string;
  status?: PurchaseStatus;
};

const toDayjs = (v?: Date | string) => (v ? dayjs(v) : undefined);

const has = (roles: string[], role: Role) => roles.includes(role);

export function PurchaseForm({
  form,
  initialValues,
  isCreate = false,
  id,
  status,
}: Props) {
  const roles = useUserRoles();

  const isSenior = has(roles, Role.SeniorAdmin);
  const isProc = has(roles, Role.Procurement);
  const isAdmin = has(roles, Role.Admin);
  const isStat = has(roles, Role.Statistic);
  const isInit = has(roles, Role.Initiator);

  // readOnly режим: Admin(edit), Statistic, Initiator
  const readOnly = (!isCreate && isAdmin) || isStat || isInit;

  // Admin-create: отдельная “обрезанная” форма
  const isAdminCreate = isCreate && isAdmin;

  // Полная форма (create/edit) для SeniorAdmin/Procurement, а также просмотр для остальных
  const renderFull = !isAdminCreate;

  // Применяем initialValues (для edit)
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

  // Admin-create: статус “В работе” и entryDate текущая
  useEffect(() => {
    if (!isAdminCreate) return;

    form.setFieldsValue({
      status: (PurchaseStatus as any).InWork ?? 'В работе',
      entryDate: dayjs(),
    });
  }, [isAdminCreate, form]);

  // Ограничения на редактирование отдельных полей (кроме “не рисовать секции”):
  // - SeniorAdmin: нельзя менять entryDate
  // - Procurement: нельзя менять entryNumber и entryDate
  // - ReadOnly: всё disabled (но рисуем для просмотра)
  const disableEntryDate = true;
  const disableEntryNumber = readOnly || isProc; // procurement не меняет номер
  return (
    <Form form={form} layout="vertical">
      {isAdminCreate && (
        <AdminCreateSection
          entryDate={form.getFieldValue('entryDate')}
          // entryDate показываем, но не даём менять
        />
      )}

      {renderFull && (
        <>
          <MetaSection
            id={id}
            status={status}
            isCreate={isCreate}
            readOnly={readOnly}
            disableEntryNumber={disableEntryNumber}
            disableEntryDate={disableEntryDate}
            // status/site в meta: senior/proc могут менять, readOnly — нет
            disableMetaEditable={readOnly}
            // если хотите: procurement не должен менять status? сейчас разрешено
          />

          <SupplierSection readOnly={readOnly} />

          <ContractSection readOnly={readOnly} />

          <FinanceSection form={form} readOnly={readOnly} />

          <OtherSection readOnly={readOnly} />
        </>
      )}
    </Form>
  );
}
