import { Layout, Button, Space, Typography, Menu, Switch, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { keycloak } from '@/auth/keycloak';
import { useAppTheme } from '@/app/providers/theme/ThemeProvider';

const { Header, Content } = Layout;

export function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { theme: appTheme, toggleTheme } = useAppTheme();
  const { token } = theme.useToken();

  const onLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const isAdmin = keycloak.hasRealmRole?.('admin');

  const selectedKey = location.pathname.split('/')[1] || 'purchases';

  const items = [
    { key: 'purchases', label: 'Закупки' },
    { key: 'reports', label: 'Отчеты' },
    ...(isAdmin ? [{ key: 'admin', label: 'Админ' }] : []),
  ];

  // чтобы хедер выглядел адекватно в обеих темах
  const headerBg =
    appTheme === 'dark' ? token.colorBgElevated : token.colorBgContainer;
  const headerBorder =
    appTheme === 'dark' ? 'none' : `1px solid ${token.colorBorderSecondary}`;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: headerBg,
          borderBottom: headerBorder,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Typography.Text style={{ color: token.colorText, fontSize: 18 }}>
            Учет закупок
          </Typography.Text>

          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={items}
            onClick={(e) => navigate(`/${e.key}`)}
            theme={appTheme === 'dark' ? 'dark' : 'light'}
            style={{ minWidth: 360, background: 'transparent' }}
          />
        </div>

        <Space>
          <Switch
            checked={appTheme === 'dark'}
            onChange={toggleTheme}
            checkedChildren="Dark"
            unCheckedChildren="Light"
          />

          <Typography.Text style={{ color: token.colorTextSecondary }}>
            {keycloak.tokenParsed?.preferred_username}
          </Typography.Text>

          <Button onClick={onLogout}>Выйти</Button>
        </Space>
      </Header>

      <Content style={{ padding: 16 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
