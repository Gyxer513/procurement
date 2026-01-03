import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { PurchaseStatus } from '@shared/enums/purchase-status.enum';
import { PurchaseSite } from '@shared/enums/purchase-site.enum';
import { PurchaseStatusField } from '@entities/purchase/ui/PurchaseStatusField';
import { purchasesApi } from '@shared/api/purchases';
import { useUserRoles } from '@/lib/auth/useUserRoles';
import { Role } from '@/lib/auth/roles';

export function MetaSection(props: {
  isCreate: boolean;
  readOnly: boolean;
  disableEntryNumber: boolean;
  disableEntryDate: boolean;
  disableMetaEditable: boolean;
  id: string;
  status: PurchaseStatus;
}) {
  const {
    isCreate,
    readOnly,
    disableEntryNumber,
    disableEntryDate,
    disableMetaEditable,
    status,
    id,
  } = props;
  const roles = useUserRoles() as string[];
  const canEditStatus = [Role.Admin, Role.SeniorAdmin, Role.Procurement].some(
    (role) => roles.includes(role)
  );
  return (
    <Row gutter={16}>
      <Col span={6}>
        <PurchaseStatusField
          status={status}
          availableStatuses={Object.values(PurchaseStatus)}
          onChangeStatus={
            id
              ? async (newStatus) => {
                  await purchasesApi.setStatus(id, newStatus);
                }
              : undefined
          }
          disabled={!canEditStatus || !id}
        />
      </Col>

      <Col span={8}>
        <Form.Item name="site" label="Площадка">
          <Select
            disabled={readOnly || disableMetaEditable}
            options={Object.values(PurchaseSite).map((v) => ({
              value: v,
              label: v,
            }))}
            allowClear
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="entryNumber" label="Вход. №">
          <Input
            disabled={disableEntryNumber || isCreate}
            placeholder={isCreate ? 'Присвоит система' : ''}
          />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item name="entryDate" label="Дата вход.">
          <DatePicker
            format="DD.MM.YYYY"
            style={{ width: '100%' }}
            disabled={disableEntryDate || isCreate}
            placeholder={isCreate ? 'Присвоит система' : undefined}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item name="lastStatusChangedAt" label="Дата изм. статуса">
          <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} disabled />
        </Form.Item>
      </Col>
    </Row>
  );
}
