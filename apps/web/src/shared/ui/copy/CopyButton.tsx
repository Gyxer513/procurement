import { Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

export function CopyButton(props: { text?: string }) {
  const { text } = props;
  if (!text) return null;

  return (
    <Button
      type="text"
      size="small"
      icon={<CopyOutlined />}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        message.success('Скопировано');
      }}
    />
  );
}
