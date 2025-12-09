export function toBoolGeneric(v: unknown): boolean | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  if (['да', 'true', '1', 'yes', 'y', '+'].includes(s)) return true;
  if (['нет', 'false', '0', 'no', 'n', '-'].includes(s)) return false;
  return undefined;
}

export function toCompleted(v: unknown): boolean | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const s = String(v).trim().toLowerCase();
  if (s.includes('не состоя')) return false;
  if (s.includes('состоя')) return true;
  return toBoolGeneric(v);
}
