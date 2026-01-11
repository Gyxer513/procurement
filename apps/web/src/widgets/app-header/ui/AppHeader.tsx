import { useMemo, useState } from 'react';
import {
  Button,
  Col,
  Drawer,
  Grid,
  Layout,
  Menu,
  Row,
  Space,
  Typography,
  theme,
} from 'antd';
import type { MenuProps } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@entities/user/model/useCurrentUser';
import { ThemeToggle } from '@features/theme/toggle';
import { LogoutButton } from '@features/logout';
import { useUserRoles } from '@/lib/auth/useUserRoles';
import { hasAnyRole } from '@/lib/auth/roles';
import { Role } from '@/lib/auth/roles';

const { Header } = Layout;

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();

  const isMobile = !screens.md;

  const { login, fullName } = useCurrentUser();

  const roles = useUserRoles();

  const selectedKey = useMemo(
    () => location.pathname.split('/')[1] || 'purchases',
    [location.pathname]
  );

  const items = useMemo<MenuProps['items']>(() => {
    const isSeniorAdmin = hasAnyRole(roles, [Role.SeniorAdmin]);

    return [
      { key: 'purchases', label: 'Закупки' },
      { key: 'reports', label: 'Отчеты' },
      ...(isSeniorAdmin ? [{ key: 'admin', label: 'Админ панель' }] : []),
      ...(isSeniorAdmin
        ? [{ key: 'deleted-purchases', label: 'Удаленные закупки' }]
        : []),
    ];
  }, [roles]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const onMenuClick: MenuProps['onClick'] = (e) => {
    navigate(`/${e.key}`);
    setDrawerOpen(false);
  };

  return (
    <>
      <Header
        style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Row align="middle" justify="space-between" wrap={false} gutter={16}>
          <Col flex="none">
            <Space align="center" size={12}>
              {isMobile && (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Открыть меню"
                />
              )}

              <Typography.Text
                style={{
                  color: token.colorText,
                  fontSize: 18,
                  whiteSpace: 'nowrap',
                }}
              >
                Учет закупок
              </Typography.Text>
            </Space>
          </Col>

          <Col flex="auto">
            {!isMobile && (
              <Menu
                mode="horizontal"
                items={items}
                selectedKeys={[selectedKey]}
                onClick={onMenuClick}
                style={{ background: 'transparent' }}
              />
            )}
          </Col>

          <Col flex="none">
            <Space align="center" size={12}>
              <ThemeToggle />

              {!isMobile && (
                <Space
                  direction="vertical"
                  size={0}
                  style={{ lineHeight: 1.15, maxWidth: 260 }}
                >
                  {fullName && (
                    <Typography.Text style={{ color: token.colorText }}>
                      {fullName}
                    </Typography.Text>
                  )}

                  <Typography.Text
                    type="secondary"
                    ellipsis={{ tooltip: login }}
                    style={{ maxWidth: 260 }}
                  >
                    {login}
                  </Typography.Text>
                </Space>
              )}

              <LogoutButton />
            </Space>
          </Col>
        </Row>
      </Header>

      <Drawer
        title="Меню"
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          items={items}
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
        />
      </Drawer>
    </>
  );
}
