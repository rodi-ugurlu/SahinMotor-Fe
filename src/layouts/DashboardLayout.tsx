import { useState, useEffect } from 'react';
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
  KeyOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNotifications, clearNotifications } from '../shared/notifications';
import { on } from '../shared/events';
import { ProfileModal } from '../components/ProfileModal';
import { PasswordModal } from '../components/PasswordModal';
import { getDealers } from '../features/dealers/services/dealersService';
import type { Dealer } from '../features/dealers/types/dealers';
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
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profile, setProfile] = useState<{ fullName: string; email: string; photoUrl?: string }>({
    fullName: 'Zeynel Şahin',
    email: 'zeynel@sahinmotor.com',
    photoUrl: undefined,
  });
  const [dealer, setDealer] = useState<Dealer | null>(null);

  useEffect(() => {
    const fetchDealer = () => {
      getDealers().then((dealers) => {
        const d = dealers.find((x) => x.id === businessId) ?? null;
        setDealer(d);
      });
    };
    fetchDealer();
    return on('dealerUpdated', fetchDealer);
  }, [businessId]);

  const selectedKey = menuItems.find((item) => location.pathname.includes(`/${item.key}`))?.key ?? 'sales';

  const handleMenuClick = (key: string) => {
    navigate(`/${businessId}/${key}`);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profil' },
    { key: 'password', icon: <KeyOutlined />, label: 'Şifremi Güncelle' },
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
          {dealer?.logoUrl ? (
            <img src={dealer.logoUrl} alt={dealer.name} className="dashboard-layout__logo-img" />
          ) : collapsed ? (
            'SM'
          ) : (
            dealer?.name || 'SahinMotor'
          )}
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
          {collapsed ? (
            <Button
              type="text"
              size="small"
              icon={<SwapOutlined />}
              onClick={() => navigate('/select-business')}
              style={{ color: '#94A3B8' }}
            />
          ) : (
            <>
              <span className="dashboard-layout__switch-label">İşletme Değiştir</span>
              <Button
                type="text"
                size="small"
                icon={<SwapOutlined />}
                onClick={() => navigate('/select-business')}
                style={{ color: '#94A3B8' }}
              />
            </>
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
              {dealer?.name || 'SahinMotor'}
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

            <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => { if (key === 'profile') setProfileOpen(true); if (key === 'password') setPasswordOpen(true); if (key === 'logout') handleLogout(); } }}>
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

      <PasswordModal
        open={passwordOpen}
        onCancel={() => setPasswordOpen(false)}
        onSave={(_password) => {
          setPasswordOpen(false);
        }}
      />
    </Layout>
  );
}
