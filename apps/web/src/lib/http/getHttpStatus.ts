export function getHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return;

  if ('status' in error && typeof (error as any).status === 'number') {
    return (error as any).status;
  }

  if ('response' in error && (error as any).response) {
    const s = (error as any).response.status;
    if (typeof s === 'number') return s;
  }

  return;
}
