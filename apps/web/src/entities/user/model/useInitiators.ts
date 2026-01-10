import { useEffect, useMemo, useState } from 'react';
import { DirectoryUser } from '@shared/types/Identity';
import { identityApi } from '@shared/api/identityApi';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

const labelOf = (u: DirectoryUser) =>
  u.lastName || u.username || u.email || u.id;

export function useInitiatorsOptions(search: string) {
  const [items, setItems] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);

    identityApi
      .initiators(ac.signal)
      .then((data) => setItems(data))
      .finally(() => {
        setLoading(false);
        setLoaded(true);
      });

    return () => ac.abort();
  }, []);

  const q = useDebouncedValue(search, 300);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;

    return items.filter((u) => {
      const label = labelOf(u).toLowerCase();
      const email = (u.email || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      return label.includes(s) || email.includes(s) || username.includes(s);
    });
  }, [items, q]);

  const options = useMemo(
    () =>
      filtered.map((u) => ({
        value: u.id,
        label: labelOf(u),
      })),
    [filtered]
  );

  return {
    options,
    loading,
    emptyTotal: loaded && items.length === 0,
    emptyFiltered: loaded && items.length > 0 && options.length === 0,
  };
}
