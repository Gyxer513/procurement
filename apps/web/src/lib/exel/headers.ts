export function normalizeHeader(h: string) {
  return h.replace(/\s+/g, ' ').trim().toLowerCase();
}
