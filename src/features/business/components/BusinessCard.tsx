import { Avatar, Button, Card, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import type { Business } from '../types/business';

const { Title } = Typography;

interface BusinessCardProps {
  business: Business;
  onSelect: (business: Business) => void;
}

export function BusinessCard({ business, onSelect }: BusinessCardProps) {
  const initial = business.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <Card
      hoverable
      onClick={() => onSelect(business)}
      className="business-card"
      styles={{ body: { padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 } }}
    >
      <Avatar
        src={business.logoUrl}
        size={100}
        style={{
          backgroundColor: business.logoUrl ? 'transparent' : '#E32727',
          border: '2px solid #E2E8F0',
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        {initial}
      </Avatar>

      <Title level={4} style={{ margin: 0, color: '#1E293B', fontSize: 18 }}>
        {business.name}
      </Title>

      <Button
        type="primary"
        danger
        block
        size="large"
        icon={<ArrowRightOutlined />}
        style={{ borderRadius: 8, height: 44, fontWeight: 500 }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(business);
        }}
      >
        Yönet
      </Button>
    </Card>
  );
}
