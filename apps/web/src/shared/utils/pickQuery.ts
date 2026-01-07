type QueryValue = string | number | boolean | Date | null | undefined;

function toQueryRecord<T extends Record<string, any>>(
  params: T,
  allowedKeys: readonly (keyof T)[]
) {
  const q: Record<string, string> = {};

  for (const key of allowedKeys) {
    const val: QueryValue = params[key];

    if (val === undefined || val === null || val === '') continue;

    // boolean / number / string / Date
    q[String(key)] = val instanceof Date ? val.toISOString() : String(val);
  }

  return q;
}
