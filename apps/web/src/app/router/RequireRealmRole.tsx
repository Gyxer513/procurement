import { Navigate, useLocation } from 'react-router-dom';
import { keycloak } from '@/auth/keycloak';

export function RequireRealmRole({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const hasRole = keycloak.hasRealmRole?.(role);

  if (hasRole) return <>{children}</>;

  return (
    <Navigate to="/forbidden" replace state={{ from: location.pathname }} />
  );
}
