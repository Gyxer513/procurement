import { keycloak } from '@/auth/keycloak';

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  await keycloak.updateToken(30);

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${keycloak.token}`);

  return fetch(input, { ...init, headers });
}
