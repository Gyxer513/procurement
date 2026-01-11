import type { UserRef } from 'shared';

export interface IIdentityDirectory {
  getUserRefById(id: string): Promise<UserRef | null>;
}
