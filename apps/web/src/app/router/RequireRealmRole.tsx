import { Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { keycloak } from '@/auth/keycloak';
import { ReactNode } from 'react';

export function RequireRealmRole({
  role,
  children,
}: {
  role: string;
  children: ReactNode;
}) {
  const hasRole = keycloak.hasRealmRole?.(role);

  if (hasRole) return <>{children}</>;

  return (
    <Result
      status="403"
      title="Нет доступа"
      subTitle="Недостаточно прав для просмотра этой страницы"
      extra={
        <Button type="primary" href="/purchases">
          На закупки
        </Button>
      }
    />
  );
}
