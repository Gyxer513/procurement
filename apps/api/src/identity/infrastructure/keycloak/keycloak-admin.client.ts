import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type KCClient = { id: string; clientId: string };

@Injectable()
export class KeycloakAdminClient {
  private token?: { accessToken: string; expiresAt: number };
  private clientUuidCache = new Map<string, string>(); // clientId -> uuid

  constructor(private readonly http: HttpService) {}

  /**
   * Ожидаем KEYCLOAK_ISSUER в формате:
   *   http(s)://host:port/realms/<realm>
   */
  private get issuer(): string {
    const issuer = process.env.KEYCLOAK_ISSUER;
    if (!issuer) throw new Error('KEYCLOAK_ISSUER is not set');
    return issuer.replace(/\/+$/, ''); // trim trailing slashes
  }

  private get baseUrl(): string {
    const adminBase = process.env.KEYCLOAK_ADMIN_BASE_URL?.replace(/\/+$/, '');
    if (adminBase) return adminBase;

    const u = new URL(this.issuer);
    return `${u.protocol}//${u.host}`;
  }

  private get realm(): string {
    const u = new URL(this.issuer);
    const parts = u.pathname.split('/').filter(Boolean); // ['realms', '<realm>']
    const idx = parts.indexOf('realms');
    const realm = idx >= 0 ? parts[idx + 1] : undefined;
    if (!realm)
      throw new Error(
        `Cannot parse realm from KEYCLOAK_ISSUER="${this.issuer}"`
      );
    return realm;
  }

  private async getAdminToken(): Promise<string> {
    const now = Date.now();
    if (this.token && now < this.token.expiresAt - 10_000) {
      return this.token.accessToken;
    }

    const clientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID;
    const clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET;

    if (!clientId) throw new Error('KEYCLOAK_ADMIN_CLIENT_ID is not set');
    if (!clientSecret)
      throw new Error('KEYCLOAK_ADMIN_CLIENT_SECRET is not set');

    const url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });

    const resp = await firstValueFrom(
      this.http.post(url, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );

    const accessToken = resp.data.access_token as string;
    const expiresIn = resp.data.expires_in as number;

    if (!accessToken) throw new Error('Keycloak did not return access_token');

    this.token = { accessToken, expiresAt: now + expiresIn * 1000 };
    return accessToken;
  }

  private async adminGet<T>(
    path: string,
    params?: Record<string, any>
  ): Promise<T> {
    const token = await this.getAdminToken();
    const url = `${this.baseUrl}/admin/realms/${this.realm}${path}`;

    const resp = await firstValueFrom(
      this.http.get<T>(url, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    return resp.data;
  }

  async resolveClientUuid(clientId: string): Promise<string> {
    const cached = this.clientUuidCache.get(clientId);
    if (cached) return cached;

    const clients = await this.adminGet<KCClient[]>('/clients', { clientId });
    const found = clients?.find((c) => c.clientId === clientId);

    if (!found?.id) {
      throw new Error(`Keycloak client not found by clientId="${clientId}"`);
    }

    this.clientUuidCache.set(clientId, found.id);
    return found.id;
  }

  async getUsersByClientRole(clientUuid: string, roleName: string) {
    return this.adminGet<any[]>(
      `/clients/${clientUuid}/roles/${encodeURIComponent(roleName)}/users`
    );
  }
}
