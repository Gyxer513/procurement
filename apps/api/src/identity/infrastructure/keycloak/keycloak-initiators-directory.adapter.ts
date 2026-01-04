import { Injectable } from '@nestjs/common';
import {
  InitiatorsDirectoryPort,
  Initiator,
} from '../../domain/interfaces/initiators-directory.port';
import { KeycloakAdminClient } from './keycloak-admin.client';

type KCUser = {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

@Injectable()
export class KeycloakInitiatorsDirectoryAdapter
  implements InitiatorsDirectoryPort
{
  constructor(private readonly kc: KeycloakAdminClient) {}

  async listInitiators(): Promise<Initiator[]> {
    const roleName = process.env.KEYCLOAK_INITIATOR_ROLE!;
    const isClientRole = process.env.KEYCLOAK_ROLE_IS_CLIENT === 'true';

    let users: KCUser[];
    if (!isClientRole) {
      // realm role
      users = await this.kc.get<KCUser[]>(`/roles/${roleName}/users`);
    } else {
      // client role
      const clientUuid = process.env.KEYCLOAK_CLIENT_UUID!;
      users = await this.kc.get<KCUser[]>(
        `/clients/${clientUuid}/roles/${roleName}/users`
      );
    }

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
    }));
  }

  async getUserById(id: string): Promise<Initiator | null> {
    try {
      const u = await this.kc.get<KCUser>(`/users/${id}`);
      return {
        id: u.id,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
      };
    } catch {
      return null;
    }
  }
}
