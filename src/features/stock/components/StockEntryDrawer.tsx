import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { Product, ProductFormValues, StockEntryItem } from '../types/stock';
import { ProductFormModal } from './ProductFormModal';
import './StockEntryDrawer.css';

const { Text } = Typography;

interface StockEntryDrawerProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onApply: (entries: StockEntryItem[]) => Promise<void>;
}

export function StockEntryDrawer({ open, products, onClose, onApply }: StockEntryDrawerProps) {
  const [entries, setEntries] = useState<StockEntryItem[]>([]);
  const [search, setSearch] = useState('');
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [noMatchQuery, setNoMatchQuery] = useState<string | null>(null);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState('');
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [isApplying, setIsApplying] = useState(false);
  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q)
    );
  }, [products, search]);

  const reset = () => {
    setEntries([]);
    setSearch('');
    setNotFoundBarcode(null);
    setNoMatchQuery(null);
    setNewProductOpen(false);
    setPendingBarcode('');
    setPendingQuantity(1);
    setIsApplying(false);
    setApplyConfirmOpen(false);
    setDiscardConfirmOpen(false);
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  const handleClose = () => {
    if (isApplying) return;
    if (entries.length > 0) {
      setDiscardConfirmOpen(true);
      return;
    }
    closeAndReset();
  };

  const addExistingProduct = (product: Product) => {
    setEntries((prev) => {
      const existing = prev.find((e) => !e.isNew && e.productId === product.id);
      if (existing) {
        return prev.map((e) =>
          e.productId === product.id ? { ...e, quantity: e.quantity + 1 } : e
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          barcode: product.barcode,
          name: product.name,
          quantity: 1,
          isNew: false,
        },
      ];
    });
    setSearch('');
    setNotFoundBarcode(null);
    setNoMatchQuery(null);
  };

  const handleSearchSubmit = () => {
    const q = search.trim();
    if (!q) return;
    const stagedEntry = entries.find((entry) => entry.barcode === q);
    if (stagedEntry) {
      setEntries((prev) => prev.map((entry) => (
        entry.barcode === q ? { ...entry, quantity: entry.quantity + 1 } : entry
      )));
      setSearch('');
      setNotFoundBarcode(null);
      setNoMatchQuery(null);
      return;
    }
    const byBarcode = products.find((p) => p.barcode === q);
    if (byBarcode) {
      addExistingProduct(byBarcode);
      return;
    }
    const byName = products.find((p) => p.name.toLowerCase() === q.toLowerCase());
    if (byName) {
      addExistingProduct(byName);
      return;
    }
    if (filteredProducts.length === 1) {
      addExistingProduct(filteredProducts[0]);
      return;
    }
    if (filteredProducts.length > 1) {
      setNotFoundBarcode(null);
      setNoMatchQuery('Birden fazla ürün bulundu. Listeden eklemek istediğiniz ürünü seçin.');
      return;
    }
    if (/^\d{6,32}$/.test(q)) {
      setPendingQuantity(1);
      setNotFoundBarcode(q);
      setNoMatchQuery(null);
      return;
    }
    setNotFoundBarcode(null);
    setNoMatchQuery(`“${q}” aramasıyla eşleşen ürün bulunamadı. Yeni ürün eklemek için barkod numarasıyla arayın.`);
  };

  const openNewProductForm = () => {
    setPendingBarcode(notFoundBarcode ?? search.trim());
    setNewProductOpen(true);
  };

  const handleNewProductSubmit = async (values: ProductFormValues) => {
    const { stock: _ignoredStock, ...rest } = values;
    void _ignoredStock;
    setEntries((prev) => {
      const existing = prev.find((e) => e.isNew && e.barcode === rest.barcode);
      if (existing) {
        return prev.map((e) =>
          e.isNew && e.barcode === rest.barcode ? { ...e, quantity: e.quantity + pendingQuantity } : e
        );
      }
      return [
        ...prev,
        {
          barcode: rest.barcode,
          name: rest.name,
          quantity: pendingQuantity,
          isNew: true,
          newProductData: rest,
        },
      ];
    });
    setNewProductOpen(false);
    setNotFoundBarcode(null);
    setNoMatchQuery(null);
    setSearch('');
    setPendingBarcode('');
    setPendingQuantity(1);
  };

  const updateQuantity = (index: number, quantity: number) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, quantity } : e)));
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const hasInvalidQuantity = entries.some((e) => !Number.isSafeInteger(e.quantity) || e.quantity < 1);
  const hasUndefinedNew = entries.some((e) => e.isNew && !e.newProductData);
  const totalQuantity = entries.reduce((sum, e) => sum + (e.quantity || 0), 0);

  const handleApply = async () => {
    if (entries.length === 0 || hasInvalidQuantity || hasUndefinedNew) return;
    setIsApplying(true);
    try {
      await onApply(entries);
      reset();
      onClose();
    } catch {
      // handled in hook
    } finally {
      setIsApplying(false);
    }
  };

  const columns = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_: unknown, record: StockEntryItem) => (
        <div className="stock-entry__product-cell">
          <Text strong style={{ fontSize: 13 }}>{record.name}</Text>
          <Text style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{record.barcode}</Text>
          {record.isNew && <Tag color="purple" style={{ marginLeft: 4, fontSize: 10 }}>Yeni ürün</Tag>}
        </div>
      ),
    },
    {
      title: 'Mevcut Stok',
      key: 'current',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: StockEntryItem) => {
        if (record.isNew) return <Text type="secondary">-</Text>;
        const product = products.find((p) => p.id === record.productId);
        return <Text>{product?.stock ?? '-'}</Text>;
      },
    },
    {
      title: 'Giriş Miktarı',
      key: 'quantity',
      width: 130,
      render: (_: unknown, record: StockEntryItem, index: number) => (
        <InputNumber
          min={1}
          precision={0}
          value={record.quantity}
          onChange={(v) => updateQuantity(index, v ?? 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Yeni Stok',
      key: 'newStock',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: StockEntryItem) => {
        if (record.isNew) return <Text strong style={{ color: '#22C55E' }}>{record.quantity}</Text>;
        const product = products.find((p) => p.id === record.productId);
        const newStock = (product?.stock ?? 0) + (record.quantity || 0);
        return <Text strong style={{ color: '#22C55E' }}>{newStock}</Text>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: unknown, record: StockEntryItem, index: number) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          aria-label={`${record.name} ürününü listeden kaldır`}
          onClick={() => removeEntry(index)}
        />
      ),
    },
  ];

  return (
    <>
      <Drawer
        title="Mal Kabul"
        open={open}
        onClose={handleClose}
        width={860}
        destroyOnClose
        closable={!isApplying}
        keyboard={!isApplying}
        maskClosable={!isApplying}
        footer={
          <div className="stock-entry__footer">
            <div className="stock-entry__footer-summary">
              <Text type="secondary">Hazırlanan kabul</Text>
              <Text strong>{entries.length} ürün · {totalQuantity} adet</Text>
            </div>
            <Space>
              <Button onClick={handleClose} disabled={isApplying}>Vazgeç</Button>
              <Button
                type="primary"
                danger
                icon={<InboxOutlined />}
                loading={isApplying}
                disabled={entries.length === 0 || hasInvalidQuantity || hasUndefinedNew}
                onClick={() => setApplyConfirmOpen(true)}
              >
                Stoğa İşle
              </Button>
            </Space>
          </div>
        }
      >
        <div className="stock-entry__intro">
          <span className="stock-entry__intro-icon"><InboxOutlined /></span>
          <div>
            <Text strong>Ürünleri kabul listesinde hazırlayın</Text>
            <Text type="secondary">Barkodu okutun veya ürün adını arayın. Stoklar yalnızca listeyi onayladığınızda güncellenir.</Text>
          </div>
        </div>

        <div className="stock-entry__search-card">
          <Input.Search
            prefix={<SearchOutlined />}
            placeholder="Barkod veya ürün adı yazın, Enter'a basın..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setNotFoundBarcode(null);
              setNoMatchQuery(null);
            }}
            onSearch={handleSearchSubmit}
            enterButton="Ekle"
            size="large"
            allowClear
          />
        </div>

        {filteredProducts.length > 0 && (
          <div className="stock-entry__suggestions">
            {filteredProducts.slice(0, 5).map((p) => (
              <button key={p.id} type="button" className="stock-entry__suggestion" onClick={() => addExistingProduct(p)}>
                <div>
                  <Text strong style={{ fontSize: 13 }}>{p.name}</Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', marginLeft: 8 }}>{p.barcode}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>Stok: {p.stock}</Text>
              </button>
            ))}
          </div>
        )}

        {noMatchQuery && (
          <Alert
            type="info"
            showIcon
            message="Ürün seçilemedi"
            description={noMatchQuery}
            className="stock-entry__notice"
          />
        )}

        {notFoundBarcode && (
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message="Bu ürün sistemde kayıtlı değil"
            description={
              <div className="stock-entry__new-product-action">
                <div>
                  <Text type="secondary">Barkod</Text>
                  <Text code>{notFoundBarcode}</Text>
                </div>
                <InputNumber
                  min={1}
                  precision={0}
                  value={pendingQuantity}
                  onChange={(v) => setPendingQuantity(v ?? 1)}
                  addonBefore="Adet"
                  style={{ width: 128 }}
                />
                <Button size="small" type="primary" danger icon={<PlusOutlined />} onClick={openNewProductForm}>
                  Yeni Ürün Oluştur
                </Button>
              </div>
            }
            className="stock-entry__notice"
          />
        )}

        {entries.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Henüz ürün eklenmedi. Barkod veya ürün adı ile arayın."
            style={{ marginTop: 48 }}
          />
        ) : (
          <>
            <Table<StockEntryItem>
              columns={columns}
              dataSource={entries}
              rowKey={(r) => r.productId ?? r.barcode}
              pagination={false}
              size="middle"
              scroll={{ x: 680 }}
              className="stock-entry__table"
            />
            <div className="stock-entry__summary">
              <Text>
                <strong>{entries.length} ürüne</strong> toplam <strong>{totalQuantity} adet</strong> stok girişi yapılacak
              </Text>
            </div>
          </>
        )}
      </Drawer>

      <ProductFormModal
        open={newProductOpen}
        editingProduct={null}
        initialBarcode={pendingBarcode}
        hideStockField
        existingBarcodes={[
          ...products.map((product) => product.barcode),
          ...entries.map((entry) => entry.barcode),
        ]}
        onCancel={() => setNewProductOpen(false)}
        onSubmit={handleNewProductSubmit}
      />

      <Modal
        title="Mal kabulü tamamla"
        open={applyConfirmOpen}
        onCancel={() => setApplyConfirmOpen(false)}
        onOk={handleApply}
        okText="Stoğa İşle"
        cancelText="Kontrole Dön"
        confirmLoading={isApplying}
        okButtonProps={{ danger: true, type: 'primary' }}
        centered
      >
        <div className="stock-entry__confirm-content">
          <CheckCircleOutlined />
          <div>
            <Text strong>{entries.length} ürüne toplam {totalQuantity} adet stok girişi yapılacak.</Text>
            <Text type="secondary">Onayladığınızda listedeki miktarlar mevcut stoklara eklenecek.</Text>
          </div>
        </div>
      </Modal>

      <Modal
        title="Hazırlanan liste silinsin mi?"
        open={discardConfirmOpen}
        onCancel={() => setDiscardConfirmOpen(false)}
        onOk={closeAndReset}
        okText="Listeyi Sil"
        cancelText="Devam Et"
        okButtonProps={{ danger: true }}
        centered
      >
        <Text type="secondary">
          Mal kabul listesindeki {entries.length} ürün henüz stoğa işlenmedi. Kapatırsanız hazırladığınız liste kaybolacak.
        </Text>
      </Modal>
    </>
  );
}
