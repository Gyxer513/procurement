import { useEffect, useMemo, useState } from 'react';
import { keycloak } from '@/auth/keycloak';

type KCProfile = {
  firstName?: string;
  lastName?: string;
  username?: string;
};

export function useCurrentUser() {
  const tokenParsed = keycloak.tokenParsed as any;
  const [profile, setProfile] = useState<KCProfile | null>(null);

  useEffect(() => {
    const hasNameInToken = Boolean(
      tokenParsed?.name || tokenParsed?.given_name || tokenParsed?.family_name
    );
    if (hasNameInToken) return;

    let cancelled = false;

    keycloak
      .loadUserProfile()
      .then((p: any) => {
        if (cancelled) return;
        setProfile({
          firstName: p.firstName,
          lastName: p.lastName,
          username: p.username,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login: string =
    tokenParsed?.preferred_username || profile?.username || '';

  const fullName: string = useMemo(() => {
    if (tokenParsed?.name) return String(tokenParsed.name);

    const fromTokenParts = [tokenParsed?.family_name, tokenParsed?.given_name]
      .filter(Boolean)
      .join(' ');
    if (fromTokenParts) return fromTokenParts;

    const fromProfile = [profile?.lastName, profile?.firstName]
      .filter(Boolean)
      .join(' ');
    if (fromProfile) return fromProfile;

    return '';
  }, [
    profile,
    tokenParsed?.name,
    tokenParsed?.family_name,
    tokenParsed?.given_name,
  ]);

  // Универсальная проверка: realm-role ИЛИ client-role (по всем client'ам)
  const hasRole = (role: string) => {
    // 1) Realm roles
    if (keycloak.hasRealmRole?.(role)) return true;

    // 2) Client roles (если знаем clientId)
    const clientId = (keycloak as any).clientId as string | undefined;
    if (clientId && keycloak.hasResourceRole?.(role, clientId)) return true;

    // 3) Fallback: пробегаемся по resource_access в tokenParsed
    const ra = tokenParsed?.resource_access ?? {};
    for (const client of Object.keys(ra)) {
      const roles: string[] = ra?.[client]?.roles ?? [];
      if (roles.includes(role)) return true;
    }

    return false;
  };

  return {
    login,
    fullName,
    hasRole,
  };
}
