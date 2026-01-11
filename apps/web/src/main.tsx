import ReactDOM from 'react-dom/client';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { App } from '@app/App';
import { StrictMode } from 'react';
import { keycloak } from './auth/keycloak';
import { ThemeProvider } from '@/app/providers/theme/ThemeProvider';
import { getHttpStatus } from '@/lib/http/getHttpStatus';
import { router } from '@app/router/routes';

dayjs.locale('ru');

function goToServerError(status: number) {
  if (status !== 500 && status !== 502) return;

  const currentPath = router.state.location.pathname;
  if (currentPath.startsWith('/error')) return; // анти-зацикливание

  router.navigate(`/error/${status}`);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const status = getHttpStatus(error);
      if (!status) return;
      goToServerError(status);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const status = getHttpStatus(error);
      if (!status) return;
      goToServerError(status);
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

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
