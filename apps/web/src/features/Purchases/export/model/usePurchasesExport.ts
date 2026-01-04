import { message } from 'antd';
import { purchasesApi } from '@/shared/api/purchases';
import type { PurchasesQuery } from '@/entities/purchase/model';

export function usePurchasesExport() {
  const exportPurchases = async (query: PurchasesQuery) => {
    try {
      const res: any = await purchasesApi.export({
        q: query.q,
        completed: query.completed,
        responsible: query.responsible,
        year: query.year,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      });

      const url = URL.createObjectURL(res.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename || 'Purchases.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || 'Не удалось выполнить экспорт');
    }
  };

  return { exportPurchases };
}
