import { useMemo } from 'react';
import { keycloak } from '@/auth/keycloak';
import { getClientRoles } from './roles';

const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'procurement-web';

export function useUserRoles() {
  return useMemo(() => {
    return getClientRoles(keycloak.tokenParsed as any, CLIENT_ID);
  }, [keycloak.tokenParsed]);
}
