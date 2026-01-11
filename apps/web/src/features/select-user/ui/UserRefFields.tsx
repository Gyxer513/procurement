import { AutoComplete, Button, Form, Input, Space } from 'antd';
import { useMemo, useState } from 'react';
import { DirectoryUser } from '@shared/types/Identity';
import { useInitiatorsOptions } from '@entities/user/model/useInitiators';

type Props = {
  disabled: boolean;
  /** куда складываем в форме: 'initiator' или 'createdBy' */
  name?: string;
};

export function UserRefFields({ disabled, name = 'initiator' }: Props) {
  const form = Form.useFormInstance();

  const [search, setSearch] = useState('');
  const { options, users, byId, loading } = useInitiatorsOptions(search);

  const [locked, setLocked] = useState(true);
  const fieldsDisabled = disabled || locked;

  const exactByEmail = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return null;
    return users.find((u) => (u.email || '').toLowerCase() === s) ?? null;
  }, [users, search]);

  const fillFromUser = (u: DirectoryUser) => {
    form.setFieldsValue({
      [name]: {
        fullName: u.fullName,
        email: u.email,
        keycloakId: u.id, // ВАЖНО: id -> keycloakId
      },
    });
    setLocked(true);
  };

  const unlockManual = () => {
    setLocked(false);
    const email = search.trim();
    if (email) {
      form.setFieldsValue({
        [name]: {
          email,
          keycloakId: undefined,
        },
      });
    }
  };

  const onFind = () => {
    if (exactByEmail) fillFromUser(exactByEmail);
    else unlockManual();
  };

  const onSelect = (id: string) => {
    const u = byId.get(id);
    if (u) fillFromUser(u);
  };

  return (
    <>
      <Form.Item label="Ответственный (поиск в Keycloak)">
        <Space.Compact style={{ width: '100%' }}>
          <AutoComplete
            style={{ width: '100%' }}
            options={options}
            value={search}
            onChange={setSearch}
            onSelect={onSelect}
            disabled={disabled}
            placeholder="Введите email/ФИО/логин и выберите из списка"
          >
            <Input />
          </AutoComplete>

          <Button
            type="primary"
            onClick={onFind}
            disabled={disabled}
            loading={loading}
          >
            Найти
          </Button>

          <Button onClick={unlockManual} disabled={disabled}>
            Ввести вручную
          </Button>
        </Space.Compact>
      </Form.Item>

      <Form.Item
        name={[name, 'fullName']}
        label="ФИО"
        rules={[{ required: true, message: 'Укажите ФИО' }]}
      >
        <Input disabled={fieldsDisabled} />
      </Form.Item>

      <Form.Item
        name={[name, 'email']}
        label="Email"
        rules={[
          { required: true, message: 'Укажите email' },
          { type: 'email', message: 'Некорректный email' },
        ]}
      >
        <Input disabled={fieldsDisabled} />
      </Form.Item>

      <Form.Item name={[name, 'keycloakId']} label="Keycloak ID">
        <Input disabled={fieldsDisabled} />
      </Form.Item>
    </>
  );
}
