import { checkResponse } from '../utils/checkResponse';
import { BASE_URL } from './base';
import { authFetch } from '@shared/api/authFetch';
import type { DirectoryUser } from '../types/Identity';

export class IdentityApi {
  private baseHref: string;

  constructor(baseURL: string, slug = 'identity/') {
    const cleanedSlug = slug.replace(/^\/+/, '');
    const normalizedBaseURL = baseURL.endsWith('/') ? baseURL : baseURL + '/';
    const u = new URL(cleanedSlug, normalizedBaseURL);
    this.baseHref = u.href.endsWith('/') ? u.href : u.href + '/';
  }

  private url(path = '') {
    return new URL(path, this.baseHref);
  }

  private async json<T>(url: URL | string, init?: RequestInit) {
    const res = await authFetch(String(url), {
      credentials: 'include',
      ...init,
    });
    return checkResponse<T>(res);
  }

  // GET /identity/initiators
  async initiators(signal?: AbortSignal) {
    return this.json<DirectoryUser[]>(this.url('initiators'), { signal });
  }

  // GET /identity/procurements
  async procurements(signal?: AbortSignal) {
    return this.json<DirectoryUser[]>(this.url('procurements'), { signal });
  }
}

export const identityApi = new IdentityApi(BASE_URL, 'identity/');
