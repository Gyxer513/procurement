import { ReactNode } from 'react';
import { Space } from 'antd';
import { CopyButton } from './CopyButton';

export function CopyableValue(props: {
  display: ReactNode;
  copyText?: string;
}) {
  const { display, copyText } = props;

  return (
    <Space size={6} wrap>
      <span>{display}</span>
      <CopyButton text={copyText} />
    </Space>
  );
}
