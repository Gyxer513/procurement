import { Button, Result, Typography } from 'antd';
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from 'react-router-dom';

export default function AppErrorPage() {
  const err = useRouteError();
  const navigate = useNavigate();

  let title = 'Ошибка';
  let subTitle = 'Что-то пошло не так. Попробуйте обновить страницу.';

  if (isRouteErrorResponse(err)) {
    title = `Ошибка ${err.status}`;
    subTitle = err.statusText || subTitle;
  }

  return (
    <Result
      status="error"
      title={title}
      subTitle={
        <div>
          <div>{subTitle}</div>
          <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
            {typeof err === 'object' && err && 'message' in err
              ? String((err as any).message)
              : ''}
          </Typography.Paragraph>
        </div>
      }
      extra={
        <>
          <Button onClick={() => window.location.reload()}>Обновить</Button>
          <Button
            type="primary"
            onClick={() => navigate('/purchases', { replace: true })}
          >
            К закупкам
          </Button>
        </>
      }
    />
  );
}
