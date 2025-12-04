
export async function checkResponse<T = unknown>(res: Response): Promise<T> {

  if (res.ok) {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json() as Promise<T>;
    if (ct.includes('text/')) return res.text() as unknown as T;
    return res.blob() as unknown as T;
  }

  // Попробуем вытащить сообщение об ошибке из JSON
  let message = `HTTP ${res.status} ${res.statusText}`;
  try {
    const data = await res.json();
    if (data?.message) {
      message = Array.isArray(data.message)
        ? data.message.join(', ')
        : String(data.message);
    }
  } catch {
    // ignore
  }
  const err = new Error(message);
  // @ts-expect-error расширим ошибку полезной инфой
  err.status = res.status;
  throw err;
}
