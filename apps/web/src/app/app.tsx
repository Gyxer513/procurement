import React from 'react';
import { Layout } from 'antd';
import { PurchaseTable } from './purchases/PurchaseTable';

const { Header, Content } = Layout;

export function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: '#fff', fontSize: 18 }}>Учет закупок</Header>
      <Content style={{ padding: 16 }}>
        <PurchaseTable />
      </Content>
    </Layout>
  );
}
