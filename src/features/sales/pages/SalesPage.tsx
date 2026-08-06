import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Skeleton,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CameraOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useSales } from '../hooks/useSales';
import type { Sale, SaleItem } from '../types/sales';
import type { SaleStep } from '../types/sales';
import './SalesPage.css';

const { Text, Title } = Typography;

export default function SalesPage() {
  const {
    filteredSales, state, view, step, filter, search,
    customers, products, selectedCustomer, cartItems,
    setView, setStep, setFilter, setSearch, setSelectedCustomer, setCartItems,
    addToCart, updateCartItem, removeCartItem,
    handleCreateSale, handleConvertToInvoice, handleDeleteSale,
    retry,
  } = useSales();

  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);
  const [detailSale, setDetailSale] = useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
  const [convertTarget, setConvertTarget] = useState<Sale | null>(null);
  const [newCustomerForm] = Form.useForm();
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discountTotal = cartItems.reduce((sum, i) => sum + i.discountAmount, 0);
  const taxAmount = (subtotal - discountTotal) * 0.2;
  const grandTotal = subtotal - discountTotal + taxAmount;

  const handleBarcodeSubmit = () => {
    if (!barcodeInput.trim()) return;
    const product = products.find((p) => p.code === barcodeInput.trim());
    if (product) {
      addToCart(product.id);
      setBarcodeResult(`${product.name} sepete eklendi`);
      setTimeout(() => setBarcodeResult(null), 2000);
    } else {
      setBarcodeResult('Ürün bulunamadı');
      setTimeout(() => setBarcodeResult(null), 2000);
    }
    setBarcodeInput('');
  };

  const handleAddCustomer = () => {
    newCustomerForm.validateFields().then((values) => {
      setSelectedCustomer({
        id: `new-${Date.now()}`,
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
      });
      setShowNewCustomer(false);
      newCustomerForm.resetFields();
      setStep(2);
    });
  };

  const saleColumns = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      width: 140,
      render: (no: string, record: Sale) => (
        <Button type="link" size="small" onClick={() => setDetailSale(record)}>
          {no}
        </Button>
      ),
    },
    { title: 'Tarih', dataIndex: 'date', key: 'date', width: 140 },
    {
      title: 'Müşteri',
      key: 'customer',
      width: 180,
      render: (_: unknown, record: Sale) => (
        <div>
          <Text strong>{record.customer.name}</Text>
          <br />
          <Text style={{ fontSize: 12, color: '#94A3B8' }}>{record.customer.phone}</Text>
        </div>
      ),
    },
    {
      title: 'Ürün',
      key: 'items',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, record: Sale) => <Badge count={record.items.length} color="#E32727" />,
    },
    {
      title: 'Toplam',
      key: 'subtotal',
      width: 110,
      render: (_: unknown, record: Sale) => <Text strong>₺{record.subtotal.toLocaleString('tr-TR')}</Text>,
    },
    {
      title: 'İskonto',
      key: 'discount',
      width: 90,
      render: (_: unknown, record: Sale) =>
        record.discountTotal > 0 ? <Text style={{ color: '#E32727' }}>-₺{record.discountTotal.toLocaleString('tr-TR')}</Text> : <Text type="secondary">₺0</Text>,
    },
    {
      title: 'Net Tutar',
      key: 'grandTotal',
      width: 120,
      render: (_: unknown, record: Sale) => <Text strong style={{ color: '#22C55E' }}>₺{record.grandTotal.toLocaleString('tr-TR')}</Text>,
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type: string) => <Tag color={type === 'invoice' ? 'green' : 'blue'}>{type === 'invoice' ? 'Fatura' : 'Proforma'}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const map: Record<string, { color: string; label: string }> = {
          pending: { color: 'orange', label: 'Bekliyor' },
          completed: { color: 'green', label: 'Tamamlandı' },
          cancelled: { color: 'red', label: 'İptal' },
        };
        const s = map[status] ?? { color: 'default', label: status };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 130,
      render: (_: unknown, record: Sale) => (
        <Space size={4}>
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setDetailSale(record)} />
          {record.type === 'proforma' && record.status === 'pending' && (
            <Button type="text" size="small" icon={<SwapOutlined />} onClick={() => setConvertTarget(record)} title="Faturaya Çevir" />
          )}
          {record.type === 'invoice' && (
            <Button type="text" size="small" icon={<FilePdfOutlined />} />
          )}
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => setDeleteTarget(record)} />
        </Space>
      ),
    },
  ];

  const cartColumns = [
    { title: 'Ürün', dataIndex: 'productName', key: 'productName', ellipsis: true },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (v: number) => `₺${v}`,
    },
    {
      title: 'Adet',
      key: 'quantity',
      width: 80,
      render: (_: unknown, _record: SaleItem, index: number) => (
        <InputNumber
          min={1}
          value={cartItems[index].quantity}
          onChange={(v) => updateCartItem(index, { quantity: v ?? 1 })}
          style={{ width: 60 }}
        />
      ),
    },
    {
      title: 'İskonto %',
      key: 'discountPercent',
      width: 90,
      render: (_: unknown, _record: SaleItem, index: number) => (
        <InputNumber
          min={0}
          max={100}
          value={cartItems[index].discountPercent}
          onChange={(v) => updateCartItem(index, { discountPercent: v ?? 0 })}
          style={{ width: 60 }}
          suffix="%"
        />
      ),
    },
    {
      title: 'İskonto ₺',
      key: 'discountAmount',
      width: 90,
      render: (_: unknown, _record: SaleItem, index: number) => (
        <Text>₺{cartItems[index].discountAmount.toFixed(2)}</Text>
      ),
    },
    {
      title: 'Toplam',
      key: 'total',
      width: 100,
      render: (_: unknown, _record: SaleItem, index: number) => (
        <Text strong>₺{cartItems[index].total.toFixed(2)}</Text>
      ),
    },
    {
      title: '',
      key: 'del',
      width: 50,
      render: (_: unknown, _record: SaleItem, index: number) => (
        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeCartItem(index)} />
      ),
    },
  ];

  const renderListView = () => (
    <>
      <div className="sales-page__top-bar">
        <div className="sales-page__title-row">
          <h1 className="sales-page__title">Satış</h1>
          {state === 'loaded' && <Badge count={filteredSales.length} color="#E32727" />}
        </div>
        <div className="sales-page__actions">
          <Button type="primary" danger icon={<PlusOutlined />} onClick={() => { setView('new'); setStep(1); }}>
            Yeni Satış
          </Button>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Fatura no veya müşteri ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
        </div>
      </div>

      <div className="sales-page__filter-row">
        {(['all', 'proforma', 'invoice', 'pending', 'completed'] as const).map((f) => (
          <Tag
            key={f}
            color={filter === f ? 'red' : 'default'}
            style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tümü' : f === 'proforma' ? 'Proforma' : f === 'invoice' ? 'Fatura' : f === 'pending' ? 'Bekliyor' : 'Tamamlandı'}
          </Tag>
        ))}
      </div>

      {state === 'loading' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      )}

      {state === 'error' && (
        <Alert
          message="Satış verileri yüklenirken hata oluştu"
          type="error" showIcon
          action={<Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>Yeniden Dene</Button>}
          style={{ borderRadius: 10 }}
        />
      )}

      {state === 'empty' && (
        <div className="sales-page__empty">
          <ShoppingCartOutlined className="sales-page__empty-icon" />
          <Text className="sales-page__empty-text">Henüz satış kaydı yok</Text>
          <Button type="primary" danger icon={<PlusOutlined />} onClick={() => { setView('new'); setStep(1); }}>
            İlk Satışı Yap
          </Button>
        </div>
      )}

      {state === 'loaded' && (
        <Table<Sale>
          columns={saleColumns}
          dataSource={filteredSales}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (t) => `Toplam ${t} satış` }}
          style={{ background: '#fff', borderRadius: 12 }}
          scroll={{ x: 1100 }}
        />
      )}
    </>
  );

  const renderNewSaleView = () => (
    <>
      <div className="sales-page__top-bar">
        <div className="sales-page__title-row">
          <h1 className="sales-page__title">Yeni Satış</h1>
        </div>
        <Button onClick={() => { setView('list'); setStep(1); setCartItems([]); setSelectedCustomer(null); }}>
          Listeye Dön
        </Button>
      </div>

      <Steps
        current={step - 1}
        onChange={(s) => setStep((s + 1) as SaleStep)}
        style={{ marginBottom: 24 }}
        items={[
          { title: 'Müşteri Seçimi' },
          { title: 'Ürün Ekleme' },
          { title: 'Önizleme & Onay' },
        ]}
      />

      {step === 1 && (
        <div className="sales-page__step-content">
          <Title level={4} className="sales-page__step-title">Müşteri Seçimi</Title>

          <Select
            showSearch
            placeholder="Müşteri adı veya telefon ile ara..."
            filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
            options={customers.map((c) => ({ value: c.id, label: `${c.name} - ${c.phone}` }))}
            onChange={(id) => {
              const customer = customers.find((c) => c.id === id);
              setSelectedCustomer(customer ?? null);
              if (customer) setStep(2);
            }}
            style={{ width: '100%', marginBottom: 16 }}
            size="large"
            value={selectedCustomer?.id}
          />

          <Button type="link" onClick={() => setShowNewCustomer(!showNewCustomer)}>
            {showNewCustomer ? 'Vazgeç' : '+ Yeni Müşteri Ekle'}
          </Button>

          {showNewCustomer && (
            <Form form={newCustomerForm} layout="vertical" style={{ marginTop: 16, maxWidth: 500 }}>
              <Form.Item name="name" label="Ad Soyad" rules={[{ required: true, message: 'Ad soyad gerekli' }]}>
                <Input placeholder="Ad Soyad" />
              </Form.Item>
              <Form.Item name="phone" label="Telefon" rules={[{ required: true, message: 'Telefon gerekli' }]}>
                <Input placeholder="05xx xxx xx xx" />
              </Form.Item>
              <Form.Item name="email" label="E-posta">
                <Input placeholder="E-posta" type="email" />
              </Form.Item>
              <Form.Item name="address" label="Adres">
                <Input.TextArea rows={2} placeholder="Adres" />
              </Form.Item>
              <Button type="primary" danger onClick={handleAddCustomer}>
                Kaydet ve Devam Et
              </Button>
            </Form>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="sales-page__step-content">
          <Title level={4} className="sales-page__step-title">Ürün Ekleme</Title>

          <Space style={{ marginBottom: 16 }} size={12}>
            <Select
              showSearch
              placeholder="Ürün ara (isim veya kod)..."
              filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
              options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.code}) - ₺${p.price}` }))}
              onChange={(id) => addToCart(id)}
              style={{ width: 400 }}
              size="large"
            />
            <Button type="primary" danger icon={<CameraOutlined />} onClick={() => setBarcodeOpen(true)}>
              Barkod Okut
            </Button>
          </Space>

          {cartItems.length > 0 ? (
            <>
              <Table<SaleItem>
                columns={cartColumns}
                dataSource={cartItems}
                rowKey="productId"
                pagination={false}
                size="small"
              />

              <div className="sales-page__cart-summary">
                <div className="sales-page__cart-row">
                  <span>Ara Toplam</span>
                  <span>₺{subtotal.toLocaleString('tr-TR')}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="sales-page__cart-row">
                    <span>İskonto</span>
                    <span style={{ color: '#E32727' }}>-₺{discountTotal.toLocaleString('tr-TR')}</span>
                  </div>
                )}
                <div className="sales-page__cart-row">
                  <span>KDV (%20)</span>
                  <span>₺{taxAmount.toFixed(2)}</span>
                </div>
                <div className="sales-page__cart-total">
                  <span>Genel Toplam</span>
                  <span>₺{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <Button type="primary" danger size="large" onClick={() => setStep(3)} disabled={!selectedCustomer}>
                  Devam Et
                </Button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
              Ürün araması yapın veya barkod okutun
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="sales-page__step-content sales-page__preview">
          <Title level={4} className="sales-page__step-title">Önizleme & Onay</Title>

          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Fatura No">PRO-2026-XXX (Otomatik)</Descriptions.Item>
            <Descriptions.Item label="Tarih">{new Date().toLocaleString('tr-TR')}</Descriptions.Item>
            <Descriptions.Item label="Müşteri" span={2}>
              {selectedCustomer?.name} — {selectedCustomer?.phone}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Table<SaleItem>
            columns={[
              { title: 'Ürün', dataIndex: 'productName', key: 'productName' },
              { title: 'Birim Fiyat', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => `₺${v}` },
              { title: 'Adet', dataIndex: 'quantity', key: 'quantity' },
              { title: 'Toplam', key: 'total', render: (_: unknown, r: SaleItem) => `₺${r.total.toFixed(2)}` },
            ]}
            dataSource={cartItems}
            rowKey="productId"
            pagination={false}
            size="small"
          />

          <div className="sales-page__cart-summary">
            <div className="sales-page__cart-row"><span>Ara Toplam</span><span>₺{subtotal.toLocaleString('tr-TR')}</span></div>
            {discountTotal > 0 && <div className="sales-page__cart-row"><span>İskonto</span><span style={{ color: '#E32727' }}>-₺{discountTotal.toLocaleString('tr-TR')}</span></div>}
            <div className="sales-page__cart-row"><span>KDV (%20)</span><span>₺{taxAmount.toFixed(2)}</span></div>
            <div className="sales-page__cart-total"><span>Genel Toplam</span><span>₺{grandTotal.toFixed(2)}</span></div>
          </div>

          <div className="sales-page__preview-actions">
            <Button onClick={() => setStep(2)}>Geri Dön</Button>
            <Button onClick={() => handleCreateSale('proforma')}>Proforma Kaydet</Button>
            <Button type="primary" danger onClick={() => handleCreateSale('invoice')}>
              Faturaya Çevir
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="sales-page">
      {view === 'list' ? renderListView() : renderNewSaleView()}

      {/* Barcode Scanner Modal */}
      {barcodeOpen && (
        <div className="sales-page__barcode-overlay" onClick={() => setBarcodeOpen(false)}>
          <Button className="sales-page__barcode-close" type="text" onClick={() => setBarcodeOpen(false)} style={{ color: '#fff', fontSize: 24 }}>
            ✕
          </Button>
          <div className="sales-page__barcode-viewport" onClick={(e) => e.stopPropagation()}>
            <div className="sales-page__barcode-line" />
          </div>
          <div className="sales-page__barcode-input">
            <Input.Search
              placeholder="Barkod numarası girin..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onSearch={handleBarcodeSubmit}
              enterButton="Tara"
              size="large"
              style={{ background: '#fff' }}
            />
          </div>
          {barcodeResult && (
            <Text style={{ color: barcodeResult.includes('eklendi') ? '#22C55E' : '#E32727', marginTop: 12, fontSize: 16 }}>
              {barcodeResult}
            </Text>
          )}
        </div>
      )}

      {/* Invoice Detail Drawer */}
      <Drawer
        title={detailSale ? `Fatura: ${detailSale.invoiceNo}` : ''}
        open={!!detailSale}
        onClose={() => setDetailSale(null)}
        width={600}
        extra={
          detailSale && (
            <Space>
              <Tag color={detailSale.type === 'invoice' ? 'green' : 'blue'}>
                {detailSale.type === 'invoice' ? 'Fatura' : 'Proforma'}
              </Tag>
              <Button icon={<FilePdfOutlined />}>Yazdır</Button>
            </Space>
          )
        }
      >
        {detailSale && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Fatura No">{detailSale.invoiceNo}</Descriptions.Item>
              <Descriptions.Item label="Tarih">{detailSale.date}</Descriptions.Item>
              <Descriptions.Item label="Müşteri">{detailSale.customer.name}</Descriptions.Item>
              <Descriptions.Item label="Telefon">{detailSale.customer.phone}</Descriptions.Item>
              {detailSale.customer.email && <Descriptions.Item label="E-posta">{detailSale.customer.email}</Descriptions.Item>}
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

            <div className="sales-page__cart-summary" style={{ marginTop: 16 }}>
              <div className="sales-page__cart-row"><span>Ara Toplam</span><span>₺{detailSale.subtotal.toLocaleString('tr-TR')}</span></div>
              {detailSale.discountTotal > 0 && <div className="sales-page__cart-row"><span>İskonto</span><span style={{ color: '#E32727' }}>-₺{detailSale.discountTotal.toLocaleString('tr-TR')}</span></div>}
              <div className="sales-page__cart-row"><span>KDV (%{detailSale.taxRate})</span><span>₺{detailSale.taxAmount.toFixed(2)}</span></div>
              <div className="sales-page__cart-total"><span>Genel Toplam</span><span>₺{detailSale.grandTotal.toFixed(2)}</span></div>
            </div>
          </>
        )}
      </Drawer>

      {/* Convert to Invoice Modal */}
      <Modal
        title="Faturaya Çevir"
        open={!!convertTarget}
        onCancel={() => setConvertTarget(null)}
        onOk={() => { if (convertTarget) { handleConvertToInvoice(convertTarget.id); setConvertTarget(null); } }}
        okText="Faturaya Çevir"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
      >
        <p><strong>{convertTarget?.invoiceNo}</strong> nolu proformayı faturaya çevirmek istediğinize emin misiniz?</p>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        title="Satışı Sil"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={() => { if (deleteTarget) { handleDeleteSale(deleteTarget.id); setDeleteTarget(null); } }}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
      >
        <p><strong>{deleteTarget?.invoiceNo}</strong> nolu satışı silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
