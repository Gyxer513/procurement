export enum Role {
  Admin = 'admin',
  SeniorAdmin = 'senior_admin',
  Procurement = 'procurement',
  Initiator = 'initiator',
  Statistic = 'statistic',
}

type TokenParsed = {
  resource_access?: Record<string, { roles?: string[] }>;
  realm_access?: { roles?: string[] };
};

export function getClientRoles(
  tokenParsed: TokenParsed | undefined,
  clientId: string
) {
  return tokenParsed?.resource_access?.[clientId]?.roles ?? [];
}

export function hasAnyRole(userRoles: string[], required: string[]) {
  return required.some((r) => userRoles.includes(r));
}
