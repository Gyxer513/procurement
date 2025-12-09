import { useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Modal,
  Upload,
  Button,
  Select,
  Input,
  Space,
  Typography,
  Alert,
  Divider,
  Progress,
} from 'antd';
import type { UploadProps, RcFile } from 'antd/es/upload';
import { InboxOutlined } from '@ant-design/icons';
import type { Purchase, BatchResponse } from '@shared/types/Purchase';
import { purchasesApi } from '@shared/api/purchases';
import { parseExcelToPurchases } from '@entities/purchase/lib/exel/parseExcelToPurchases';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

type Mode = 'upsert' | 'insert';

export type ImportPurchasesModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (result: BatchResponse) => void;
};

export function ImportPurchasesModal({
  open,
  onClose,
  onSuccess,
}: ImportPurchasesModalProps) {
  const [items, setItems] = useState<Partial<Purchase>[]>([]);
  const [mode, setMode] = useState<Mode>('upsert');
  const [matchBy, setMatchBy] = useState<string>('entryNumber');
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    processed: number;
    total: number;
  } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sample = useMemo(
    () => JSON.stringify(items.slice(0, 3), null, 2),
    [items]
  );

  const mutation = useMutation({
    mutationFn: async (vars: {
      items: Partial<Purchase>[];
      mode: Mode;
      matchBy?: string;
    }) => {
      setError(null);
      setInfo(null);
      setProgress({ processed: 0, total: vars.items.length });
      abortRef.current = new AbortController();

      const res = await purchasesApi.batch(vars.items, {
        mode: vars.mode,
        matchBy: vars.mode === 'upsert' ? vars.matchBy : undefined,
        signal: abortRef.current.signal,
        onChunk: ({ chunkSize, totals }) => {
          // обновляем счётчик по количеству обработанных записей
          setProgress((p) =>
            p
              ? {
                  processed: Math.min(p.processed + (chunkSize || 0), p.total),
                  total: p.total,
                }
              : null
          );
          // можно дублировать в info краткую сводку
          setInfo(
            vars.mode === 'insert'
              ? `Вставлено: ${totals.inserted ?? 0}`
              : `Upsert: ${totals.upserted ?? 0}, Обновлено: ${
                  totals.modified ?? 0
                }, Совпало: ${totals.matched ?? 0}`
          );
        },
      });

      return res;
    },
    onSuccess: (res) => {
      onSuccess?.(res);
    },
    onError: (e: any) => {
      setError(e?.message || 'Ошибка при отправке данных');
    },
    onSettled: () => {
      abortRef.current = null;
    },
  });

  async function handleFile(file: RcFile) {
    try {
      setError(null);
      setInfo(null);
      setFileName(file.name);
      const list = await parseExcelToPurchases(file);
      setItems(list);
      setInfo(`Файл: ${file.name}. Строк: ${list.length}`);
    } catch (err: any) {
      console.error('Error reading Excel file:', err);
      setError('Ошибка чтения Excel: ' + (err?.message || 'unknown'));
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    showUploadList: !!fileName,
    beforeUpload: async (file) => {
      await handleFile(file as RcFile);
      return Upload.LIST_IGNORE; // не грузим на сервер, читаем локально
    },
    onRemove: () => {
      handleClear();
    },
  };

  function handleClear() {
    setItems([]);
    setFileName('');
    setError(null);
    setInfo(null);
    setProgress(null);
  }

  function handleAbortRequest() {
    abortRef.current?.abort();
  }

  function handleClose() {
    if (mutation.isPending) return;
    handleClear();
    onClose();
  }

  const percent = progress
    ? Math.round((progress.processed / Math.max(progress.total, 1)) * 100)
    : 0;

  const footer = (
    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <Button onClick={handleClear} disabled={mutation.isPending}>
        Очистить
      </Button>
      <Space>
        <Button onClick={handleAbortRequest} disabled={!mutation.isPending}>
          Отмена запроса
        </Button>
        <Button
          type="primary"
          onClick={() => mutation.mutate({ items, mode, matchBy })}
          disabled={!items.length || mutation.isPending}
        >
          Отправить
        </Button>
      </Space>
    </Space>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Импорт закупок из Excel"
      width={900}
      destroyOnClose
      footer={footer}
      maskClosable={!mutation.isPending}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Text strong>Шаг 1. Выберите файл</Text>
          <Dragger
            {...uploadProps}
            disabled={mutation.isPending}
            style={{ marginTop: 8 }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Перетащите .xlsx/.xls файл сюда или нажмите для выбора
            </p>
            <p className="ant-upload-hint">
              Поддерживаются небольшие вариации названий колонок
            </p>
          </Dragger>
          {fileName ? (
            <div style={{ marginTop: 8, color: '#666' }}>{fileName}</div>
          ) : null}
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <div>
          <Text strong>Шаг 2. Настройки</Text>
          <Space wrap style={{ marginTop: 8 }}>
            <Select<Mode>
              value={mode}
              onChange={setMode}
              disabled={mutation.isPending}
              style={{ width: 260 }}
              options={[
                { value: 'upsert', label: 'Upsert (обновить/создать)' },
                { value: 'insert', label: 'Insert (только вставка)' },
              ]}
            />
            <Input
              placeholder="matchBy (entryNumber)"
              value={matchBy}
              onChange={(e) => setMatchBy(e.target.value)}
              disabled={mutation.isPending || mode === 'insert'}
              style={{ width: 260 }}
            />
          </Space>
          <div style={{ marginTop: 6, color: '#666' }}>
            По умолчанию — upsert по entryNumber.
          </div>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <div>
          <Text strong>Шаг 3. Отправка</Text>
          <div style={{ marginTop: 8 }}>
            Подготовлено записей: <b>{items.length}</b>
          </div>

          {items.length > 0 && (
            <>
              <div style={{ marginTop: 8, color: '#666' }}>
                Пример первых записей
              </div>
              <Paragraph
                code
                style={{
                  maxHeight: 220,
                  overflow: 'auto',
                  background: '#fafafa',
                }}
              >
                <pre style={{ margin: 0 }}>{sample}</pre>
              </Paragraph>
            </>
          )}

          {progress && (
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={percent}
                status={mutation.isPending ? 'active' : 'normal'}
              />
              <div style={{ color: '#666' }}>
                Обработано {progress.processed} из {progress.total}
              </div>
            </div>
          )}

          {mutation.isPending && (
            <Alert
              type="info"
              showIcon
              style={{ marginTop: 8 }}
              message="Отправка..."
            />
          )}
          {mutation.isSuccess && info && (
            <Alert
              type="success"
              showIcon
              style={{ marginTop: 8 }}
              message={info}
            />
          )}
          {error && (
            <Alert
              type="error"
              showIcon
              style={{ marginTop: 8 }}
              message={error}
            />
          )}
        </div>
      </Space>
    </Modal>
  );
}
