import { Switch } from 'antd';
import { useAppTheme } from '@/app/providers/theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();

  return (
    <Switch
      checked={theme === 'dark'}
      onChange={toggleTheme}
      checkedChildren="Dark"
      unCheckedChildren="Light"
    />
  );
}
