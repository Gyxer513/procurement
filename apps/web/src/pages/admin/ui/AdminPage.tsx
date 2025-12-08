import { useState } from 'react';
import { Button, Space, Typography, message } from 'antd';

import type { BatchResponse } from '@shared/types/Purchase';
import { ImportPurchasesModal } from '@features/Purchases/import-excel';

export default function AdminPage() {
  const [open, setOpen] = useState(false);

  function handleSuccess(res: BatchResponse) {
    message.success(
      'Импорт завершён: ' +
        ('inserted' in res
          ? `вставлено ${res.inserted ?? 0}`
          : `upsert ${res.upserted ?? 0}, обновлено ${
              res.modified ?? 0
            }, совпало ${res.matched ?? 0}`)
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Админ</Typography.Title>
      <Space>
        <Button type="primary" onClick={() => setOpen(true)}>
          Импорт закупок из Excel
        </Button>
      </Space>

      <ImportPurchasesModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
