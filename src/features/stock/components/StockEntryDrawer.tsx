import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Input,
  InputNumber,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { Product, StockEntryItem } from '../types/stock';
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
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState('');
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [isApplying, setIsApplying] = useState(false);

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
    setNewProductOpen(false);
    setPendingBarcode('');
    setPendingQuantity(1);
    setIsApplying(false);
  };

  const handleClose = () => {
    reset();
    onClose();
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
  };

  const handleSearchSubmit = () => {
    const q = search.trim();
    if (!q) return;
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
    setNotFoundBarcode(q);
  };

  const openNewProductForm = () => {
    setPendingBarcode(notFoundBarcode ?? search.trim());
    setNewProductOpen(true);
  };

  const handleNewProductSubmit = async (values: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
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
    setSearch('');
  };

  const updateQuantity = (index: number, quantity: number) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, quantity } : e)));
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const hasInvalidQuantity = entries.some((e) => !e.quantity || e.quantity < 1);
  const hasUndefinedNew = entries.some((e) => e.isNew && !e.newProductData);
  const totalQuantity = entries.reduce((sum, e) => sum + (e.quantity || 0), 0);

  const handleApply = async () => {
    if (entries.length === 0 || hasInvalidQuantity || hasUndefinedNew) return;
    setIsApplying(true);
    try {
      await onApply(entries);
      reset();
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
      render: (_: unknown, _record: StockEntryItem, index: number) => (
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeEntry(index)} />
      ),
    },
  ];

  return (
    <>
      <Drawer
        title="Mal Kabul"
        open={open}
        onClose={handleClose}
        width={720}
        destroyOnClose
        extra={
          <Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {entries.length} ürün · {totalQuantity} adet
            </Text>
            <Button
              type="primary"
              danger
              icon={<InboxOutlined />}
              loading={isApplying}
              disabled={entries.length === 0 || hasInvalidQuantity || hasUndefinedNew}
              onClick={handleApply}
            >
              Stoğa İşle
            </Button>
          </Space>
        }
      >
        <div className="stock-entry__search-row">
          <Input.Search
            prefix={<SearchOutlined />}
            placeholder="Barkod veya ürün adı yazın, Enter'a basın..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setNotFoundBarcode(null);
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
              <div key={p.id} className="stock-entry__suggestion" onClick={() => addExistingProduct(p)}>
                <div>
                  <Text strong style={{ fontSize: 13 }}>{p.name}</Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', marginLeft: 8 }}>{p.barcode}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>Stok: {p.stock}</Text>
              </div>
            ))}
          </div>
        )}

        {notFoundBarcode && (
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message="Bu ürün sistemde kayıtlı değil"
            description={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Barkod: {notFoundBarcode}</Text>
                <InputNumber
                  min={1}
                  value={pendingQuantity}
                  onChange={(v) => setPendingQuantity(v ?? 1)}
                  addonBefore="Adet"
                  style={{ width: 110 }}
                />
                <Button size="small" type="primary" danger icon={<PlusOutlined />} onClick={openNewProductForm}>
                  Yeni Ürün Oluştur
                </Button>
              </div>
            }
            style={{ marginBottom: 16, borderRadius: 10 }}
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
              style={{ marginTop: 16 }}
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
        onCancel={() => setNewProductOpen(false)}
        onSubmit={handleNewProductSubmit}
      />
    </>
  );
}
