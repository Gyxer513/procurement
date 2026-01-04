import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { App } from '@app/App';
import { StrictMode } from 'react';
import { keycloak } from './auth/keycloak';
import { ThemeProvider } from '@/app/providers/theme/ThemeProvider';

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
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

bootstrap().catch((e) => {
  console.error('Keycloak init failed', e);
});
