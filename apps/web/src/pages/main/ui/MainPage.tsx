import { Layout, Button, Space, Typography } from 'antd';
import { Outlet } from 'react-router-dom';
import { keycloak } from '@/auth/keycloak';

const { Header, Content } = Layout;

export function MainPage() {
  const onLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fff',
        }}
      >
        <Typography.Text style={{ color: '#fff', fontSize: 18 }}>
          Учет закупок
        </Typography.Text>

        <Space>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.85)' }}>
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
