import { Button, Modal, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { purchasesApi } from '@shared/api/purchases';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/entities/user/model/useCurrentUser';

export function DeletePurchaseButton(props: { id?: string }) {
  const { id } = props;
  const navigate = useNavigate();
  const { hasRole } = useCurrentUser();

  const canDelete = hasRole('senior_admin');

  console.log('canDelete', canDelete);

  if (!canDelete || !id) return null;

  const onDelete = () => {
    Modal.confirm({
      title: 'Удалить закупку?',
      content: 'Действие необратимо.',
      okText: 'Удалить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: async () => {
        await purchasesApi.delete(id);
        message.success('Закупка удалена');
        navigate('/purchases');
      },
    });
  };

  return (
    <Button danger icon={<DeleteOutlined />} onClick={onDelete}>
      Удалить
    </Button>
  );
}
