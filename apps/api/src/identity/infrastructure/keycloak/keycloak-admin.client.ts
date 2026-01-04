import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KeycloakAdminClient {
  private token?: { accessToken: string; expiresAt: number };

  constructor(private readonly http: HttpService) {}

  private get baseUrl() {
    return process.env.KEYCLOAK_BASE_URL!;
  }
  private get realm() {
    return process.env.KEYCLOAK_REALM!;
  }

  private async getAdminToken(): Promise<string> {
    const now = Date.now();
    if (this.token && now < this.token.expiresAt - 10_000) {
      return this.token.accessToken;
    }

    const url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.KEYCLOAK_ADMIN_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET!,
    });

    const resp = await firstValueFrom(
      this.http.post(url, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );

    const accessToken = resp.data.access_token as string;
    const expiresIn = resp.data.expires_in as number; // seconds

    this.token = {
      accessToken,
      expiresAt: now + expiresIn * 1000,
    };

    return accessToken;
  }

  async get<T>(path: string): Promise<T> {
    const token = await this.getAdminToken();
    const url = `${this.baseUrl}/admin/realms/${this.realm}${path}`;

    const resp = await firstValueFrom(
      this.http.get<T>(url, { headers: { Authorization: `Bearer ${token}` } })
    );

    return resp.data;
  }
}
