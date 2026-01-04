import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="Нет доступа"
      subTitle="У вас недостаточно прав для просмотра этой страницы."
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
