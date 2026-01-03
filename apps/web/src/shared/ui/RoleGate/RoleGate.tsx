import { ReactNode } from 'react';
import { useUserRoles } from '@/lib/auth/useUserRoles';
import { hasAnyRole } from '@/lib/auth/roles';

type Props = {
  anyOf: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGate({ anyOf, children, fallback = null }: Props) {
  const roles = useUserRoles();
  return hasAnyRole(roles, anyOf) ? <>{children}</> : <>{fallback}</>;
}
