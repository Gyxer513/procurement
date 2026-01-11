import { useEffect, useState } from 'react';
import { Card, Space } from 'antd';
import { purchasesApi } from '@shared/api/purchases';
import { Purchase } from '@shared/types/Purchase';
import { fmtDate } from '@shared/utils/format';
import { PurchaseDetailsView } from '@/entities/purchase/ui/PurchaseDetailsView';

export function PurchaseDetailsWidget(props: { id: string }) {
  const { id } = props;
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    purchasesApi
      .getById(id)
      .then(setPurchase)
      .finally(() => setLoading(false));
  }, [id]);

  const title = purchase?.entryNumber
    ? `Закупка № ${purchase.entryNumber}`
    : 'Закупка';

  const createdAt = (purchase as any)?.createdAt;
  const extraHeader = createdAt ? `создана: ${fmtDate(createdAt)}` : '';

  return (
    <Card
      loading={loading}
      title={
        <Space orientation="vertical" size={0}>
          <div>{title}</div>
          <div style={{ color: '#888', fontWeight: 400 }}>{extraHeader}</div>
        </Space>
      }
    >
      {purchase && <PurchaseDetailsView purchase={purchase} />}
    </Card>
  );
}
