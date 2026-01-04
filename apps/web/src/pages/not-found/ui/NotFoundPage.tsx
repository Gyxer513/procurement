import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="Страница не найдена"
      subTitle="Проверьте адрес или вернитесь на главную страницу приложения."
      extra={
        <Button
          type="primary"
          onClick={() => navigate('/purchases', { replace: true })}
        >
          К закупкам
        </Button>
      }
    />
  );
}
