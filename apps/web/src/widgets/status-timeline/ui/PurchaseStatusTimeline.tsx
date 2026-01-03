import { Timeline, Tag } from 'antd';
import { fmtDate } from '@shared/utils/format';
import { PurchaseStatus } from '@shared/enums/purchase-status.enum';

const STATUS_COLORS: Record<PurchaseStatus | string, string> = {
  [PurchaseStatus.InProgress]: 'blue',
  [PurchaseStatus.UnderReview]: 'gold',
  [PurchaseStatus.ReceivedByProcurement]: 'geekblue',
  [PurchaseStatus.NeedsFix]: 'orange',
  [PurchaseStatus.Rejected]: 'red',
  [PurchaseStatus.Cancelled]: 'default',
};

type StatusHistoryItem = {
  status: PurchaseStatus;
  changedAt: string;
  comment?: string;
};

type Props = {
  history?: StatusHistoryItem[];
  compact?: boolean;
};

export const PurchaseStatusTimeline = ({ history, compact }: Props) => {
  if (!history || history.length === 0) {
    return <div style={{ color: '#999' }}>История статусов отсутствует</div>;
  }

  const items = [...history]
    .sort(
      (a, b) =>
        new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
    )
    .map((h) => {
      const dateText = fmtDate(h.changedAt);
      const color = STATUS_COLORS[h.status] ?? 'default';
      return {
        color,
        children: (
          <div style={{ lineHeight: 1.4 }}>
            <div style={{ marginBottom: 4 }}>
              <Tag color={color} style={{ marginRight: 8 }}>
                {h.status}
              </Tag>
              <span style={{ color: '#888' }}>{dateText}</span>
            </div>
            {h.comment ? (
              <div style={{ whiteSpace: 'pre-wrap' }}>{h.comment}</div>
            ) : null}
          </div>
        ),
      };
    });

  return <Timeline mode={compact ? 'left' : undefined} items={items} />;
};

export default PurchaseStatusTimeline;
