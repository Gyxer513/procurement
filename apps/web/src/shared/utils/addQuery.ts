export type Query = Record<string, unknown>;

export function addQuery(url: URL, query?: Query) {
  if (!query) return url;
  for (const [key, val] of Object.entries(query)) {
    if (val === undefined || val === null || val === '') continue;
    url.searchParams.set(key, String(val));
  }
  return url;
}
