import { Alert, Button, Progress, Skeleton, Table, Tag, Typography } from 'antd';
import {
  ArrowUpOutlined,
  DollarOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import type { RecentSale, StockItem } from '../types/dashboard';
import './DashboardPage.css';

const { Text } = Typography;

const saleColumns = [
  { title: 'Tarih', dataIndex: 'date', key: 'date', width: 100 },
  { title: 'Ürün', dataIndex: 'product', key: 'product', ellipsis: true },
  { title: 'Müşteri', dataIndex: 'customer', key: 'customer', ellipsis: true },
  {
    title: 'Tutar',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
    render: (amount: number) => `₺${amount.toLocaleString('tr-TR')}`,
  },
  {
    title: 'Durum',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => {
      const map: Record<string, { color: string; label: string }> = {
        completed: { color: 'green', label: 'Tamamlandı' },
        pending: { color: 'orange', label: 'Bekliyor' },
        cancelled: { color: 'red', label: 'İptal' },
      };
      const item = map[status] ?? { color: 'default', label: status };
      return <Tag color={item.color}>{item.label}</Tag>;
    },
  },
];

function getStockColor(current: number, min: number): 'danger' | 'warning' | 'safe' {
  if (current <= min) return 'danger';
  if (current <= min * 2) return 'warning';
  return 'safe';
}

function getStockPercent(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((current / max) * 100);
}

export default function DashboardPage() {
  const { stats, recentSales, stockItems, state, retry } = useDashboard();
  const navigate = useNavigate();
  const { businessId } = useParams();

  if (state === 'error') {
    return (
      <Alert
        message="Dashboard verileri yüklenirken hata oluştu"
        type="error"
        showIcon
        action={
          <Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>
            Yeniden Dene
          </Button>
        }
        style={{ borderRadius: 10 }}
      />
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__kpi-grid">
        {state === 'loading' ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="dashboard-page__kpi-card">
                <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="dashboard-page__kpi-card">
              <div className="dashboard-page__kpi-header">
                <span className="dashboard-page__kpi-label">Günlük Ciro</span>
                <span className="dashboard-page__kpi-icon dashboard-page__kpi-icon--red">
                  <DollarOutlined />
                </span>
              </div>
              <div className="dashboard-page__kpi-value">
                ₺{stats?.dailyRevenue?.toLocaleString('tr-TR') ?? '0'}
              </div>
              <div className="dashboard-page__kpi-footer">
                <span className="dashboard-page__kpi-change">
                  <ArrowUpOutlined /> %{stats?.dailyRevenueChange ?? 0} artış
                </span>
              </div>
            </div>

            <div className="dashboard-page__kpi-card">
              <div className="dashboard-page__kpi-header">
                <span className="dashboard-page__kpi-label">Toplam Satış Adedi</span>
                <span className="dashboard-page__kpi-icon dashboard-page__kpi-icon--blue">
                  <ShoppingCartOutlined />
                </span>
              </div>
              <div className="dashboard-page__kpi-value">{stats?.totalSalesCount ?? 0}</div>
              <div className="dashboard-page__kpi-footer">Bugün</div>
            </div>

            <div className="dashboard-page__kpi-card">
              <div className="dashboard-page__kpi-header">
                <span className="dashboard-page__kpi-label">Kritik Stok</span>
                <span className="dashboard-page__kpi-icon dashboard-page__kpi-icon--orange">
                  <WarningOutlined />
                </span>
              </div>
              <div className="dashboard-page__kpi-value">{stats?.criticalStockCount ?? 0}</div>
              <div className="dashboard-page__kpi-footer">
                <Tag color="red" style={{ margin: 0 }}>Stok Az</Tag>
              </div>
            </div>

            <div className="dashboard-page__kpi-card">
              <div className="dashboard-page__kpi-header">
                <span className="dashboard-page__kpi-label">Aktif Kullanıcı</span>
                <span className="dashboard-page__kpi-icon dashboard-page__kpi-icon--green">
                  <TeamOutlined />
                </span>
              </div>
              <div className="dashboard-page__kpi-value">{stats?.activeUserCount ?? 0}</div>
              <div className="dashboard-page__kpi-footer">{stats?.activeUserRole ?? '—'}</div>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-page__content-grid">
        <div className="dashboard-page__card">
          <div className="dashboard-page__card-title">Son Satışlar</div>
          {state === 'loading' ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : (
            <>
              <Table<RecentSale>
                columns={saleColumns}
                dataSource={recentSales}
                rowKey="id"
                pagination={false}
                size="small"
                showHeader={true}
              />
              <div className="dashboard-page__view-all">
                <Button type="link" size="small" onClick={() => navigate(`/${businessId}/sales`)}>
                  Tümünü Gör
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="dashboard-page__card">
          <div className="dashboard-page__card-title">Stok Durumu</div>
          {state === 'loading' ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : (
            stockItems.map((item: StockItem) => {
              const color = getStockColor(item.current, item.min);
              return (
                <div className="dashboard-page__stock-item" key={item.product}>
                  <Text className="dashboard-page__stock-name" ellipsis>
                    {item.product}
                  </Text>
                  <div className="dashboard-page__stock-bar">
                    <Progress
                      percent={getStockPercent(item.current, item.max)}
                      size="small"
                      showInfo={false}
                      strokeColor={color === 'danger' ? '#E32727' : color === 'warning' ? '#F59E0B' : '#22C55E'}
                      trailColor="#F1F5F9"
                    />
                  </div>
                  <Text className={`dashboard-page__stock-count dashboard-page__stock-count--${color}`}>
                    {item.current} / {item.max}
                  </Text>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
