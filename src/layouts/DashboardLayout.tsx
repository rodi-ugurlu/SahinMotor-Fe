import { useState } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Layout,
  Menu,
  Typography,
} from 'antd';
import {
  BarChartOutlined,
  DashboardOutlined,
  FileTextOutlined,
  InboxOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import './DashboardLayout.css';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'sales', icon: <ShoppingCartOutlined />, label: 'Satış' },
  { key: 'stock', icon: <InboxOutlined />, label: 'Stok Yönetimi' },
  { key: 'reports', icon: <BarChartOutlined />, label: 'Raporlama' },
  { key: 'logs', icon: <FileTextOutlined />, label: 'Loglama' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessId } = useParams();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = menuItems.find((item) => location.pathname.includes(`/${item.key}`))?.key ?? 'dashboard';

  const handleMenuClick = (key: string) => {
    navigate(`/${businessId}/${key}`);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profil' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Çıkış Yap', danger: true },
  ];

  return (
    <Layout className="dashboard-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        trigger={null}
        breakpoint="lg"
        collapsedWidth={64}
      >
        <div className={`dashboard-layout__logo ${collapsed ? 'dashboard-layout__logo-collapsed' : ''}`}>
          {collapsed ? 'SM' : 'SahinMotor'}
        </div>

        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          style={{ marginTop: 8 }}
        />

        <div className="dashboard-layout__sider-bottom">
          <Avatar size={32} icon={<UserOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          {!collapsed && (
            <div className="dashboard-layout__user-info">
              <div className="dashboard-layout__user-name">Zeynel</div>
              <div className="dashboard-layout__user-role">SuperAdmin</div>
            </div>
          )}
          {!collapsed && (
            <Button
              type="text"
              size="small"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: '#94A3B8' }}
            />
          )}
        </div>
      </Sider>

      <Layout>
        <Header className="dashboard-layout__header">
          <div className="dashboard-layout__header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Text className="dashboard-layout__business-name">
              {businessId === 'sahin-motor' ? 'Şahin Motor' : 'Koman Motor'}
            </Text>
          </div>

          <div className="dashboard-layout__header-right">
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>

            <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => key === 'logout' && handleLogout() }}>
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#E32727', cursor: 'pointer' }}
              />
            </Dropdown>
          </div>
        </Header>

        <Content className="dashboard-layout__content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
