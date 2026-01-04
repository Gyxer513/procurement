import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/widgets/app-header';

const { Content } = Layout;

export function MainPage() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />

      <Content style={{ padding: 16 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
