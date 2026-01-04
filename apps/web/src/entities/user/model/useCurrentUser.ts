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
      .catch(() => {
        // fallback останется из tokenParsed
      });

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

  const hasRealmRole = (role: string) => Boolean(keycloak.hasRealmRole?.(role));

  return {
    login,
    fullName, // может быть пустой строкой
    hasRealmRole,
  };
}
