import {
  Alert,
  Button,
  Progress,
  Skeleton,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useReports } from '../hooks/useReports';
import type { DailyReport, MonthlyReport, ProductReport, ReportPeriod, WeeklyReport } from '../types/reports';
import './ReportsPage.css';

const { Text } = Typography;

export default function ReportsPage() {
  const { period, summary, daily, weekly, monthly, products, state, setPeriod, retry } = useReports();

  const renderKpiCards = () => {
    if (!summary) return null;
    const isUp = summary.revenueChange >= 0;
    return (
      <div className="reports-page__kpi-grid">
        <div className="reports-page__kpi-card">
          <div className="reports-page__kpi-label">
            {period === 'daily' ? 'Günlük Ciro' : period === 'weekly' ? 'Haftalık Ciro' : 'Aylık Ciro'}
          </div>
          <div className="reports-page__kpi-value reports-page__kpi-value--red">
            ₺{summary.revenue.toLocaleString('tr-TR')}
          </div>
          <div className={`reports-page__kpi-change ${isUp ? 'reports-page__kpi-change--up' : 'reports-page__kpi-change--down'}`}>
            {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} %{Math.abs(summary.revenueChange)} {isUp ? 'artış' : 'azalış'}
          </div>
        </div>

        <div className="reports-page__kpi-card">
          <div className="reports-page__kpi-label">Satış Adedi</div>
          <div className="reports-page__kpi-value">{summary.salesCount}</div>
          <div className={`reports-page__kpi-change ${summary.salesChange >= 0 ? 'reports-page__kpi-change--up' : 'reports-page__kpi-change--down'}`}>
            {summary.salesChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} %{Math.abs(summary.salesChange)}
          </div>
        </div>

        <div className="reports-page__kpi-card">
          <div className="reports-page__kpi-label">Ortalama Sepet</div>
          <div className="reports-page__kpi-value">₺{summary.avgBasket.toLocaleString('tr-TR')}</div>
          <div className="reports-page__kpi-sub">İşlem başına</div>
        </div>

        <div className="reports-page__kpi-card">
          <div className="reports-page__kpi-label">
            {period === 'daily' ? 'En Çok Satan Ürün' : 'En Çok Satan Kategori'}
          </div>
          <div className="reports-page__kpi-value" style={{ fontSize: 16 }}>
            {summary.topItem}
          </div>
        </div>
      </div>
    );
  };

  const renderDailyTab = () => {
    const maxRevenue = Math.max(...daily.map((d) => d.total), 1);
    return (
      <>
        <div className="reports-page__section">
          <div className="reports-page__section-title">Günlük Satışlar</div>
          <Table<DailyReport>
            columns={[
              { title: 'Tarih', dataIndex: 'date', key: 'date', width: 120 },
              { title: 'Satış No', dataIndex: 'invoiceNo', key: 'invoiceNo', width: 140 },
              { title: 'Müşteri', dataIndex: 'customer', key: 'customer' },
              { title: 'Ürün Adedi', dataIndex: 'itemCount', key: 'itemCount', width: 100, align: 'center' as const },
              { title: 'Toplam Tutar', dataIndex: 'total', key: 'total', width: 130, render: (v: number) => <Text strong>₺{v.toLocaleString('tr-TR')}</Text> },
            ]}
            dataSource={daily}
            rowKey="invoiceNo"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            size="small"
          />
        </div>

        <div className="reports-page__section">
          <div className="reports-page__section-title">Son 7 Gün Ciro Grafiği</div>
          <div className="reports-page__chart-bars">
            {daily.map((d) => {
              const height = Math.max((d.total / maxRevenue) * 180, 8);
              return (
                <div className="reports-page__chart-bar-wrap" key={d.invoiceNo}>
                  <div className="reports-page__chart-value">₺{d.total}</div>
                  <div className="reports-page__chart-bar" style={{ height }} />
                  <div className="reports-page__chart-label">{d.date.slice(0, 5)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const renderWeeklyTab = () => {
    const maxRevenue = Math.max(...weekly.map((w) => w.totalRevenue), 1);
    const currentWeek = weekly[0];
    const previousWeek = weekly[1];
    return (
      <>
        <div className="reports-page__section">
          <div className="reports-page__section-title">Haftalık Rapor</div>
          <Table<WeeklyReport>
            columns={[
              { title: 'Hafta', dataIndex: 'week', key: 'week', width: 120 },
              { title: 'Toplam Satış', dataIndex: 'totalSales', key: 'totalSales', width: 120, align: 'center' as const },
              { title: 'Toplam Ciro', dataIndex: 'totalRevenue', key: 'totalRevenue', width: 150, render: (v: number) => <Text strong>₺{v.toLocaleString('tr-TR')}</Text> },
              { title: 'Ortalama Ciro', dataIndex: 'avgRevenue', key: 'avgRevenue', width: 150, render: (v: number) => <Text>₺{v.toLocaleString('tr-TR')}</Text> },
            ]}
            dataSource={weekly}
            rowKey="week"
            pagination={false}
            size="small"
          />
        </div>

        <div className="reports-page__comparison">
          <div className="reports-page__comparison-card reports-page__comparison-card--current">
            <div className="reports-page__comparison-title" style={{ color: '#22C55E' }}>Bu Hafta</div>
            <div className="reports-page__comparison-row"><span>Ciro</span><span className="reports-page__comparison-value">₺{currentWeek?.totalRevenue.toLocaleString('tr-TR')}</span></div>
            <div className="reports-page__comparison-row"><span>Satış Adedi</span><span className="reports-page__comparison-value">{currentWeek?.totalSales}</span></div>
            <div className="reports-page__comparison-row"><span>Ortalama Sepet</span><span className="reports-page__comparison-value">₺{currentWeek?.avgRevenue.toLocaleString('tr-TR')}</span></div>
          </div>
          <div className="reports-page__comparison-card reports-page__comparison-card--previous">
            <div className="reports-page__comparison-title" style={{ color: '#64748B' }}>Geçen Hafta</div>
            <div className="reports-page__comparison-row"><span>Ciro</span><span className="reports-page__comparison-value">₺{previousWeek?.totalRevenue.toLocaleString('tr-TR')}</span></div>
            <div className="reports-page__comparison-row"><span>Satış Adedi</span><span className="reports-page__comparison-value">{previousWeek?.totalSales}</span></div>
            <div className="reports-page__comparison-row"><span>Ortalama Sepet</span><span className="reports-page__comparison-value">₺{previousWeek?.avgRevenue.toLocaleString('tr-TR')}</span></div>
          </div>
        </div>

        <div className="reports-page__section">
          <div className="reports-page__section-title">Haftalık Ciro Trendi</div>
          <div className="reports-page__chart-bars">
            {[...weekly].reverse().map((w) => {
              const height = Math.max((w.totalRevenue / maxRevenue) * 180, 8);
              return (
                <div className="reports-page__chart-bar-wrap" key={w.week}>
                  <div className="reports-page__chart-value">₺{(w.totalRevenue / 1000).toFixed(1)}k</div>
                  <div className={`reports-page__chart-bar ${w.week === currentWeek?.week ? 'reports-page__chart-bar--current' : ''}`} style={{ height }} />
                  <div className="reports-page__chart-label">{w.week}</div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const renderMonthlyTab = () => {
    const maxRevenue = Math.max(...monthly.map((m) => m.totalRevenue), 1);
    return (
      <>
        <div className="reports-page__section">
          <div className="reports-page__section-title">Aylık Rapor</div>
          <Table<MonthlyReport>
            columns={[
              { title: 'Ay', dataIndex: 'month', key: 'month', width: 100 },
              { title: 'Toplam Satış', dataIndex: 'totalSales', key: 'totalSales', width: 110, align: 'center' as const },
              { title: 'Toplam Ciro', dataIndex: 'totalRevenue', key: 'totalRevenue', width: 140, render: (v: number) => <Text strong>₺{v.toLocaleString('tr-TR')}</Text> },
              { title: 'Ortalama Ciro', dataIndex: 'avgRevenue', key: 'avgRevenue', width: 130, render: (v: number) => <Text>₺{v.toLocaleString('tr-TR')}</Text> },
              {
                title: 'Büyüme',
                dataIndex: 'growth',
                key: 'growth',
                width: 100,
                render: (v: number) =>
                  v === 0 ? <Text type="secondary">—</Text> : (
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
        </div>

        <div className="reports-page__section">
          <div className="reports-page__section-title">Aylık Ciro Trendi</div>
          <div className="reports-page__trend-scroll">
            {monthly.map((m) => {
              const height = Math.max((m.totalRevenue / maxRevenue) * 100, 8);
              const isCurrent = m.month === new Date().toLocaleString('tr-TR', { month: 'long' }).charAt(0).toUpperCase() + new Date().toLocaleString('tr-TR', { month: 'long' }).slice(1);
              return (
                <div className={`reports-page__trend-card ${isCurrent ? 'reports-page__trend-card--current' : ''}`} key={m.month}>
                  <div className="reports-page__trend-amount">₺{(m.totalRevenue / 1000).toFixed(1)}k</div>
                  <div className="reports-page__trend-bar" style={{ height }} />
                  <div className="reports-page__trend-month">{m.month.slice(0, 3)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const renderProductReport = () => (
    <div className="reports-page__section">
      <div className="reports-page__section-title">Ürün Bazlı Satış Raporu</div>
      <Table<ProductReport>
        columns={[
          { title: 'Sıra', dataIndex: 'rank', key: 'rank', width: 60, render: (v: number) => <Tag color={v <= 3 ? 'red' : 'default'}>{v}</Tag> },
          { title: 'Ürün Adı', dataIndex: 'productName', key: 'productName', ellipsis: true },
          { title: 'Kategori', dataIndex: 'category', key: 'category', width: 120, render: (v: string) => <Tag>{v}</Tag> },
          { title: 'Satış Adedi', dataIndex: 'salesCount', key: 'salesCount', width: 100, align: 'center' as const },
          { title: 'Toplam Ciro', dataIndex: 'totalRevenue', key: 'totalRevenue', width: 140, render: (v: number) => <Text strong>₺{v.toLocaleString('tr-TR')}</Text> },
          {
            title: 'Ciro %',
            dataIndex: 'revenuePercent',
            key: 'revenuePercent',
            width: 150,
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
  );

  if (state === 'error') {
    return (
      <Alert
        message="Rapor verileri yüklenirken hata oluştu"
        type="error" showIcon
        action={<Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>Yeniden Dene</Button>}
        style={{ borderRadius: 10 }}
      />
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-page__top-bar">
        <h1 className="reports-page__title">Raporlama</h1>
        <div className="reports-page__actions">
          <Button type="primary" danger icon={<ReloadOutlined />} onClick={retry}>
            Raporu Güncelle
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={period}
        onChange={(key) => setPeriod(key as ReportPeriod)}
        style={{ marginBottom: 16 }}
        items={[
          { key: 'daily', label: 'Günlük' },
          { key: 'weekly', label: 'Haftalık' },
          { key: 'monthly', label: 'Aylık' },
        ]}
      />

      {state === 'loading' ? (
        <>
          <div className="reports-page__kpi-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="reports-page__kpi-card">
                <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
              </div>
            ))}
          </div>
          <div className="reports-page__section">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </>
      ) : (
        <>
          {renderKpiCards()}
          {period === 'daily' && renderDailyTab()}
          {period === 'weekly' && renderWeeklyTab()}
          {period === 'monthly' && renderMonthlyTab()}
          {renderProductReport()}
        </>
      )}
    </div>
  );
}
