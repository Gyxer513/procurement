import { checkResponse } from '../utils/checkResponse';
import { BASE_URL } from './base';
import { authFetch } from '@shared/api/authFetch';
import type { DirectoryUser } from '../types/Identity';

export class IdentityApi {
  private baseUrl: URL;

  constructor(baseURL: string, slug = 'identity') {
    const cleanedSlug = slug.replace(/^\/+/, '');
    const normalizedBaseURL = baseURL.endsWith('/') ? baseURL : baseURL + '/';
    this.baseUrl = new URL(cleanedSlug, normalizedBaseURL);
    if (!this.baseUrl.href.endsWith('/')) {
      this.baseUrl = new URL(this.baseUrl.href + '/');
    }
  }

  async initiators(signal?: AbortSignal) {
    const url = new URL(`${this.baseUrl.href}initiators`);
    const res = await authFetch(url.href, { signal, credentials: 'include' });
    return checkResponse<DirectoryUser[]>(res);
  }

  async procurements(signal?: AbortSignal) {
    const url = new URL(`${this.baseUrl.href}procurements`);
    const res = await authFetch(url.href, { signal, credentials: 'include' });
    return checkResponse<DirectoryUser[]>(res);
  }
}

export const identityApi = new IdentityApi(BASE_URL, 'identity/');
