import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { keycloak } from '@/auth/keycloak';

type Props = {
  role: string;
  children: ReactNode;
  clientId?: string;
};

export function RequireClientRole({ role, children, clientId }: Props) {
  const location = useLocation();

  const effectiveClientId =
    clientId || ((keycloak as any).clientId as string | undefined);

  const allowed = effectiveClientId
    ? Boolean(keycloak.hasResourceRole?.(role, effectiveClientId))
    : false;

  if (allowed) return <>{children}</>;

  return (
    <Navigate to="/error/403" replace state={{ from: location.pathname }} />
  );
}
