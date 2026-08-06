import { Alert, Avatar, Button, Skeleton, Typography } from 'antd';
import { LogoutOutlined, ReloadOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useBusinesses } from '../hooks/useBusinesses';
import { BusinessCard } from '../components/BusinessCard';
import type { Business } from '../types/business';
import './BusinessSelectionPage.css';

const { Text } = Typography;

export default function BusinessSelectionPage() {
  const navigate = useNavigate();
  const { businesses, state, retry } = useBusinesses();

  const handleSelect = (business: Business) => {
    navigate(`/${business.id}/dashboard`);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="business-selection">
      <header className="business-selection__header">
        <span className="business-selection__logo">SahinMotor</span>
        <div className="business-selection__user-area">
          <span className="business-selection__user-name">Zeynel</span>
          <Avatar size={36} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>Z</Avatar>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
            Çıkış Yap
          </Button>
        </div>
      </header>

      <div className="business-selection__content">
        <h1 className="business-selection__title">İşletmenizi Seçin</h1>

        {state === 'loading' && (
          <div className="business-selection__grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <Skeleton active avatar={{ size: 80, shape: 'circle' }} paragraph={{ rows: 2 }} title={false} />
              </div>
            ))}
          </div>
        )}

        {state === 'error' && (
          <>
            <Alert
              message="İşletmeler yüklenirken bir hata oluştu"
              type="error"
              showIcon
              action={
                <Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>
                  Yeniden Dene
                </Button>
              }
              style={{ maxWidth: 500, width: '100%', marginBottom: 24, borderRadius: 10 }}
            />
            <div className="business-selection__grid">
              {[1, 2].map((i) => (
                <div key={i} style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', opacity: 0.4 }}>
                  <Skeleton active avatar={{ size: 80, shape: 'circle' }} paragraph={{ rows: 2 }} title={false} />
                </div>
              ))}
            </div>
          </>
        )}

        {state === 'empty' && (
          <div className="business-selection__empty">
            <div className="business-selection__empty-icon">
              <ShopOutlined />
            </div>
            <Text className="business-selection__empty-text">Henüz bir işletme tanımlanmamış</Text>
            <Text className="business-selection__empty-hint">Yöneticinizle iletişime geçerek işletme tanımlaması yapabilirsiniz</Text>
          </div>
        )}

        {state === 'loaded' && (
          <div className="business-selection__grid">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
