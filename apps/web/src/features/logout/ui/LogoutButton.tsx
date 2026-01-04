import { Button } from 'antd';
import { keycloak } from '@/auth/keycloak';

export function LogoutButton() {
  const onLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return <Button onClick={onLogout}>Выйти</Button>;
}
