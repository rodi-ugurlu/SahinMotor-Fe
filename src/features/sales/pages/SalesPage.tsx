import { useState, useRef, useCallback } from 'react';
import {
  Alert,
  Badge,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';

import {
  CameraOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  HistoryOutlined,
  PlusOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useSales } from '../hooks/useSales';
import type { Sale, SaleItem, PaymentMethod, CustomerType } from '../types/sales';
import './SalesPage.css';

const { Text } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  bitti: { color: 'green', label: 'Tamamlandı' },
  iptal: { color: 'red', label: 'İptal' },
  taslak: { color: 'orange', label: 'Taslak' },
};

const FILTER_TAG_COLORS: Record<string, string> = {
  all: 'blue',
  bitti: 'green',
  taslak: 'orange',
  iptal: 'red',
};


const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  kart: 'Kredi Kartı',
  nakit: 'Nakit',
  havale: 'Havale/EFT',
};

const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  kart: '💳',
  nakit: '💵',
  havale: '🏦',
};

type FlowStep = 'cart' | 'customer' | 'proforma';

export default function SalesPage() {
  const {
    filteredSales, state, search, statusFilter, dateFrom, dateTo,
    customers, products, cartItems, showSalesList,
    setSearch, setStatusFilter, setDateFrom, setDateTo, setShowSalesList, setCartItems,
    addToCart, updateCartItem, removeCartItem,
    handleCreateSale, handleUpdateStatus, handleDeleteSale,
    retry,
  } = useSales();

  const [productSearch, setProductSearch] = useState('');
  const [selectKey, setSelectKey] = useState(0);
  const [flowStep, setFlowStep] = useState<FlowStep>('cart');
  const [customerForm] = Form.useForm();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [customerType, setCustomerType] = useState<CustomerType>('individual');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('nakit');
  const [focusedDiscountIndex, setFocusedDiscountIndex] = useState<number | null>(null);
  const [detailSale, setDetailSale] = useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSale, setPreviewSale] = useState<Sale | null>(null);

  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeResult, setBarcodeResult] = useState<{ msg: string; ok: boolean } | null>(null);
  const barcodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barcodeInputRef = useRef<any>(null);

  const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discountTotal = cartItems.reduce((sum, i) => sum + i.discountAmount, 0);
  const taxAmount = (subtotal - discountTotal) * 0.2;
  const grandTotal = subtotal - discountTotal + taxAmount;

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return false;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q);
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleProductSelect = (productId: string | undefined) => {
    if (!productId) return;
    addToCart(productId);
    setProductSearch('');
    setSelectKey((k) => k + 1);
  };

  const showBarcodeResult = useCallback((msg: string, ok: boolean) => {
    if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
    setBarcodeResult({ msg, ok });
    barcodeTimeoutRef.current = setTimeout(() => setBarcodeResult(null), 2000);
  }, []);

  const handleBarcodeSubmit = () => {
    if (!barcodeInput.trim()) return;
    const product = products.find((p) => p.barcode === barcodeInput.trim());
    if (product) {
      addToCart(product.id);
      showBarcodeResult(`${product.name} sepete eklendi`, true);
    } else {
      showBarcodeResult('Ürün bulunamadı', false);
    }
    setBarcodeInput('');
  };

  const openBarcode = () => {
    setBarcodeOpen(true);
    setBarcodeInput('');
    setBarcodeResult(null);
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  const goToCustomer = () => {
    if (cartItems.length === 0) {
      message.warning('Sepete en az bir ürün ekleyin');
      return;
    }
    setFlowStep('customer');
  };

  const handleCustomerNext = async () => {
    try {
      await customerForm.validateFields();
      const values = customerForm.getFieldsValue();
      const now = new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      const preview: Sale = {
        id: 'preview',
        bayiId: 'd1',
        personelId: 'u1',
        musteriId: selectedCustomerId || `new-${Date.now()}`,
        musteriAdi: selectedCustomer ? selectedCustomer.fullName : values.fullName,
        musteriTelefon: selectedCustomer ? selectedCustomer.phone : values.phone,
        musteriEmail: selectedCustomer?.email || values.email,
        items: cartItems,
        toplamTutar: grandTotal,
        odemeYontemi: paymentMethod,
        durum: 'taslak',
        createdAt: now,
        updatedAt: now,
      };
      setPreviewSale(preview);
      setFlowStep('proforma');
    } catch {
      // validation failed
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleCompleteSale = () => {
    if (!previewSale) return;
    Modal.confirm({
      title: 'Satışı Tamamla',
      icon: <CheckCircleOutlined style={{ color: '#22C55E' }} />,
      content: (
        <div>
          <p>Bu satışı tamamlamak istediğinize emin misiniz?</p>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 12, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#64748B' }}>Müşteri:</span>
              <strong>{previewSale.musteriAdi}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Tutar:</span>
              <strong style={{ color: '#E32727' }}>₺{grandTotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      ),
      okText: 'Evet, Satışı Bitir',
      cancelText: 'Hayır, Taslak Olarak Kaydet',
      okButtonProps: { danger: true, type: 'primary' as const, style: { borderRadius: 10 } },
      cancelButtonProps: { style: { borderRadius: 10 } },
      className: 'sales-page__confirm-modal',
      onOk: async () => {
        setIsSubmitting(true);
        try {
          await handleCreateSale({
            bayiId: previewSale.bayiId,
            personelId: previewSale.personelId,
            musteriId: previewSale.musteriId,
            musteriAdi: previewSale.musteriAdi,
            musteriTelefon: previewSale.musteriTelefon,
            musteriEmail: previewSale.musteriEmail,
            odemeYontemi: previewSale.odemeYontemi,
            durum: 'bitti',
          });
          message.success('Satış başarıyla tamamlandı');
          resetFlow();
        } catch {
          message.error('Satış tamamlanırken hata oluştu');
        } finally {
          setIsSubmitting(false);
        }
      },
      onCancel: async () => {
        setIsSubmitting(true);
        try {
          await handleCreateSale({
            bayiId: previewSale.bayiId,
            personelId: previewSale.personelId,
            musteriId: previewSale.musteriId,
            musteriAdi: previewSale.musteriAdi,
            musteriTelefon: previewSale.musteriTelefon,
            musteriEmail: previewSale.musteriEmail,
            odemeYontemi: previewSale.odemeYontemi,
            durum: 'taslak',
          });
          message.success('Satış taslak olarak kaydedildi');
          resetFlow();
        } catch {
          message.error('Taslak kaydedilirken hata oluştu');
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const resetFlow = () => {
    setFlowStep('cart');
    setPreviewSale(null);
    setSelectedCustomerId(undefined);
    setPaymentMethod('nakit');
    customerForm.resetFields();
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      await handleDeleteSale(deleteTarget.id);
      setDeleteTarget(null);
      if (detailSale?.id === deleteTarget.id) setDetailSale(null);
    } catch {
      // handled in hook
    }
  };

  const saleColumns = [
    {
      title: 'Tarih', dataIndex: 'createdAt', key: 'createdAt', width: 140,
      render: (date: string) => <Text style={{ fontSize: 13, color: '#64748B' }}>{date}</Text>,
    },
    {
      title: 'Müşteri', key: 'customer', width: 180,
      render: (_: unknown, record: Sale) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{record.musteriAdi}</Text>
          <br />
          <Text style={{ fontSize: 12, color: '#94A3B8' }}>{record.musteriTelefon}</Text>
        </div>
      ),
    },
    {
      title: 'Ürün', key: 'items', width: 70, align: 'center' as const,
      render: (_: unknown, record: Sale) => <Badge count={record.items.length} color="#E32727" />,
    },
    {
      title: 'Tutar', key: 'total', width: 120,
      render: (_: unknown, record: Sale) => <Text strong>₺{record.toplamTutar.toLocaleString('tr-TR')}</Text>,
    },
    {
      title: 'Ödeme', dataIndex: 'odemeYontemi', key: 'odemeYontemi', width: 110,
      render: (method: PaymentMethod) => (
        <Tag>{PAYMENT_ICONS[method]} {PAYMENT_LABELS[method]}</Tag>
      ),
    },
    {
      title: 'Durum', dataIndex: 'durum', key: 'durum', width: 110,
      render: (durum: string) => {
        const s = STATUS_MAP[durum] ?? { color: 'default', label: durum };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: 'İşlemler', key: 'actions', width: 110,
      render: (_: unknown, record: Sale) => (
        <Space size={8}>
          <Tooltip title="Detay Gör" placement="top">
            <Button type="text" icon={<EyeOutlined style={{ fontSize: 16 }} />} onClick={() => setDetailSale(record)} />
          </Tooltip>
          {record.durum === 'taslak' && (
            <Tooltip title="Sil" placement="top">
              <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 16 }} />} onClick={() => setDeleteTarget(record)} />
            </Tooltip>
          )}
        </Space>
      ),
    },


  ];

  const cartTableColumns = [
    { title: 'Ürün', dataIndex: 'productName', key: 'productName', ellipsis: true },
    { title: 'Birim Fiyat', dataIndex: 'unitPrice', key: 'unitPrice', width: 90, render: (v: number) => `₺${v}` },
    {
      title: 'Adet', key: 'quantity', width: 80,
      render: (_: unknown, _record: SaleItem, index: number) => (
        <InputNumber min={1} value={cartItems[index].quantity} onChange={(v) => updateCartItem(index, { quantity: v ?? 1 })} style={{ width: 60 }} controls={false} />
      ),
    },
    {
      title: 'İskonto %', key: 'discountPercent', width: 100,
      render: (_: unknown, _record: SaleItem, index: number) => {
        const isFocused = focusedDiscountIndex === index;
        return (
          <InputNumber
            min={0}
            max={100}
            value={cartItems[index].discountPercent}
            onChange={(v) => updateCartItem(index, { discountPercent: v ?? 0 })}
            onFocus={() => setFocusedDiscountIndex(index)}
            onBlur={() => setFocusedDiscountIndex(null)}
            className={`sales-page__discount-input${isFocused ? ' sales-page__discount-input--focused' : ''}`}
            style={{ width: isFocused ? 72 : 60 }}
            suffix="%"
            controls={false}
          />
        );
      },
    },
    {
      title: 'Toplam', key: 'total', width: 100,
      render: (_: unknown, _record: SaleItem, index: number) => <Text strong>₺{cartItems[index].total.toFixed(2)}</Text>,
    },
    {
      title: '', key: 'del', width: 50,
      render: (_: unknown, _record: SaleItem, index: number) => (
        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeCartItem(index)} />
      ),
    },
  ];

  if (state === 'error') {
    return (
      <Alert
        message="Satış verileri yüklenirken hata oluştu"
        type="error" showIcon
        action={<Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>Yeniden Dene</Button>}
        style={{ borderRadius: 10, margin: 24 }}
      />
    );
  }

  if (showSalesList) {
    return (
      <div className="sales-page">
        <div className="sales-page__list-section">
          <div className="sales-page__top-bar">
            <div className="sales-page__title-row">
              <h1 className="sales-page__title">Satışlarım</h1>
              {state === 'loaded' && <Badge count={filteredSales.length} color="#E32727" />}
            </div>
            <div className="sales-page__actions">
              <Button type="primary" danger icon={<PlusOutlined />} onClick={() => { setShowSalesList(false); setCartItems([]); resetFlow(); }}>
                Yeni Satış
              </Button>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Müşteri adı veya telefon ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 260 }}
                allowClear
              />
            </div>
          </div>

          <div className="sales-page__filter-row">
            {(['all', 'bitti', 'taslak', 'iptal'] as const).map((f) => (
              <Tag
                key={f}
                color={statusFilter === f ? (FILTER_TAG_COLORS[f] || 'blue') : 'default'}
                style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }}
                onClick={() => setStatusFilter(f)}
              >
                {f === 'all' ? 'Tümü' : STATUS_MAP[f]?.label ?? f}
              </Tag>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
              <Input
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Başlangıç (GG.AA.YYYY)"
                style={{ width: 200, borderRadius: 8 }}
                allowClear
              />
              <Text type="secondary" style={{ fontSize: 13 }}>-</Text>
              <Input
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Bitiş (GG.AA.YYYY)"
                style={{ width: 200, borderRadius: 8 }}
                allowClear
              />
            </div>
          </div>


          {state === 'loading' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24 }}>
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          )}

          {state === 'empty' && (
            <div className="sales-page__empty">
              <ShoppingCartOutlined className="sales-page__empty-icon" />
              <Text className="sales-page__empty-text">Henüz satış kaydı yok</Text>
              <Button type="primary" danger icon={<PlusOutlined />} onClick={() => { setShowSalesList(false); setCartItems([]); }}>
                İlk Satışı Yap
              </Button>
            </div>
          )}

          {state === 'loaded' && (
            <Table<Sale>
              columns={saleColumns}
              dataSource={filteredSales}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (_t, range) => `Bu sayfada ${range[0]}-${range[1]} gösteriliyor` }}
              style={{ background: '#fff', borderRadius: 14 }}
              scroll={{ x: 800 }}
            />
          )}
        </div>

        <Drawer
          title={detailSale ? `Satış Detayı` : ''}
          open={!!detailSale}
          onClose={() => setDetailSale(null)}
          width={560}
          extra={
            detailSale && (
              <Button icon={<PrinterOutlined />} onClick={() => window.print()} style={{ borderRadius: 10 }}>
                Yazdır
              </Button>
            )
          }
        >
          {detailSale && (
            <>
              <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Müşteri">{detailSale.musteriAdi}</Descriptions.Item>
                <Descriptions.Item label="Telefon">{detailSale.musteriTelefon}</Descriptions.Item>
                {detailSale.musteriEmail && <Descriptions.Item label="E-posta">{detailSale.musteriEmail}</Descriptions.Item>}
                <Descriptions.Item label="Ödeme Yöntemi">
                  <Tag>{PAYMENT_ICONS[detailSale.odemeYontemi]} {PAYMENT_LABELS[detailSale.odemeYontemi]}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Tag color={STATUS_MAP[detailSale.durum]?.color}>{STATUS_MAP[detailSale.durum]?.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tarih">{detailSale.createdAt}</Descriptions.Item>
              </Descriptions>

              <Table<SaleItem>
                columns={[
                  { title: 'Ürün', dataIndex: 'productName', key: 'productName' },
                  { title: 'Birim Fiyat', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => `₺${v}` },
                  { title: 'Adet', dataIndex: 'quantity', key: 'quantity' },
                  { title: 'İskonto', key: 'discount', render: (_: unknown, r: SaleItem) => r.discountAmount > 0 ? `₺${r.discountAmount}` : '-' },
                  { title: 'Toplam', key: 'total', render: (_: unknown, r: SaleItem) => `₺${r.total.toFixed(2)}` },
                ]}
                dataSource={detailSale.items}
                rowKey="productId"
                pagination={false}
                size="small"
              />

              {(() => {
                const subtotal = detailSale.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
                const discountTotal = detailSale.items.reduce((sum, i) => sum + i.discountAmount, 0);
                const taxable = subtotal - discountTotal;
                const taxAmount = taxable * 0.2;
                const grandTotal = detailSale.toplamTutar;

                return (
                  <div style={{ marginTop: 16, padding: 16, background: '#F8FAFC', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: 13 }}>
                      <span>Ara Toplam</span>
                      <span>₺{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {discountTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E32727', fontSize: 13 }}>
                        <span>İskonto / İndirim</span>
                        <span>-₺{discountTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: 13 }}>
                      <span>KDV (%20)</span>
                      <span>₺{taxAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#E32727' }}>
                      <span>Genel Toplam</span>
                      <span>₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })()}



              {detailSale.durum === 'taslak' && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Button type="primary" danger onClick={() => handleUpdateStatus(detailSale.id, 'bitti')}>Satışı Tamamla</Button>
                  <Button danger onClick={() => handleUpdateStatus(detailSale.id, 'iptal')}>İptal Et</Button>
                </div>
              )}
            </>
          )}
        </Drawer>

        <Modal
          title="Satışı Sil"
          open={!!deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onOk={executeDelete}
          okText="Sil"
          cancelText="İptal"
          okButtonProps={{ danger: true, type: 'primary' }}
        >
          <p><strong>{deleteTarget?.musteriAdi}</strong> müşterisine ait satışı silmek istediğinize emin misiniz?</p>
        </Modal>
      </div>
    );
  }

  if (flowStep === 'proforma' && previewSale) {
    return (
      <div className="sales-page">
        <div className="sales-page__proforma-wrap">
          <div className="sales-page__proforma-topbar">
            <Button onClick={() => setFlowStep('customer')} style={{ borderRadius: 10 }}>
              ← Geri Dön
            </Button>
            <h1>Satış Önizleme</h1>
            <div />
          </div>

          <div className="sales-page__proforma">
            <div className="sales-page__proforma-header">
              <div className="sales-page__proforma-header-left">
                <h2>FATURA ÖNİZLEME</h2>
                <span>{previewSale.createdAt}</span>
              </div>
              <div className="sales-page__proforma-header-right">
                <Tag color="orange">Onay Bekliyor</Tag>
              </div>
            </div>

            <div className="sales-page__proforma-body">
              <div className="sales-page__proforma-info">
                <div className="sales-page__proforma-info-block">
                  <span className="sales-page__proforma-info-label">Müşteri</span>
                  <span className="sales-page__proforma-info-value">{previewSale.musteriAdi}</span>
                </div>
                <div className="sales-page__proforma-info-block">
                  <span className="sales-page__proforma-info-label">Telefon</span>
                  <span className="sales-page__proforma-info-value">{previewSale.musteriTelefon}</span>
                </div>
                {previewSale.musteriEmail && (
                  <div className="sales-page__proforma-info-block">
                    <span className="sales-page__proforma-info-label">E-posta</span>
                    <span className="sales-page__proforma-info-value">{previewSale.musteriEmail}</span>
                  </div>
                )}
                <div className="sales-page__proforma-info-block">
                  <span className="sales-page__proforma-info-label">Ödeme Yöntemi</span>
                  <span className="sales-page__proforma-info-value">
                    {PAYMENT_ICONS[previewSale.odemeYontemi]} {PAYMENT_LABELS[previewSale.odemeYontemi]}
                  </span>
                </div>
              </div>

              <div className="sales-page__proforma-table">
                <Table<SaleItem>
                  columns={[
                    { title: 'Ürün', dataIndex: 'productName', key: 'productName' },
                    { title: 'Birim Fiyat', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, render: (v: number) => `₺${v}` },
                    { title: 'Adet', dataIndex: 'quantity', key: 'quantity', width: 70, align: 'center' as const },
                    { title: 'İskonto', key: 'discount', width: 80, render: (_: unknown, r: SaleItem) => r.discountPercent > 0 ? `%${r.discountPercent}` : '-' },
                    { title: 'Tutar', key: 'total', width: 110, render: (_: unknown, r: SaleItem) => <Text strong>₺{r.total.toFixed(2)}</Text> },
                  ]}
                  dataSource={previewSale.items}
                  rowKey="productId"
                  pagination={false}
                  size="small"
                />
              </div>

              <div className="sales-page__proforma-totals">
                <div className="sales-page__proforma-total-row">
                  <span>Ara Toplam</span>
                  <span>₺{subtotal.toLocaleString('tr-TR')}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="sales-page__proforma-total-row">
                    <span>İskonto</span>
                    <span style={{ color: '#E32727' }}>-₺{discountTotal.toLocaleString('tr-TR')}</span>
                  </div>
                )}
                <div className="sales-page__proforma-total-row">
                  <span>KDV (%20)</span>
                  <span>₺{taxAmount.toFixed(2)}</span>
                </div>
                <div className="sales-page__proforma-grand-total">
                  <span>Genel Toplam</span>
                  <span>₺{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="sales-page__proforma-actions">
                <Button icon={<PrinterOutlined />} onClick={handleDownloadPDF} style={{ borderRadius: 10 }}>
                  Yazdır / PDF
                </Button>
                <Button
                  type="primary"
                  danger
                  icon={<CheckCircleOutlined />}
                  onClick={handleCompleteSale}
                  loading={isSubmitting}
                  style={{ borderRadius: 10, fontWeight: 600 }}
                >
                  Satışı Tamamla
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (flowStep === 'customer') {
    return (
      <div className="sales-page">
        <div className="sales-page__customer-layout">
          <div className="sales-page__customer-form-col">
            <div className="sales-page__customer-back">
              <Button onClick={() => setFlowStep('cart')} style={{ borderRadius: 10 }}>
                ← Sepete Dön
              </Button>
            </div>

            <div className="sales-page__customer-header">
              <div className="sales-page__customer-header-icon">
                <UserOutlined />
              </div>
              <div className="sales-page__customer-header-title">Müşteri Bilgileri</div>
              <div className="sales-page__customer-header-sub">Satışı tamamlamak için müşteri bilgilerini doldurun</div>
            </div>

            <Form form={customerForm} layout="vertical" size="large">
              <Form.Item label="Müşteri Tipi">
                <Radio.Group
                  value={customerType}
                  onChange={(e) => {
                    setCustomerType(e.target.value);
                    setSelectedCustomerId(undefined);
                    customerForm.resetFields();
                  }}
                  style={{ display: 'flex', gap: 10, width: '100%' }}
                >
                  <Radio.Button value="individual" style={{ flex: 1, textAlign: 'center', height: 44, lineHeight: '44px', borderRadius: 10, fontSize: 14, fontWeight: 500 }}>
                    Bireysel
                  </Radio.Button>
                  <Radio.Button value="company" style={{ flex: 1, textAlign: 'center', height: 44, lineHeight: '44px', borderRadius: 10, fontSize: 14, fontWeight: 500 }}>
                    Kurumsal
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="Mevcut Müşteri">
                <Select
                  showSearch
                  allowClear
                  placeholder="Müşteri seçin (opsiyonel)"
                  value={selectedCustomerId}
                  onChange={(id) => {
                    setSelectedCustomerId(id);
                    if (id) {
                      const c = customers.find((x) => x.id === id);
                      if (c) {
                        setCustomerType(c.type);
                        customerForm.setFieldsValue({
                          fullName: c.fullName,
                          phone: c.phone,
                          email: c.email,
                          tc: c.tc,
                          vkn: c.vkn,
                          taxOffice: c.taxOffice,
                          billingAddress: c.billingAddress,
                        });
                      }
                    } else {
                      customerForm.resetFields();
                    }
                  }}
                  filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={customers
                    .filter((c) => c.type === customerType)
                    .map((c) => ({ value: c.id, label: `${c.fullName} — ${c.phone}` }))}
                />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Form.Item
                  name="fullName"
                  label={customerType === 'individual' ? 'Ad Soyad' : 'Firma Adı'}
                  rules={[{ required: !selectedCustomerId, message: customerType === 'individual' ? 'Ad soyad gerekli' : 'Firma adı gerekli' }]}
                >
                  <Input placeholder={customerType === 'individual' ? 'Ad Soyad' : 'Firma Adı'} disabled={!!selectedCustomerId} />
                </Form.Item>
                <Form.Item name="phone" label="Telefon" rules={[{ required: !selectedCustomerId, message: 'Telefon gerekli' }]}>
                  <Input placeholder="05xx xxx xx xx" disabled={!!selectedCustomerId} />
                </Form.Item>
              </div>

              {customerType === 'individual' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <Form.Item name="tc" label="TC Kimlik No" rules={[{ required: !selectedCustomerId, message: 'TC Kimlik No gerekli' }, { pattern: /^\d{11}$/, message: 'TC Kimlik No 11 haneli olmalıdır' }]}>
                    <Input placeholder="12345678901" maxLength={11} disabled={!!selectedCustomerId} />
                  </Form.Item>
                  <Form.Item name="email" label="E-posta">
                    <Input placeholder="E-posta (opsiyonel)" type="email" disabled={!!selectedCustomerId} />
                  </Form.Item>
                </div>
              )}

              {customerType === 'company' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <Form.Item name="vkn" label="Vergi No" rules={[{ required: !selectedCustomerId, message: 'Vergi No gerekli' }, { pattern: /^\d{10}$/, message: 'Vergi No 10 haneli olmalıdır' }]}>
                      <Input placeholder="1234567890" maxLength={10} disabled={!!selectedCustomerId} />
                    </Form.Item>
                    <Form.Item name="taxOffice" label="Vergi Dairesi" rules={[{ required: !selectedCustomerId, message: 'Vergi dairesi gerekli' }]}>
                      <Input placeholder="Vergi Dairesi" disabled={!!selectedCustomerId} />
                    </Form.Item>
                  </div>
                  <Form.Item name="email" label="E-posta">
                    <Input placeholder="E-posta (opsiyonel)" type="email" disabled={!!selectedCustomerId} />
                  </Form.Item>
                </>
              )}

              <Form.Item name="billingAddress" label="Fatura Adresi">
                <Input.TextArea placeholder="Fatura adresi" rows={2} disabled={!!selectedCustomerId} />
              </Form.Item>

              <Form.Item label="Ödeme Yöntemi" required>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ display: 'flex', gap: 10, width: '100%' }}
                >
                  {(['nakit', 'kart', 'havale'] as PaymentMethod[]).map((m) => (
                    <Radio.Button
                      key={m}
                      value={m}
                      style={{
                        flex: 1, textAlign: 'center', height: 44, lineHeight: '44px',
                        borderRadius: 10, fontSize: 14, fontWeight: 500,
                      }}
                    >
                      {PAYMENT_ICONS[m]} {PAYMENT_LABELS[m]}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Form>

            <Button
              type="primary"
              danger
              block
              icon={<FilePdfOutlined />}
              onClick={handleCustomerNext}
              style={{ borderRadius: 12, height: 48, fontSize: 15, fontWeight: 600, marginTop: 4 }}
            >
              Satış Önizleme
            </Button>
          </div>

          <div className="sales-page__customer-sidebar">
            <div className="sales-page__cart-sidebar-title">
              <WalletOutlined />
              Sipariş Özeti
            </div>

            <div className="sales-page__cart-sidebar-items">
              {cartItems.map((item) => (
                <div className="sales-page__cart-sidebar-item" key={item.productId}>
                  <div className="sales-page__cart-sidebar-item-qty">{item.quantity}</div>
                  <div className="sales-page__cart-sidebar-item-info">
                    <div className="sales-page__cart-sidebar-item-name">{item.productName}</div>
                    <div className="sales-page__cart-sidebar-item-price">₺{item.unitPrice} / adet</div>
                  </div>
                  <div className="sales-page__cart-sidebar-item-total">₺{item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="sales-page__cart-sidebar-divider" />

            <div className="sales-page__cart-sidebar-summary">
              <div className="sales-page__cart-sidebar-row">
                <span>Ürün Adedi</span>
                <span>{cartItems.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="sales-page__cart-sidebar-row">
                <span>Ara Toplam</span>
                <span>₺{subtotal.toLocaleString('tr-TR')}</span>
              </div>
              {discountTotal > 0 && (
                <div className="sales-page__cart-sidebar-row">
                  <span>İskonto</span>
                  <span style={{ color: '#E32727' }}>-₺{discountTotal.toLocaleString('tr-TR')}</span>
                </div>
              )}
              <div className="sales-page__cart-sidebar-row">
                <span>KDV (%20)</span>
                <span>₺{taxAmount.toFixed(2)}</span>
              </div>
              <div className="sales-page__cart-sidebar-total">
                <span>Genel Toplam</span>
                <span>₺{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-page">
      {cartItems.length === 0 ? (
        <div className="sales-page__spotlight">
          <div className="sales-page__spotlight-brand">
            <div className="sales-page__spotlight-icon">
              <ShoppingCartOutlined />
            </div>
            <div className="sales-page__spotlight-title">Yeni Satış</div>
            <div className="sales-page__spotlight-sub">
              Ürün adı ile arama yapın veya barkod okutarak sepete ekleyin
            </div>
          </div>

          <div className="sales-page__spotlight-search">
            <Select
              key={selectKey}
              showSearch
              value={undefined}
              searchValue={productSearch}
              placeholder="Ürün adı veya barkod ile arayın..."
              filterOption={false}
              onSearch={setProductSearch}
              onSelect={handleProductSelect}
              onBlur={() => setProductSearch('')}
              prefix={<SearchOutlined style={{ color: '#94A3B8', fontSize: 18 }} />}
              options={filteredProducts.map((p) => ({
                value: p.id,
                label: (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>{p.barcode}</div>
                    </div>
                    <Text strong style={{ color: '#E32727', fontSize: 15 }}>₺{p.price}</Text>
                  </div>
                ),
              }))}
              notFoundContent={productSearch ? 'Ürün bulunamadı' : 'Aramak için yazmaya başlayın'}
              suffixIcon={null}
            />
            <button className="sales-page__spotlight-barcode-btn" onClick={openBarcode} title="Barkod Okut">
              <CameraOutlined />
            </button>
          </div>

          <div className="sales-page__spotlight-actions">
            <Button icon={<HistoryOutlined />} onClick={() => setShowSalesList(true)} style={{ borderRadius: 10, height: 42 }}>
              Satışlarım
            </Button>
          </div>
        </div>
      ) : (
        <div className="sales-page__workspace">
          <div className="sales-page__workspace-left">
            <div className="sales-page__workspace-header">
              <div className="sales-page__workspace-title">
                <ShoppingCartOutlined />
                Sepet
                <span className="sales-page__workspace-title-badge">{cartItems.length}</span>
              </div>
              <Space>
                <Button icon={<HistoryOutlined />} onClick={() => setShowSalesList(true)} style={{ borderRadius: 10 }}>
                  Satışlarım
                </Button>
                <Button danger onClick={() => setCartItems([])} style={{ borderRadius: 10 }}>
                  Temizle
                </Button>
              </Space>
            </div>

            <div className="sales-page__workspace-search">
              <Select
                key={selectKey}
                showSearch
                value={undefined}
                searchValue={productSearch}
                placeholder="Ürün eklemeye devam et..."
                filterOption={false}
                onSearch={setProductSearch}
                onSelect={handleProductSelect}
                onBlur={() => setProductSearch('')}
                prefix={<SearchOutlined style={{ color: '#94A3B8', fontSize: 16 }} />}
                options={filteredProducts.map((p) => ({
                  value: p.id,
                  label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>{p.barcode}</div>
                      </div>
                      <Text strong style={{ color: '#E32727', fontSize: 15 }}>₺{p.price}</Text>
                    </div>
                  ),
                }))}
                notFoundContent={productSearch ? 'Ürün bulunamadı' : 'Aramak için yazmaya başlayın'}
                suffixIcon={null}
              />
              <button className="sales-page__workspace-barcode-btn" onClick={openBarcode} title="Barkod Okut">
                <CameraOutlined />
              </button>
            </div>

            <div className="sales-page__product-table-wrap">
              <Table<SaleItem>
                columns={cartTableColumns}
                dataSource={cartItems}
                rowKey="productId"
                pagination={false}
                size="middle"
              />
            </div>
          </div>

          <div className="sales-page__cart-sidebar">
            <div className="sales-page__cart-sidebar-title">
              <WalletOutlined />
              Sipariş Özeti
            </div>

            <div className="sales-page__cart-sidebar-items">
              {cartItems.map((item, index) => (
                <div className="sales-page__cart-sidebar-item" key={item.productId}>
                  <div className="sales-page__cart-sidebar-item-qty">{item.quantity}</div>
                  <div className="sales-page__cart-sidebar-item-info">
                    <div className="sales-page__cart-sidebar-item-name">{item.productName}</div>
                    <div className="sales-page__cart-sidebar-item-price">₺{item.unitPrice} / adet</div>
                  </div>
                  <div className="sales-page__cart-sidebar-item-total">₺{item.total.toFixed(2)}</div>
                  <CloseOutlined className="sales-page__cart-sidebar-item-del" onClick={() => removeCartItem(index)} />
                </div>
              ))}
            </div>

            <div className="sales-page__cart-sidebar-divider" />

            <div className="sales-page__cart-sidebar-summary">
              <div className="sales-page__cart-sidebar-row">
                <span>Ara Toplam</span>
                <span>₺{subtotal.toLocaleString('tr-TR')}</span>
              </div>
              {discountTotal > 0 && (
                <div className="sales-page__cart-sidebar-row">
                  <span>İskonto</span>
                  <span style={{ color: '#E32727' }}>-₺{discountTotal.toLocaleString('tr-TR')}</span>
                </div>
              )}
              <div className="sales-page__cart-sidebar-row">
                <span>KDV (%20)</span>
                <span>₺{taxAmount.toFixed(2)}</span>
              </div>
              <div className="sales-page__cart-sidebar-total">
                <span>Genel Toplam</span>
                <span>₺{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="sales-page__cart-sidebar-actions">
              <Button
                type="primary"
                danger
                block
                icon={<WalletOutlined />}
                onClick={goToCustomer}
                style={{ borderRadius: 12, height: 48, fontSize: 15, fontWeight: 600 }}
              >
                Satış Yap
              </Button>
              <Button block onClick={() => setCartItems([])} style={{ borderRadius: 12 }}>
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}

      {barcodeOpen && (
        <div className="sales-page__barcode-overlay" onClick={() => setBarcodeOpen(false)}>
          <div className="sales-page__barcode-close" onClick={() => setBarcodeOpen(false)}>✕</div>
          <div className="sales-page__barcode-viewport" onClick={(e) => e.stopPropagation()}>
            <div className="sales-page__barcode-line" />
          </div>
          <div className="sales-page__barcode-input-wrap" onClick={(e) => e.stopPropagation()}>
            <Input.Search
              ref={barcodeInputRef}
              placeholder="Barkod numarası girin veya tarayıcıdan okutun..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onSearch={handleBarcodeSubmit}
              enterButton="Ekle"
              size="large"
            />
          </div>
          {barcodeResult && (
            <div className={`sales-page__barcode-result ${barcodeResult.ok ? 'sales-page__barcode-result--success' : 'sales-page__barcode-result--error'}`}>
              {barcodeResult.ok ? '✓' : '✕'} {barcodeResult.msg}
            </div>
          )}
        </div>
      )}

      <Modal
        title="Satışı Sil"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={executeDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
      >
        <p><strong>{deleteTarget?.musteriAdi}</strong> müşterisine ait satışı silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
