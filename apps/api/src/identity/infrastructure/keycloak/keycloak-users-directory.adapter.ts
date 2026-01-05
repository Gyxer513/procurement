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
export class KeycloakUsersDirectoryAdapter implements UsersDirectoryPort {
  constructor(private readonly kc: KeycloakAdminClient) {}

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
}
