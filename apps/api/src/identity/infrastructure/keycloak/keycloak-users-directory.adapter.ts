// identity/infrastructure/keycloak/keycloak-users-directory.adapter.ts
import { Injectable } from '@nestjs/common';
import {
  UsersDirectoryPort,
  DirectoryUser,
} from '../../domain/interfaces/users-directory.port';
import { KeycloakAdminClient } from './keycloak-admin.client';

type KCUser = {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

@Injectable()
export class KeycloakUsersDirectoryAdapter extends UsersDirectoryPort {
  constructor(private readonly kc: KeycloakAdminClient) {
    super();
  }

  async listUsersByClientRole(roleName: string): Promise<DirectoryUser[]> {
    const sourceClientId =
      process.env.KEYCLOAK_ROLES_SOURCE_CLIENT_ID ?? 'procurement-api';

    const clientUuid = await this.kc.resolveClientUuid(sourceClientId);

    const users = (await this.kc.getUsersByClientRole(
      clientUuid,
      roleName
    )) as KCUser[];

    return users
      .map((u) => ({
        id: u.id,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
      }))
      .sort((a, b) =>
        (a.lastName ?? a.username).localeCompare(b.lastName ?? b.username, 'ru')
      );
  }

  async getUserById(id: string): Promise<DirectoryUser | null> {
    const u = (await this.kc.getUserById(id)) as KCUser | null;
    if (!u) return null;

    return {
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
    };
  }
}
