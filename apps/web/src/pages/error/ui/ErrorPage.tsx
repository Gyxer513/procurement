import { Button, Result, Space, Typography } from 'antd';
import {
  isRouteErrorResponse,
  useNavigate,
  useParams,
  useRouteError,
} from 'react-router-dom';

function normalizeCode(input?: string | number): number {
  const n = typeof input === 'number' ? input : Number(input);
  return Number.isFinite(n) ? n : 500;
}

function getViewByCode(code: number): {
  antdStatus: '403' | '404' | '500' | 'error';
  title: string;
  subTitle: string;
} {
  switch (code) {
    case 403:
      return {
        antdStatus: '403',
        title: '403 — Нет доступа',
        subTitle: 'У вас недостаточно прав для просмотра этой страницы.',
      };
    case 404:
      return {
        antdStatus: '404',
        title: '404 — Страница не найдена',
        subTitle: 'Проверьте адрес или перейдите в раздел закупок.',
      };
    case 500:
      return {
        antdStatus: '500',
        title: '500 — Ошибка сервера',
        subTitle:
          'Сервер вернул ошибку. Попробуйте обновить страницу или повторить позже.',
      };
    case 502:
      return {
        antdStatus: 'error', // у antd нет отдельного "502"
        title: '502 — Сервер недоступен',
        subTitle: 'Похоже, сервис временно недоступен. Попробуйте позже.',
      };
    default:
      return {
        antdStatus: 'error',
        title: `${code} — Ошибка`,
        subTitle: 'Произошла ошибка. Попробуйте повторить действие.',
      };
  }
}

export default function ErrorPage() {
  const navigate = useNavigate();
  const params = useParams<{ code?: string }>();

  // Если это отработало как errorElement (ошибка роутера) — вытащим статус оттуда
  const routeError = useRouteError();
  const codeFromRouter = isRouteErrorResponse(routeError)
    ? routeError.status
    : undefined;

  const code = normalizeCode(params.code ?? codeFromRouter ?? 500);
  const view = getViewByCode(code);

  return (
    <Result
      status={view.antdStatus}
      title={view.title}
      subTitle={
        <div>
          <div>{view.subTitle}</div>

          {routeError && !isRouteErrorResponse(routeError) && (
            <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
              {typeof routeError === 'object' &&
              routeError &&
              'message' in routeError
                ? String((routeError as any).message)
                : ''}
            </Typography.Paragraph>
          )}
        </div>
      }
      extra={
        <Space>
          <Button onClick={() => window.location.reload()}>Обновить</Button>
          <Button
            type="primary"
            onClick={() => navigate('/purchases', { replace: true })}
          >
            К закупкам
          </Button>
        </Space>
      }
    />
  );
}
