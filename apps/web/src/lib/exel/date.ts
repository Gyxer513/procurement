import moment from 'moment';

export function excelDateToISO(
  input: string | number | Date,
  date1904: boolean
): string {
  if (input === null || input === undefined || input === '') return '';

  // excel serial
  if (typeof input === 'number' && !isNaN(input)) {
    const epoch = date1904 ? 24107 : 25569; // дни до 1970-01-01
    const ms = (input - epoch) * 86400 * 1000;
    if (!Number.isFinite(ms)) return '';
    // UTC, чтобы не ловить смещение по TZ
    const iso = new Date(ms).toISOString().slice(0, 10);
    return iso;
  }
  if (input instanceof Date) {
    return moment(input).isValid()
      ? moment.utc(input).format('YYYY-MM-DD')
      : '';
  }
  const raw = String(input).trim();

  // Популярные форматы: 01.02.2023, 1.2.2023, ISO, 01/02/2023
  const formats = ['DD.MM.YYYY', 'D.M.YYYY', moment.ISO_8601, 'DD/MM/YYYY'];
  for (const f of formats) {
    const m =
      f === moment.ISO_8601
        ? moment(raw, moment.ISO_8601, true)
        : moment(raw, f, true);
    if (m.isValid()) return m.utc().format('YYYY-MM-DD');
  }

  return '';
}
