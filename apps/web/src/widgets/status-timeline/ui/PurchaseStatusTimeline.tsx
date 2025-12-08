import { Timeline, Tag } from 'antd';
import { Purchase } from '@/shared/types/Purchase';
import { fmtDate } from '../../../shared/utils/format';

const STATUS_COLORS: Record<string, string> = {
  'в работе': 'blue',
  'на рассмотрении': 'gold',
  'получено отделом закупок': 'geekblue',
  'на доработку': 'orange',
  отказано: 'red',
  аннулировано: 'default',
};

type Props = {
  history?: Purchase['statusHistory'];
  compact?: boolean; // если нужно сжато отображать
};

export const PurchaseStatusTimeline: React.FC<Props> = ({
  history,
  compact,
}) => {
  const items = (history || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(a.changedAt as any).getTime() -
        new Date(b.changedAt as any).getTime()
    )
    .map((h) => {
      const dateText = fmtDate(h.changedAt as any);
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

  if (!items.length) {
    return <div style={{ color: '#999' }}>История статусов отсутствует</div>;
  }

  return <Timeline mode={compact ? 'left' : undefined} items={items as any} />;
};

export default PurchaseStatusTimeline;
