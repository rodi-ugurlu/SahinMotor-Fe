import { useState } from 'react';
import {
  Alert,
  Avatar,
  Button,

  Divider,
  Input,
  Modal,
  Popover,
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
  ClockCircleOutlined,

  CreditCardOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,

  InboxOutlined,
  InfoCircleOutlined,
  MoneyCollectOutlined,
  PrinterOutlined,
  ReloadOutlined,
  RiseOutlined,
  SearchOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
} from '@ant-design/icons';

import { useTransactions } from '../hooks/useTransactions';
import type { ProductReport, ReportPeriod } from '../../reports/types/reports';

import type { LogEntry, LogType } from '../../logs/types/logs';
import './TransactionsPage.css';

const { Text } = Typography;

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function formatTurkishDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes('.')) return dateStr;
  const parts = dateStr.split('.');
  if (parts.length < 2) return dateStr;
  const day = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  if (isNaN(day) || monthIdx < 0 || monthIdx >= 12) return dateStr;
  return `${day} ${TURKISH_MONTHS[monthIdx]}`;
}

const TYPE_MAP: Record<LogType, { color: string; label: string; bg: string }> = {
  sales: { color: '#3B82F6', label: 'Satış', bg: '#EFF6FF' },
  stock: { color: '#F59E0B', label: 'Stok', bg: '#FFFBEB' },
  login: { color: '#22C55E', label: 'Giriş', bg: '#F0FDF4' },
  logout: { color: '#EF4444', label: 'Çıkış', bg: '#FEF2F2' },
};

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  SuperAdmin: { bg: '#FEF2F2', color: '#E32727', border: '#FCA5A5' },
  Admin: { bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE' },
  Personel: { bg: '#F0FDF4', color: '#22C55E', border: '#BBF7D0' },
  Guest: { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' },
};

const PAYMENT_METHOD_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  kart: { label: 'Kredi Kartı', icon: <CreditCardOutlined />, color: '#3B82F6' },
  nakit: { label: 'Nakit', icon: <MoneyCollectOutlined />, color: '#22C55E' },
  havale: { label: 'Banka Havalesi', icon: <WalletOutlined />, color: '#8B5CF6' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  bitti: { label: 'Tamamlandı', color: 'success' },
  beklemede: { label: 'Bekliyor', color: 'warning' },
  taslak: { label: 'Taslak', color: 'default' },
  iptal: { label: 'İptal Edildi', color: 'error' },
};

export default function TransactionsPage() {
  const {
    state,
    period,
    summary,

    daily,
    weekly,
    monthly,
    products,
    totalStockCount,
    totalStockValue,
    selectedSale,

    isInvoiceModalOpen,
    filteredLogs,
    logSearch,
    logTypeFilter,
    logUserFilter,
    setPeriod,
    setLogSearch,
    setLogTypeFilter,
    setLogUserFilter,
    openInvoiceModal,
    closeInvoiceModal,
    exportToCSV,
    retry,
  } = useTransactions();

  const [activeView, setActiveView] = useState<'reports' | 'activities'>('reports');
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);

  if (state === 'error') {
    return (
      <Alert
        message="İşlem ve Rapor Verileri Yüklenemedi"
        description="Sunucudan veriler çekilirken bir bağlantı hatası oluştu. Lütfen tekrar deneyiniz."
        type="error"
        showIcon
        action={<Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>Yeniden Dene</Button>}
        style={{ borderRadius: 12, padding: 16 }}
      />
    );
  }

  const isUp = summary ? summary.revenueChange >= 0 : true;

  // Chart data calculations
  const maxDaily = Math.max(...daily.map((d) => d.total), 1);
  const maxWeekly = Math.max(...weekly.map((w) => w.totalRevenue), 1);
  const maxMonthly = Math.max(...monthly.map((m) => m.totalRevenue), 1);

  // Peak day logic
  const peakDailyDay = daily.reduce((prev, current) => (prev.total > current.total ? prev : current), daily[0] || { total: 0, date: '-' });

  // Log Columns with Expandable Row Diff Support
  const logColumns = [
    {
      title: 'Zaman',
      dataIndex: 'date',
      key: 'date',
      width: 185,
      sorter: (a: LogEntry, b: LogEntry) => a.date.localeCompare(b.date),
      defaultSortOrder: 'descend' as const,
      render: (date: string) => (
        <div className="transactions-page__log-time-cell">
          <ClockCircleOutlined style={{ color: '#94A3B8', fontSize: 12 }} />
          <Text className="transactions-page__log-date" style={{ whiteSpace: 'nowrap' }}>{date}</Text>
        </div>
      ),
    },
    {
      title: 'Kullanıcı',
      key: 'user',
      width: 200,
      render: (_: unknown, record: LogEntry) => {
        const roleStyle = ROLE_COLORS[record.user.role] || ROLE_COLORS.Guest;
        return (
          <div className="transactions-page__log-user">
            <Avatar size={32} style={{ backgroundColor: record.user.color, fontWeight: 600, flexShrink: 0 }}>
              {record.user.name.charAt(0)}
            </Avatar>
            <div className="transactions-page__log-user-info">
              <Text className="transactions-page__log-user-name">{record.user.name}</Text>
              <Tag
                style={{
                  fontSize: 10,
                  lineHeight: '16px',
                  padding: '0 6px',
                  backgroundColor: roleStyle.bg,
                  color: roleStyle.color,
                  borderColor: roleStyle.border,
                  borderRadius: 4,
                }}
              >
                {record.user.role}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: 'İşlem Türü',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: LogType) => {
        const item = TYPE_MAP[type] || { color: '#64748B', label: type, bg: '#F8FAFC' };
        return (
          <span className="transactions-page__type-pill" style={{ color: item.color, backgroundColor: item.bg }}>
            <span className="transactions-page__type-dot" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        );
      },
    },
    {
      title: 'İşlem Açıklaması',
      key: 'description',
      render: (_: unknown, record: LogEntry) => {
        const detailText = record.changes && record.changes.length > 0
          ? record.changes.map((c) => `${c.field}: ${c.oldValue} ➔ ${c.newValue}`).join(', ')
          : record.detail;

        return (
          <div className="transactions-page__log-desc">
            <Text className="transactions-page__log-desc-main">{record.description}</Text>
            {detailText && <Text className="transactions-page__log-desc-detail">{detailText}</Text>}
          </div>
        );
      },
    },

  ];


  return (
    <div className="transactions-page">
      {/* 🚀 Top Bar / Action Hub */}
      <div className="transactions-page__top-bar">
        <div className="transactions-page__title-group">
          <h1 className="transactions-page__title">İşlem Geçmişi & Raporlar</h1>
        </div>



        <div className="transactions-page__actions">
          {activeView === 'activities' && (
            <Button icon={<DownloadOutlined />} onClick={exportToCSV} className="transactions-page__export-btn">
              CSV Dışa Aktar
            </Button>
          )}

          <Button
            type="primary"
            danger
            icon={<ReloadOutlined spin={state === 'loading'} />}
            onClick={retry}
            className="transactions-page__refresh-btn"
          >
            Verileri Güncelle
          </Button>

        </div>
      </div>

      {/* 🧭 View Switcher Tabs */}
      <div className="transactions-page__view-toggle-bar">
        <div className="transactions-page__view-toggle">
          <button
            className={`transactions-page__view-btn ${activeView === 'reports' ? 'transactions-page__view-btn--active' : ''}`}
            onClick={() => setActiveView('reports')}
          >
            <BarChartOutlined style={{ fontSize: 16 }} />
            Finansal Raporlar & Analiz
          </button>
          <button
            className={`transactions-page__view-btn ${activeView === 'activities' ? 'transactions-page__view-btn--active' : ''}`}
            onClick={() => setActiveView('activities')}
          >
            <EyeOutlined style={{ fontSize: 16 }} />
            Aktiviteler
          </button>
        </div>

        {activeView === 'reports' && (
          <div className="transactions-page__period-selector">
            {(['daily', 'weekly', 'monthly'] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                className={`transactions-page__period-btn ${period === p ? 'transactions-page__period-btn--active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p === 'daily' ? 'Günlük' : p === 'weekly' ? 'Haftalık' : 'Aylık'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton View */}
      {state === 'loading' ? (
        <div className="transactions-page__loading-container">
          <div className="transactions-page__kpi-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="transactions-page__kpi-card">
                <Skeleton active paragraph={{ rows: 2 }} title={{ width: '40%' }} />
              </div>
            ))}
          </div>
          <div className="transactions-page__section" style={{ marginTop: 20 }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        </div>
      ) : activeView === 'activities' ? (
        /* 📜 ACTIVITIES VIEW */
        <div className="transactions-page__section transactions-page__section--activities">
          <div className="transactions-page__log-header-row">
            <div>
              <h3 className="transactions-page__section-heading">Aktiviteler</h3>
              <p className="transactions-page__section-subtext">
                Tüm kullanıcı hareketleri, stok güncellemeleri ve satış işlemleri detaylıca kayıt altına alınır.
              </p>
            </div>
          </div>


          {/* Filter Bar */}
          <div className="transactions-page__log-filter-row">
            <Select
              value={logTypeFilter}
              onChange={setLogTypeFilter}
              style={{ width: 220 }}
              size="large"
              suffixIcon={<FilterOutlined />}
              options={[
                { value: 'all', label: 'Tüm İşlem Türleri' },
                { value: 'sales', label: 'Satış İşlemleri' },
                { value: 'stockEntry', label: 'Mal Kabul İşlemleri' },
                { value: 'stock', label: 'Stok İşlemleri' },
                { value: 'waste', label: 'Atık Ürün İşlemleri' },
              ]}
            />


            <Select
              value={logUserFilter}
              onChange={setLogUserFilter}
              style={{ width: 160 }}
              size="large"
              options={[
                { value: 'all', label: 'Tüm Kullanıcılar' },
                { value: 'Zeynel', label: 'Zeynel' },
                { value: 'Ayşe', label: 'Ayşe' },
                { value: 'Abdullah', label: 'Abdullah' },
                { value: 'Maliyeci', label: 'Maliyeci' },
              ]}
            />

            <Input
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              placeholder="Açıklama, müşteri veya detay ara..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              style={{ flex: 1, minWidth: 260 }}
              size="large"
              allowClear
            />
          </div>

          {/* Table */}
          <Table<LogEntry>
            columns={logColumns}
            dataSource={filteredLogs}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (_t, range) => `Bu sayfada ${range[0]}-${range[1]} gösteriliyor`,
            }}


            locale={{
              emptyText: (
                <div className="transactions-page__empty-state">
                  <InfoCircleOutlined style={{ fontSize: 32, color: '#94A3B8' }} />
                  <p>Arama veya filtre kriterlerinize uygun sistem kaydı bulunamadı.</p>
                </div>
              ),
            }}
            scroll={{ x: 950 }}
            className="transactions-page__log-table"
          />

        </div>
      ) : (
        /* 📊 FINANCIAL REPORTS & METRICS VIEW */
        <>
          {/* 💎 Premium KPI Cards */}
          <div className="transactions-page__kpi-grid">
            {/* Card 1: Revenue */}
            <div className="transactions-page__kpi-card transactions-page__kpi-card--revenue">
              <div className="transactions-page__kpi-header">
                <span className="transactions-page__kpi-label">Ciro</span>
                <div className="transactions-page__kpi-icon transactions-page__kpi-icon--red">
                  <WalletOutlined />
                </div>
              </div>
              <div className="transactions-page__kpi-value">
                ₺{summary?.revenue.toLocaleString('tr-TR') ?? '0'}
              </div>
              <div className="transactions-page__kpi-footer">
                <div className={`transactions-page__kpi-change ${isUp ? 'transactions-page__kpi-change--up' : 'transactions-page__kpi-change--down'}`}>
                  {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} %{Math.abs(summary?.revenueChange ?? 0)}
                </div>
                <span className="transactions-page__kpi-subtext">önceki döneme göre</span>
              </div>
            </div>

            {/* Card 2: Sales Count */}
            <div className="transactions-page__kpi-card transactions-page__kpi-card--sales">
              <div className="transactions-page__kpi-header">
                <span className="transactions-page__kpi-label">Tamamlanan Satış</span>
                <div className="transactions-page__kpi-icon transactions-page__kpi-icon--blue">
                  <ShoppingCartOutlined />
                </div>
              </div>
              <div className="transactions-page__kpi-value">
                {summary?.salesCount ?? 0} <span className="transactions-page__kpi-unit">satış</span>
              </div>
              <div className="transactions-page__kpi-footer">
                <span className="transactions-page__kpi-subtext">toplam satış adedi</span>
              </div>
            </div>

            {/* Card 3: Total Stock Items */}
            <div className="transactions-page__kpi-card transactions-page__kpi-card--stock">
              <div className="transactions-page__kpi-header">
                <span className="transactions-page__kpi-label">Toplam Stok</span>
                <div className="transactions-page__kpi-icon transactions-page__kpi-icon--orange">
                  <InboxOutlined />
                </div>
              </div>
              <div className="transactions-page__kpi-value">
                {totalStockCount.toLocaleString('tr-TR')} <span className="transactions-page__kpi-unit">adet</span>
              </div>
              <div className="transactions-page__kpi-footer">
                <span className="transactions-page__kpi-subtext">toplam envanter adedi</span>
              </div>
            </div>


            {/* Card 4: Total Inventory Value */}
            <div className="transactions-page__kpi-card transactions-page__kpi-card--value">
              <div className="transactions-page__kpi-header">
                <span className="transactions-page__kpi-label">Stok Değeri</span>
                <div className="transactions-page__kpi-icon transactions-page__kpi-icon--green">
                  <MoneyCollectOutlined />
                </div>
              </div>
              <div className="transactions-page__kpi-value">
                ₺{totalStockValue.toLocaleString('tr-TR')}
              </div>
              <div className="transactions-page__kpi-footer">
                <span className="transactions-page__kpi-subtext">mevcut stok değeri</span>
              </div>
            </div>
          </div>


          {/* 📈 Content Grid: Charts & Sales Tables */}
          <div className="transactions-page__content-grid">
            {/* Left Box: Top Selling Products Table */}
            <div className="transactions-page__section">
              <div className="transactions-page__section-header">
                <div className="transactions-page__section-title">
                  <div className="transactions-page__section-title-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                    <BarChartOutlined />
                  </div>
                  <div>
                    <span>En Çok Satan 5 Ürün</span>
                    <div className="transactions-page__section-subtitle">Satış hacmine göre sıralanmıştır</div>
                  </div>
                </div>
              </div>

              <Table<ProductReport>
                columns={[
                  {
                    title: 'Sıra',
                    dataIndex: 'rank',
                    key: 'rank',
                    width: 60,
                    align: 'center' as const,
                    render: (rank: number) => {
                      const medalColors: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
                      return rank <= 3 ? (
                        <Tag color={medalColors[rank]} style={{ color: '#0F172A', fontWeight: 700, borderRadius: 12, padding: '0 6px' }}>
                          #{rank}
                        </Tag>
                      ) : (
                        <Text type="secondary">#{rank}</Text>
                      );
                    },
                  },
                  {
                    title: 'Ürün Adı',
                    dataIndex: 'productName',
                    key: 'productName',
                    ellipsis: true,
                    render: (name: string) => <Text strong style={{ color: '#1E293B' }}>{name}</Text>,
                  },
                  {
                    title: 'Satış Adedi',
                    dataIndex: 'salesCount',
                    key: 'salesCount',
                    width: 100,
                    align: 'center' as const,
                    render: (count: number) => <Tag color="cyan">{count} Adet</Tag>,
                  },
                  {
                    title: 'Toplam Ciro',
                    dataIndex: 'totalRevenue',
                    key: 'totalRevenue',
                    width: 120,
                    align: 'right' as const,
                    render: (rev: number) => <Text strong style={{ color: '#22C55E' }}>₺{rev.toLocaleString('tr-TR')}</Text>,
                  },
                ]}
                dataSource={products.slice(0, 5)}
                rowKey="rank"
                pagination={false}
                size="middle"
              />
            </div>

            {/* Right Box: Interactive Visual Chart Engine */}
            <div className="transactions-page__section">
              <div className="transactions-page__section-header">
                <div className="transactions-page__section-title">
                  <div className="transactions-page__section-title-icon" style={{ background: '#F0FDF4', color: '#22C55E' }}>
                    <RiseOutlined />
                  </div>
                  <div>
                    <span>{period === 'daily' ? 'Günlük Ciro Grafiği' : period === 'weekly' ? 'Haftalık Ciro Grafiği' : 'Aylık Ciro Grafiği'}</span>
                    <div className="transactions-page__section-subtitle">
                      En yüksek ciro: <strong style={{ color: '#E32727' }}>{formatTurkishDate(peakDailyDay?.date || '')} (₺{peakDailyDay?.total.toLocaleString('tr-TR')})</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom High-Quality Interactive Visual Bar Chart */}
              {period === 'daily' && (
                <div className="transactions-page__chart-container">
                  <div className="transactions-page__chart-gridlines">
                    <span className="transactions-page__grid-label">₺{maxDaily}</span>
                    <span className="transactions-page__grid-label">₺{Math.round(maxDaily / 2)}</span>
                    <span className="transactions-page__grid-label">₺0</span>
                  </div>

                  <div className="transactions-page__chart-bars-wrap">
                    {daily.map((d, index) => {
                      const heightPercent = Math.max((d.total / maxDaily) * 100, 6);
                      const isPeak = d.total === peakDailyDay?.total;
                      const isHovered = hoveredChartIndex === index;

                      return (
                        <Popover
                          key={d.invoiceNo}
                          content={
                            <div className="transactions-page__chart-popover">
                              <div className="transactions-page__popover-date">{formatTurkishDate(d.date)}</div>
                              <div className="transactions-page__popover-row">
                                <span>Satış Tutarı:</span> <strong>₺{d.total.toLocaleString('tr-TR')}</strong>
                              </div>
                              <div className="transactions-page__popover-row">
                                <span>Ürün Adedi:</span> <strong>{d.itemCount} adet</strong>
                              </div>
                              <div className="transactions-page__popover-row">
                                <span>Müşteri:</span> <strong>{d.customer}</strong>
                              </div>
                            </div>
                          }
                          trigger="hover"
                        >
                          <div
                            className={`transactions-page__bar-group ${isPeak ? 'transactions-page__bar-group--peak' : ''}`}
                            onMouseEnter={() => setHoveredChartIndex(index)}
                            onMouseLeave={() => setHoveredChartIndex(null)}
                            onClick={() => openInvoiceModal(d)}
                          >
                            {isPeak && <span className="transactions-page__peak-badge">Zirve</span>}
                            <div className="transactions-page__bar-val">₺{d.total}</div>
                            <div className="transactions-page__bar-track">
                              <div
                                className={`transactions-page__bar-fill ${isHovered ? 'transactions-page__bar-fill--hover' : ''}`}
                                style={{ height: `${heightPercent}%` }}
                              />
                            </div>
                            <div className="transactions-page__bar-label">{formatTurkishDate(d.date)}</div>
                          </div>
                        </Popover>
                      );
                    })}
                  </div>
                </div>
              )}

              {period === 'weekly' && (
                <div className="transactions-page__weekly-view">
                  <div className="transactions-page__comparison-cards">
                    <div className="transactions-page__comp-card transactions-page__comp-card--active">
                      <div className="transactions-page__comp-label">Bu Hafta (32. Hafta)</div>
                      <div className="transactions-page__comp-val">₺{weekly[0]?.totalRevenue.toLocaleString('tr-TR')}</div>
                      <div className="transactions-page__comp-sub">{weekly[0]?.totalSales} tamamlanan satış</div>
                    </div>

                    <div className="transactions-page__comp-card">
                      <div className="transactions-page__comp-label">Geçen Hafta (31. Hafta)</div>
                      <div className="transactions-page__comp-val">₺{weekly[1]?.totalRevenue.toLocaleString('tr-TR')}</div>
                      <div className="transactions-page__comp-sub">{weekly[1]?.totalSales} tamamlanan satış</div>
                    </div>
                  </div>

                  <div className="transactions-page__chart-container" style={{ marginTop: 24 }}>
                    <div className="transactions-page__chart-bars-wrap">
                      {[...weekly].reverse().map((w) => {
                        const heightPercent = Math.max((w.totalRevenue / maxWeekly) * 100, 8);
                        return (
                          <div key={w.week} className="transactions-page__bar-group">
                            <div className="transactions-page__bar-val">₺{(w.totalRevenue / 1000).toFixed(1)}k</div>
                            <div className="transactions-page__bar-track">
                              <div className="transactions-page__bar-fill" style={{ height: `${heightPercent}%` }} />
                            </div>
                            <div className="transactions-page__bar-label">{w.week}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {period === 'monthly' && (
                <div className="transactions-page__monthly-trend-grid">
                  {monthly.slice(0, 8).map((m) => {
                    const heightPercent = Math.max((m.totalRevenue / maxMonthly) * 100, 8);
                    return (
                      <div key={m.month} className="transactions-page__monthly-card">
                        <div className="transactions-page__monthly-header">
                          <span className="transactions-page__monthly-name">{m.month}</span>
                          {m.growth !== 0 && (
                            <span className={`transactions-page__growth-pill ${m.growth > 0 ? 'transactions-page__growth-pill--up' : 'transactions-page__growth-pill--down'}`}>
                              {m.growth > 0 ? '+' : ''}{m.growth}%
                            </span>
                          )}
                        </div>
                        <div className="transactions-page__monthly-revenue">₺{m.totalRevenue.toLocaleString('tr-TR')}</div>
                        <Progress percent={Math.round(heightPercent)} showInfo={false} strokeColor="#E32727" size="small" />
                        <div className="transactions-page__monthly-sales">{m.totalSales} satış işlemi</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 📄 INVOICE PREVIEW & PRINT MODAL */}
      <Modal
        title={null}
        open={isInvoiceModalOpen}
        onCancel={closeInvoiceModal}
        footer={null}
        width={720}
        centered
        className="transactions-page__invoice-modal"
      >
        {selectedSale && (
          <div className="transactions-page__invoice-modal-content">
            {/* Modal Header */}
            <div className="transactions-page__invoice-modal-header">
              <div>
                <div className="transactions-page__invoice-brand">
                  <ShopOutlined /> ŞAHİN MOTOR & YEDEK PARÇA
                </div>
                <h2 className="transactions-page__invoice-title">SATIŞ DETAYI</h2>
                <Text type="secondary">Satış No: <strong>{selectedSale.id}</strong></Text>
              </div>
              <div className="transactions-page__invoice-status-badge">
                <Tag color={STATUS_MAP[selectedSale.durum]?.color || 'default'} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6 }}>
                  {STATUS_MAP[selectedSale.durum]?.label || selectedSale.durum}
                </Tag>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Info Grid */}
            <div className="transactions-page__invoice-info-grid">
              <div className="transactions-page__invoice-info-box">
                <Text type="secondary" className="transactions-page__info-label">MÜŞTERİ BİLGİLERİ</Text>
                <div className="transactions-page__info-val"><strong>{selectedSale.musteriAdi}</strong></div>
                <div className="transactions-page__info-sub">{selectedSale.musteriTelefon}</div>
                {selectedSale.musteriEmail && <div className="transactions-page__info-sub">{selectedSale.musteriEmail}</div>}
              </div>

              <div className="transactions-page__invoice-info-box">
                <Text type="secondary" className="transactions-page__info-label">ÖDEME & TARİH</Text>
                <div className="transactions-page__info-val">
                  {PAYMENT_METHOD_MAP[selectedSale.odemeYontemi]?.icon} {PAYMENT_METHOD_MAP[selectedSale.odemeYontemi]?.label || selectedSale.odemeYontemi}
                </div>
                <div className="transactions-page__info-sub">Tarih: {selectedSale.createdAt}</div>
                <div className="transactions-page__info-sub">Bayi Kodu: {selectedSale.bayiId}</div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="transactions-page__invoice-items-title">SATIŞ KALEMLERİ</div>
            <Table
              columns={[
                { title: 'Barkod', dataIndex: 'productCode', key: 'productCode', width: 110 },
                { title: 'Ürün / Hizmet', dataIndex: 'productName', key: 'productName' },
                { title: 'Birim Fiyat', dataIndex: 'unitPrice', key: 'unitPrice', width: 110, align: 'right' as const, render: (v: number) => `₺${v.toLocaleString('tr-TR')}` },
                { title: 'Adet', dataIndex: 'quantity', key: 'quantity', width: 70, align: 'center' as const },
                { title: 'Toplam', dataIndex: 'total', key: 'total', width: 120, align: 'right' as const, render: (v: number) => <strong>₺{v.toLocaleString('tr-TR')}</strong> },
              ]}
              dataSource={selectedSale.items}
              rowKey="productId"
              pagination={false}
              size="small"
              className="transactions-page__invoice-table"
            />

            {/* Grand Total Breakdown */}
            <div className="transactions-page__invoice-total-card">
              <div className="transactions-page__total-row">
                <span>Ara Toplam:</span>
                <span>₺{Math.round(selectedSale.toplamTutar / 1.2).toLocaleString('tr-TR')}</span>
              </div>
              <div className="transactions-page__total-row">
                <span>KDV (%20):</span>
                <span>₺{Math.round(selectedSale.toplamTutar - selectedSale.toplamTutar / 1.2).toLocaleString('tr-TR')}</span>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div className="transactions-page__grand-total-row">
                <span>Genel Toplam:</span>
                <span className="transactions-page__grand-price">₺{selectedSale.toplamTutar.toLocaleString('tr-TR')}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="transactions-page__invoice-modal-actions">
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                Satışı Yazdır
              </Button>
              <Button type="primary" danger onClick={closeInvoiceModal}>
                Kapat
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
