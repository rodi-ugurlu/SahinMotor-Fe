import { useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Descriptions,
  Drawer,
  Input,
  Progress,
  Select,
  Skeleton,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  DollarOutlined,
  EyeOutlined,
  InboxOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useTransactions } from '../hooks/useTransactions';
import type { DailyReport, MonthlyReport, ProductReport, ReportPeriod, WeeklyReport } from '../../reports/types/reports';
import type { LogEntry, LogType } from '../../logs/types/logs';
import './TransactionsPage.css';

const { Text } = Typography;

const TYPE_MAP: Record<LogType, { color: string; label: string }> = {
  sales: { color: 'blue', label: 'Satış' },
  stock: { color: 'orange', label: 'Stok' },
  login: { color: 'green', label: 'Giriş' },
  logout: { color: 'red', label: 'Çıkış' },
};

const ROLE_COLORS: Record<string, string> = {
  SuperAdmin: '#E32727', Admin: '#3B82F6', Personel: '#22C55E', Guest: '#94A3B8',
};

const PERIODS: { key: ReportPeriod; label: string }[] = [
  { key: 'daily', label: 'Günlük' },
  { key: 'weekly', label: 'Haftalık' },
  { key: 'monthly', label: 'Aylık' },
];

export default function TransactionsPage() {
  const {
    state, period, summary, daily, weekly, monthly, products,
    totalStockCount, totalStockValue,
    filteredLogs, logSearch, logTypeFilter,
    setPeriod, setLogSearch, setLogTypeFilter, retry,
  } = useTransactions();

  const [detailLog, setDetailLog] = useState<LogEntry | null>(null);
  const [activeView, setActiveView] = useState<'reports' | 'activities'>('reports');

  if (state === 'error') {
    return (
      <Alert
        message="Veriler yüklenirken hata oluştu"
        type="error" showIcon
        action={<Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>Yeniden Dene</Button>}
        style={{ borderRadius: 10 }}
      />
    );
  }

  const isUp = summary ? summary.revenueChange >= 0 : false;
  const maxDaily = Math.max(...daily.map((d) => d.total), 1);
  const maxWeekly = Math.max(...weekly.map((w) => w.totalRevenue), 1);
  const maxMonthly = Math.max(...monthly.map((m) => m.totalRevenue), 1);
  const currentWeek = weekly[0];
  const previousWeek = weekly[1];

  const logColumns = [
    {
      title: 'Tarih', dataIndex: 'date', key: 'date', width: 150,
      sorter: (a: LogEntry, b: LogEntry) => a.date.localeCompare(b.date),
      defaultSortOrder: 'descend' as const,
      render: (date: string) => <Text className="transactions-page__log-date">{date}</Text>,
    },
    {
      title: 'Kullanıcı', key: 'user', width: 160,
      render: (_: unknown, record: LogEntry) => (
        <div className="transactions-page__log-user">
          <Avatar size={28} style={{ backgroundColor: record.user.color, flexShrink: 0 }}>
            {record.user.name.charAt(0)}
          </Avatar>
          <div className="transactions-page__log-user-info">
            <Text className="transactions-page__log-user-name">{record.user.name}</Text>
            <Tag color={ROLE_COLORS[record.user.role] || 'default'} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>
              {record.user.role}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'İşlem', dataIndex: 'type', key: 'type', width: 80,
      render: (type: LogType) => <Tag color={TYPE_MAP[type].color}>{TYPE_MAP[type].label}</Tag>,
    },
    {
      title: 'Modül', dataIndex: 'module', key: 'module', width: 110,
      render: (mod: string) => <Tag>{mod}</Tag>,
    },
    {
      title: 'Açıklama', key: 'description',
      render: (_: unknown, record: LogEntry) => (
        <div className="transactions-page__log-desc">
          <Text className="transactions-page__log-desc-main">{record.description}</Text>
          {record.detail && <Text className="transactions-page__log-desc-detail">{record.detail}</Text>}
        </div>
      ),
    },
    {
      title: 'IP', dataIndex: 'ip', key: 'ip', width: 120, responsive: ['lg' as const],
      render: (ip: string) => <Text className="transactions-page__log-ip">{ip}</Text>,
    },
    {
      title: '', key: 'actions', width: 50,
      render: (_: unknown, record: LogEntry) => (
        <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setDetailLog(record)} />
      ),
    },
  ];

  return (
    <div className="transactions-page">
      <div className="transactions-page__top-bar">
        <div className="transactions-page__title-row">
          <h1 className="transactions-page__title">İşlemler</h1>
          {state === 'loaded' && <Badge count={filteredLogs.length} color="#E32727" />}
        </div>
        <div className="transactions-page__actions">
          <Button type="primary" danger icon={<ReloadOutlined />} onClick={retry}>Güncelle</Button>
        </div>
      </div>

      <div className="transactions-page__view-toggle">
        <button
          className={`transactions-page__view-btn ${activeView === 'reports' ? 'transactions-page__view-btn--active' : ''}`}
          onClick={() => setActiveView('reports')}
        >
          <BarChartOutlined style={{ marginRight: 6 }} />
          Raporlar
        </button>
        <button
          className={`transactions-page__view-btn ${activeView === 'activities' ? 'transactions-page__view-btn--active' : ''}`}
          onClick={() => setActiveView('activities')}
        >
          <EyeOutlined style={{ marginRight: 6 }} />
          Aktiviteler
        </button>
      </div>

      {state === 'loading' ? (
        <>
          <div className="transactions-page__kpi-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="transactions-page__kpi-card">
                <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
              </div>
            ))}
          </div>
          <div className="transactions-page__section">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </>
      ) : activeView === 'activities' ? (
        <div className="transactions-page__section">
          <div className="transactions-page__log-filter-row">
            <Select
              value={logTypeFilter}
              onChange={setLogTypeFilter}
              style={{ width: 160 }}
              size="large"
              options={[
                { value: 'all', label: 'Tüm İşlemler' },
                { value: 'sales', label: 'Satış' },
                { value: 'stock', label: 'Stok' },
                { value: 'login', label: 'Giriş' },
                { value: 'logout', label: 'Çıkış' },
              ]}
            />
            <Input
              prefix={<SearchOutlined />}
              placeholder="Açıklama, kullanıcı veya modül ara..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              style={{ width: 320 }}
              size="large"
              allowClear
            />
          </div>

          <Table<LogEntry>
            columns={logColumns}
            dataSource={filteredLogs}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `Toplam ${t} log` }}
            locale={{ emptyText: 'Filtrelere uygun log bulunamadı' }}
            scroll={{ x: 900 }}
          />
        </div>
      ) : (
        <>
          <div className="transactions-page__kpi-grid">
            <div className="transactions-page__kpi-card transactions-page__kpi-card--revenue">
              <div className="transactions-page__kpi-header">
                <span className="transactions-page__kpi-label">
                  {period === 'daily' ? 'Günlük Ciro' : period === 'weekly' ? 'Haftalık Ciro' : 'Aylık Ciro'}
                </span>
                <div className="transactions-page__kpi-icon transactions-page__kpi-icon--red">
                  <DollarOutlined />
                </div>
              </div>
              <div className="transactions-page__kpi-value">₺{summary?.revenue.toLocaleString('tr-TR') ?? '0'}</div>
              <div className={`transactions-page__kpi-change ${isUp ? 'transactions-page__kpi-change--up' : 'transactions-page__kpi-change--down'}`}>
                {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} %{Math.abs(summary?.revenueChange ?? 0)} {isUp ? 'artış' : 'azalış'}
              </div>
            </div>

            <div className="transactions-page__kpi-card transactions-page__kpi-card--sales">
              <div className="transactions-page__kpi-header">
                <span className="transactions-page__kpi-label">Satış Adedi</span>
                <div className="transactions-page__kpi-icon transactions-page__kpi-icon--blue">
                  <ShoppingCartOutlined />
                </div>
              </div>
              <div className="transactions-page__kpi-value">{summary?.salesCount ?? 0}</div>
              <div className={`transactions-page__kpi-change ${(summary?.salesChange ?? 0) >= 0 ? 'transactions-page__kpi-change--up' : 'transactions-page__kpi-change--down'}`}>
                {(summary?.salesChange ?? 0) >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} %{Math.abs(summary?.salesChange ?? 0)}
              </div>
            </div>

            <div className="transactions-page__kpi-card transactions-page__kpi-card--stock">
              <div className="transactions-page__kpi-header">
                <span className="transactions-page__kpi-label">Toplam Stok</span>
                <div className="transactions-page__kpi-icon transactions-page__kpi-icon--orange">
                  <InboxOutlined />
                </div>
              </div>
              <div className="transactions-page__kpi-value">{totalStockCount.toLocaleString('tr-TR')}</div>
              <div className="transactions-page__kpi-sub">adet ürün</div>
            </div>

            <div className="transactions-page__kpi-card transactions-page__kpi-card--value">
              <div className="transactions-page__kpi-header">
                <span className="transactions-page__kpi-label">Stok Değeri</span>
                <div className="transactions-page__kpi-icon transactions-page__kpi-icon--green">
                  <WalletOutlined />
                </div>
              </div>
              <div className="transactions-page__kpi-value">₺{totalStockValue.toLocaleString('tr-TR')}</div>
              <div className="transactions-page__kpi-sub">toplam stok değeri</div>
            </div>
          </div>

          {/* Period Selector */}
          <div className="transactions-page__period-selector">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                className={`transactions-page__period-btn ${period === p.key ? 'transactions-page__period-btn--active' : ''}`}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="transactions-page__content-grid">
            {/* Sales Table */}
            <div className="transactions-page__section">
              <div className="transactions-page__section-header">
                <div className="transactions-page__section-title">
                  <div className="transactions-page__section-title-icon" style={{ background: '#FFF5F5', color: '#E32727' }}>
                    <ShoppingCartOutlined />
                  </div>
                  {period === 'daily' ? 'Günlük Satışlar' : period === 'weekly' ? 'Haftalık Satışlar' : 'Aylık Satışlar'}
                </div>
              </div>

              {period === 'daily' && (
                <Table<DailyReport>
                  columns={[
                    { title: 'Tarih', dataIndex: 'date', key: 'date', width: 110 },
                    { title: 'Fatura No', dataIndex: 'invoiceNo', key: 'invoiceNo', width: 130 },
                    { title: 'Müşteri', dataIndex: 'customer', key: 'customer', ellipsis: true },
                    { title: 'Adet', dataIndex: 'itemCount', key: 'itemCount', width: 60, align: 'center' as const },
                    { title: 'Tutar', dataIndex: 'total', key: 'total', width: 110, render: (v: number) => <Text strong>₺{v.toLocaleString('tr-TR')}</Text> },
                  ]}
                  dataSource={daily}
                  rowKey="invoiceNo"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  size="small"
                />
              )}

              {period === 'weekly' && (
                <Table<WeeklyReport>
                  columns={[
                    { title: 'Hafta', dataIndex: 'week', key: 'week', width: 100 },
                    { title: 'Satış', dataIndex: 'totalSales', key: 'totalSales', width: 80, align: 'center' as const },
                    { title: 'Ciro', dataIndex: 'totalRevenue', key: 'totalRevenue', width: 130, render: (v: number) => <Text strong>₺{v.toLocaleString('tr-TR')}</Text> },
                    { title: 'Ort. Ciro', dataIndex: 'avgRevenue', key: 'avgRevenue', width: 120, render: (v: number) => <Text>₺{v.toLocaleString('tr-TR')}</Text> },
                  ]}
                  dataSource={weekly}
                  rowKey="week"
                  pagination={false}
                  size="small"
                />
              )}

              {period === 'monthly' && (
                <Table<MonthlyReport>
                  columns={[
                    { title: 'Ay', dataIndex: 'month', key: 'month', width: 90 },
                    { title: 'Satış', dataIndex: 'totalSales', key: 'totalSales', width: 70, align: 'center' as const },
                    { title: 'Ciro', dataIndex: 'totalRevenue', key: 'totalRevenue', width: 130, render: (v: number) => <Text strong>₺{v.toLocaleString('tr-TR')}</Text> },
                    { title: 'Ort. Ciro', dataIndex: 'avgRevenue', key: 'avgRevenue', width: 110, render: (v: number) => <Text>₺{v.toLocaleString('tr-TR')}</Text> },
                    {
                      title: 'Büyüme', dataIndex: 'growth', key: 'growth', width: 90,
                      render: (v: number) => v === 0 ? <Text type="secondary">—</Text> : (
                        <Text style={{ color: v > 0 ? '#22C55E' : '#E32727', fontWeight: 600 }}>
                          {v > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} %{Math.abs(v)}
                        </Text>
                      ),
                    },
                  ]}
                  dataSource={monthly}
                  rowKey="month"
                  pagination={false}
                  size="small"
                />
              )}
            </div>

            {/* Chart */}
            <div className="transactions-page__section">
              <div className="transactions-page__section-header">
                <div className="transactions-page__section-title">
                  <div className="transactions-page__section-title-icon" style={{ background: '#FFF5F5', color: '#E32727' }}>
                    <BarChartOutlined />
                  </div>
                  {period === 'daily' ? 'Son 7 Gün Ciro' : period === 'weekly' ? 'Haftalık Trend' : 'Aylık Trend'}
                </div>
              </div>

              {period === 'daily' && (
                <div className="transactions-page__chart">
                  {daily.map((d) => {
                    const height = Math.max((d.total / maxDaily) * 160, 8);
                    return (
                      <div className="transactions-page__chart-bar-wrap" key={d.invoiceNo}>
                        <div className="transactions-page__chart-value">₺{d.total}</div>
                        <div className="transactions-page__chart-bar" style={{ height }} />
                        <div className="transactions-page__chart-label">{d.date.slice(0, 5)}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {period === 'weekly' && (
                <>
                  <div className="transactions-page__comparison" style={{ marginBottom: 16 }}>
                    <div className="transactions-page__comparison-card transactions-page__comparison-card--current">
                      <div className="transactions-page__comparison-title" style={{ color: '#22C55E' }}>Bu Hafta</div>
                      <div className="transactions-page__comparison-row"><span>Ciro</span><span className="transactions-page__comparison-value">₺{currentWeek?.totalRevenue.toLocaleString('tr-TR')}</span></div>
                      <div className="transactions-page__comparison-row"><span>Satış</span><span className="transactions-page__comparison-value">{currentWeek?.totalSales}</span></div>
                      <div className="transactions-page__comparison-row"><span>Ort. Sepet</span><span className="transactions-page__comparison-value">₺{currentWeek?.avgRevenue.toLocaleString('tr-TR')}</span></div>
                    </div>
                    <div className="transactions-page__comparison-card transactions-page__comparison-card--previous">
                      <div className="transactions-page__comparison-title" style={{ color: '#64748B' }}>Geçen Hafta</div>
                      <div className="transactions-page__comparison-row"><span>Ciro</span><span className="transactions-page__comparison-value">₺{previousWeek?.totalRevenue.toLocaleString('tr-TR')}</span></div>
                      <div className="transactions-page__comparison-row"><span>Satış</span><span className="transactions-page__comparison-value">{previousWeek?.totalSales}</span></div>
                      <div className="transactions-page__comparison-row"><span>Ort. Sepet</span><span className="transactions-page__comparison-value">₺{previousWeek?.avgRevenue.toLocaleString('tr-TR')}</span></div>
                    </div>
                  </div>
                  <div className="transactions-page__chart">
                    {[...weekly].reverse().map((w) => {
                      const height = Math.max((w.totalRevenue / maxWeekly) * 160, 8);
                      return (
                        <div className="transactions-page__chart-bar-wrap" key={w.week}>
                          <div className="transactions-page__chart-value">₺{(w.totalRevenue / 1000).toFixed(1)}k</div>
                          <div className={`transactions-page__chart-bar ${w.week === currentWeek?.week ? 'transactions-page__chart-bar--current' : ''}`} style={{ height }} />
                          <div className="transactions-page__chart-label">{w.week}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {period === 'monthly' && (
                <div className="transactions-page__trend-scroll">
                  {monthly.map((m) => {
                    const height = Math.max((m.totalRevenue / maxMonthly) * 100, 8);
                    const isCurrent = m.month === new Date().toLocaleString('tr-TR', { month: 'long' }).charAt(0).toUpperCase() + new Date().toLocaleString('tr-TR', { month: 'long' }).slice(1);
                    return (
                      <div className={`transactions-page__trend-card ${isCurrent ? 'transactions-page__trend-card--current' : ''}`} key={m.month}>
                        <div className="transactions-page__trend-amount">₺{(m.totalRevenue / 1000).toFixed(1)}k</div>
                        <div className="transactions-page__trend-bar" style={{ height }} />
                        <div className="transactions-page__trend-month">{m.month.slice(0, 3)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Report */}
            <div className="transactions-page__section transactions-page__section--full">
              <div className="transactions-page__section-header">
                <div className="transactions-page__section-title">
                  <div className="transactions-page__section-title-icon" style={{ background: '#FFF5F5', color: '#E32727' }}>
                    <BarChartOutlined />
                  </div>
                  Ürün Bazlı Satış Raporu
                </div>
              </div>
              <Table<ProductReport>
                className="transactions-page__product-table"
                columns={[
                  { title: '#', dataIndex: 'rank', key: 'rank', width: 50, render: (v: number) => <Tag color={v <= 3 ? 'red' : 'default'}>{v}</Tag> },
                  { title: 'Ürün', dataIndex: 'productName', key: 'productName', ellipsis: true },
                  { title: 'Kategori', dataIndex: 'category', key: 'category', width: 120, render: (v: string) => <Tag>{v}</Tag> },
                  { title: 'Adet', dataIndex: 'salesCount', key: 'salesCount', width: 80, align: 'center' as const },
                  { title: 'Ciro', dataIndex: 'totalRevenue', key: 'totalRevenue', width: 130, render: (v: number) => <Text strong>₺{v.toLocaleString('tr-TR')}</Text> },
                  {
                    title: 'Ciro %', dataIndex: 'revenuePercent', key: 'revenuePercent', width: 150,
                    render: (v: number) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Progress percent={v} size="small" strokeColor="#E32727" style={{ flex: 1, margin: 0 }} />
                        <Text style={{ fontSize: 12, minWidth: 36 }}>%{v}</Text>
                      </div>
                    ),
                  },
                ]}
                dataSource={products}
                rowKey="rank"
                pagination={false}
                size="small"
              />
            </div>
          </div>
        </>
      )}

      <Drawer
        title={detailLog ? `İşlem Detayı — ${detailLog.id}` : ''}
        open={!!detailLog}
        onClose={() => setDetailLog(null)}
        width={500}
      >
        {detailLog && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Kullanıcı">
                <div className="transactions-page__log-user">
                  <Avatar size={28} style={{ backgroundColor: detailLog.user.color }}>
                    {detailLog.user.name.charAt(0)}
                  </Avatar>
                  <Text strong>{detailLog.user.name}</Text>
                  <Tag color={ROLE_COLORS[detailLog.user.role] || 'default'}>{detailLog.user.role}</Tag>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="İşlem Tipi">
                <Tag color={TYPE_MAP[detailLog.type].color}>{TYPE_MAP[detailLog.type].label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Modül"><Tag>{detailLog.module}</Tag></Descriptions.Item>
              <Descriptions.Item label="Tarih">{detailLog.date}</Descriptions.Item>
              <Descriptions.Item label="IP Adresi"><Text code>{detailLog.ip}</Text></Descriptions.Item>
              <Descriptions.Item label="Açıklama">{detailLog.description}</Descriptions.Item>
              {detailLog.detail && <Descriptions.Item label="Detay">{detailLog.detail}</Descriptions.Item>}
            </Descriptions>

            {detailLog.changes && detailLog.changes.length > 0 && (
              <>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Değişiklik Detayı</Text>
                <Table
                  columns={[
                    { title: 'Alan', dataIndex: 'field', key: 'field' },
                    { title: 'Önceki', dataIndex: 'oldValue', key: 'oldValue', render: (v: string) => <Text delete style={{ color: '#E32727' }}>{v}</Text> },
                    { title: 'Yeni', dataIndex: 'newValue', key: 'newValue', render: (v: string) => <Text strong style={{ color: '#22C55E' }}>{v}</Text> },
                  ]}
                  dataSource={detailLog.changes}
                  rowKey="field"
                  pagination={false}
                  size="small"
                  className="transactions-page__changes-table"
                />
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
