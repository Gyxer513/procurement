import { useState } from 'react';
import { Button, Space, Typography, message, List, Card } from 'antd';

import type { BatchResponse } from '@shared/types/Purchase';
import { ImportPurchasesModal } from '@features/Purchases/import-excel';
import { identityApi } from '@shared/api/identityApi';
import type { DirectoryUser } from '@shared/types/Identity';

function formatUser(u: DirectoryUser) {
  const fio = `${u.lastName ?? ''} ${u.firstName ?? ''}`.trim();
  return fio || u.username || u.email || u.id;
}

export default function AdminPage() {
  const [open, setOpen] = useState(false);

  const [initiators, setInitiators] = useState<DirectoryUser[]>([]);
  const [procurements, setProcurements] = useState<DirectoryUser[]>([]);
  const [loadingInit, setLoadingInit] = useState(false);
  const [loadingProc, setLoadingProc] = useState(false);

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

  async function loadInitiators() {
    try {
      setLoadingInit(true);
      const data = await identityApi.initiators();
      setInitiators(data);
    } catch (e: any) {
      message.error(e?.message ?? 'Не удалось загрузить инициаторов');
    } finally {
      setLoadingInit(false);
    }
  }

  async function loadProcurements() {
    try {
      setLoadingProc(true);
      const data = await identityApi.procurements();
      setProcurements(data);
    } catch (e: any) {
      message.error(e?.message ?? 'Не удалось загрузить закупщиков');
    } finally {
      setLoadingProc(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Админ</Typography.Title>

      <Space wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          Импорт закупок из Excel
        </Button>

        <Button loading={loadingInit} onClick={loadInitiators}>
          Показать инициаторов
        </Button>

        <Button loading={loadingProc} onClick={loadProcurements}>
          Показать закупщиков
        </Button>
      </Space>

      <div
        style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <Card title={`Инициаторы (${initiators.length})`} size="small">
          <List
            size="small"
            dataSource={initiators}
            renderItem={(u) => (
              <List.Item>
                <div>
                  <div>{formatUser(u)}</div>
                  <div style={{ opacity: 0.65, fontSize: 12 }}>
                    {u.email ?? u.username}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>

        <Card title={`Закупщики (${procurements.length})`} size="small">
          <List
            size="small"
            dataSource={procurements}
            renderItem={(u) => (
              <List.Item>
                <div>
                  <div>{formatUser(u)}</div>
                  <div style={{ opacity: 0.65, fontSize: 12 }}>
                    {u.email ?? u.username}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>

      <ImportPurchasesModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
