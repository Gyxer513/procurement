import { Layout } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/routes';

export function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </Layout>
  );
}
