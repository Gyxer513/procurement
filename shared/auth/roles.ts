export const Role = {
  SeniorAdmin: 'senior_admin',
  Admin: 'admin',
  Procurement: 'procurement',
  Initiator: 'initiator',
  Statistic: 'statistic',
} as const;

export type RoleName = (typeof Role)[keyof typeof Role];
