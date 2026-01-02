import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { App } from '@app/App';
import { StrictMode } from 'react';
import { keycloak } from './auth/keycloak';

dayjs.locale('ru');

const queryClient = new QueryClient();

async function bootstrap() {
  await keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false,
  });

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={ruRU}>
          <App />
        </ConfigProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

bootstrap().catch((e) => {
  // можно вывести на страницу/в консоль
  console.error('Keycloak init failed', e);
});
