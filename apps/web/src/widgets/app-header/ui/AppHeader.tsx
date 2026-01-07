import { Layout, Menu, Space, Typography, theme } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@entities/user/model/useCurrentUser';
import { ThemeToggle } from '@features/theme/toggle';
import { LogoutButton } from '@features/logout';
import { RoleGate } from '@shared/ui/RoleGate/RoleGate';
import { Role } from '@/lib/auth/roles';

const { Header } = Layout;

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const { login, fullName } = useCurrentUser();

  const selectedKey = location.pathname.split('/')[1] || 'purchases';

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Typography.Text style={{ color: token.colorText, fontSize: 18 }}>
          Учет закупок
        </Typography.Text>

        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={(e) => navigate(`/${e.key}`)}
          style={{ minWidth: 360, background: 'transparent' }}
        >
          <Menu.Item key="purchases">Закупки</Menu.Item>
          <Menu.Item key="reports">Отчеты</Menu.Item>

          <RoleGate anyOf={[Role.SeniorAdmin]}>
            <Menu.Item key="admin">Админ панель</Menu.Item>
          </RoleGate>
          <RoleGate anyOf={[Role.SeniorAdmin]}>
            <Menu.Item key="deleted-purchases">Удаленные закупки</Menu.Item>
          </RoleGate>
        </Menu>
      </div>

      <Space align="center" size={12}>
        <ThemeToggle />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1.15,
            maxWidth: 260,
          }}
        >
          {fullName && (
            <Typography.Text style={{ color: token.colorText }}>
              {fullName}
            </Typography.Text>
          )}

          <Typography.Text
            type="secondary"
            ellipsis={{ tooltip: login }}
            style={{ maxWidth: 260 }}
          >
            {login}
          </Typography.Text>
        </div>

        <LogoutButton />
      </Space>
    </Header>
  );
}
