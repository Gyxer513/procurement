import { Navigate, useLocation } from 'react-router-dom';
import { keycloak } from '@/auth/keycloak';
import { ReactNode } from 'react';

export function RequireRealmRole({
  role,
  children,
}: {
  role: string;
  children: ReactNode;
}) {
  const location = useLocation();
  const hasRole = keycloak.hasRealmRole?.(role);

  if (hasRole) return <>{children}</>;

  return (
    <Navigate to="/error/403" replace state={{ from: location.pathname }} />
  );
}
