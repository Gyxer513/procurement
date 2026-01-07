import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space } from 'antd';
import { PurchaseDetailsWidget } from '@/widgets/purchase-details/ui/PurchaseDetailsWidget';
import { DeletePurchaseButton } from '@/features/Purchases/delete/ui/DeletePurchaseButton';

export function PurchaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return null;

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Space wrap>
        <Button onClick={() => navigate(-1)}>Назад</Button>
        <DeletePurchaseButton id={id} />
      </Space>

      <PurchaseDetailsWidget id={id} />
    </Space>
  );
}

export default PurchaseDetailsPage;
