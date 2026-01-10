import { Alert, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { useInitiatorsOptions } from '@/entities/user/model/useInitiators';

export function InitiatorField({ disabled }: { disabled?: boolean }) {
  const [search, setSearch] = useState('');
  const { options, loading, emptyTotal, emptyFiltered } =
    useInitiatorsOptions(search);

  const showManual = emptyTotal || emptyFiltered;

  return (
    <>
      <Form.Item
        name="initiatorId"
        label="Ответственный (Initiator)"
        dependencies={['initiatorNameManual']}
        validateTrigger={['onChange', 'onBlur']}
        rules={[
          ({ getFieldValue }) => ({
            validator: async (_, value) => {
              const manual = (
                getFieldValue('initiatorNameManual') || ''
              ).trim();
              if (value || manual) return;
              throw new Error('Выберите ответственного или укажите вручную');
            },
          }),
        ]}
      >
        <Select
          disabled={disabled}
          showSearch
          allowClear
          filterOption={false}
          onSearch={setSearch}
          options={options}
          loading={loading}
          placeholder="Начните вводить ФИО/логин/email"
        />
      </Form.Item>

      {showManual && (
        <>
          <Alert
            type="warning"
            showIcon
            message={
              emptyTotal
                ? 'В Keycloak не найдено ни одного пользователя с ролью Initiator. Можно указать ответственного вручную.'
                : 'Пользователь не найден по поиску. Можно указать ответственного вручную.'
            }
            style={{ marginBottom: 8 }}
          />

          <Form.Item
            name="initiatorNameManual"
            label="Ответственный (вручную)"
            dependencies={['initiatorId']}
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              ({ getFieldValue }) => ({
                validator: async (_, v) => {
                  const id = getFieldValue('initiatorId');
                  if (id) return; // выбран из списка — manual не нужен
                  if ((v || '').trim()) return;
                  throw new Error('Укажите ответственного вручную');
                },
              }),
            ]}
          >
            <Input
              disabled={disabled}
              placeholder="ФИО / отдел / любая идентификация"
            />
          </Form.Item>
        </>
      )}
    </>
  );
}
