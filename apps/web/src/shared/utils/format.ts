import dayjs from 'dayjs';

export const rub = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

export function fmtDate(v?: string) {
  if (!v) return '';
  const d = dayjs(v);
  return d.isValid() ? d.format('DD.MM.YYYY') : '';
}
