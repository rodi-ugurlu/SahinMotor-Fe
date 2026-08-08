import { useState } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Layout,
  List,
  Menu,
  Popover,
  Typography,
} from 'antd';
import {
  HistoryOutlined,
  IdcardOutlined,
  InboxOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNotifications, clearNotifications } from '../shared/notifications';
import { ProfileModal } from '../components/ProfileModal';
import './DashboardLayout.css';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: 'sales', icon: <ShoppingCartOutlined />, label: 'Satış' },
  { key: 'stock', icon: <InboxOutlined />, label: 'Stok' },
  { key: 'customers', icon: <IdcardOutlined />, label: 'Müşteri' },
  { key: 'dealers', icon: <ShopOutlined />, label: 'Bayi' },
  { key: 'users', icon: <TeamOutlined />, label: 'Kullanıcı' },
  { key: 'transactions', icon: <HistoryOutlined />, label: 'İşlemler' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessId } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const notifications = useNotifications();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<{ fullName: string; email: string; photoUrl?: string }>({
    fullName: 'Zeynel Şahin',
    email: 'zeynel@sahinmotor.com',
    photoUrl: undefined,
  });

  const selectedKey = menuItems.find((item) => location.pathname.includes(`/${item.key}`))?.key ?? 'sales';

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
          <Avatar
            size={32}
            src={profile.photoUrl}
            icon={!profile.photoUrl ? <UserOutlined /> : undefined}
            style={{ backgroundColor: profile.photoUrl ? 'transparent' : 'rgba(255,255,255,0.2)' }}
          />
          {!collapsed && (
            <div className="dashboard-layout__user-info">
              <div className="dashboard-layout__user-name">{profile.fullName}</div>
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
            <Popover
              trigger="click"
              placement="bottomRight"
              content={
                <div style={{ width: 320 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 14 }}>Bildirimler</Text>
                    {notifications.length > 0 && (
                      <Button type="link" size="small" onClick={clearNotifications} style={{ fontSize: 12 }}>
                        Temizle
                      </Button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <Text type="secondary" style={{ fontSize: 13 }}>Henüz bildirim yok</Text>
                  ) : (
                    <List
                      style={{ maxHeight: 300, overflow: 'auto' }}
                      dataSource={notifications.slice(0, 8)}
                      renderItem={(n) => (
                        <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }} onClick={() => navigate(`/${businessId}/transactions`)}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                            <Text style={{ fontSize: 13 }}>{n.message}</Text>
                            <Text style={{ fontSize: 11, color: '#94A3B8' }}>{n.time}</Text>
                          </div>
                        </List.Item>
                      )}
                    />
                  )}
                  {notifications.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                      <Button type="link" size="small" onClick={() => navigate(`/${businessId}/transactions`)}>
                        Tüm Aktiviteleri Gör
                      </Button>
                    </div>
                  )}
                </div>
              }
            >
              <Badge count={notifications.length} size="small" offset={[-2, 2]}>
                <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
              </Badge>
            </Popover>

            <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => { if (key === 'profile') setProfileOpen(true); if (key === 'logout') handleLogout(); } }}>
              <Avatar
                size={32}
                src={profile.photoUrl}
                icon={!profile.photoUrl ? <UserOutlined /> : undefined}
                style={{ backgroundColor: profile.photoUrl ? 'transparent' : '#E32727', cursor: 'pointer' }}
              />
            </Dropdown>
          </div>
        </Header>

        <Content className="dashboard-layout__content">
          <Outlet />
        </Content>
      </Layout>

      <ProfileModal
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        onSave={(values) => {
          setProfile(values);
          setProfileOpen(false);
        }}
        initialData={profile}
      />
    </Layout>
  );
}
