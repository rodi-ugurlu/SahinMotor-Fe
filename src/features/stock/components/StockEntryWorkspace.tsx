import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { Product, ProductFormValues, StockEntryItem } from '../types/stock';
import { ProductFormModal } from './ProductFormModal';
import './StockEntryWorkspace.css';

const { Text } = Typography;

const formatPrice = (value: number) => `₺${value.toLocaleString('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

interface StockEntryWorkspaceProps {
  products: Product[];
  onClose: () => void;
  onApply: (entries: StockEntryItem[]) => Promise<void>;
}

export function StockEntryWorkspace({ products, onClose, onApply }: StockEntryWorkspaceProps) {
  const [entries, setEntries] = useState<StockEntryItem[]>([]);
  const [search, setSearch] = useState('');
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [noMatchQuery, setNoMatchQuery] = useState<string | null>(null);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [editingNewEntryIndex, setEditingNewEntryIndex] = useState<number | null>(null);
  const [pendingBarcode, setPendingBarcode] = useState('');
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [isApplying, setIsApplying] = useState(false);
  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products.filter((p) => (
      [p.name, p.barcode, p.brand, p.model, p.size, p.color]
        .some((value) => value.toLowerCase().includes(q))
    ));
  }, [products, search]);

  const reset = () => {
    setEntries([]);
    setSearch('');
    setNotFoundBarcode(null);
    setNoMatchQuery(null);
    setNewProductOpen(false);
    setEditingNewEntryIndex(null);
    setPendingBarcode('');
    setPendingQuantity(1);
    setIsApplying(false);
    setApplyConfirmOpen(false);
    setDiscardConfirmOpen(false);
    setClearConfirmOpen(false);
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
    setEditingNewEntryIndex(null);
    setPendingBarcode(notFoundBarcode ?? search.trim());
    setNewProductOpen(true);
  };

  const openNewProductEditForm = (index: number) => {
    setEditingNewEntryIndex(index);
    setNewProductOpen(true);
  };

  const closeNewProductForm = () => {
    setNewProductOpen(false);
    setEditingNewEntryIndex(null);
  };

  const handleNewProductSubmit = async (values: ProductFormValues) => {
    const { stock: _ignoredStock, ...rest } = values;
    void _ignoredStock;
    setEntries((prev) => {
      if (editingNewEntryIndex !== null) {
        return prev.map((entry, index) => index === editingNewEntryIndex
          ? { ...entry, barcode: rest.barcode, name: rest.name, newProductData: rest }
          : entry);
      }
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
    setEditingNewEntryIndex(null);
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

  const clearEntries = () => {
    setEntries([]);
    setSearch('');
    setNotFoundBarcode(null);
    setNoMatchQuery(null);
    setPendingBarcode('');
    setPendingQuantity(1);
    setClearConfirmOpen(false);
  };

  const hasInvalidQuantity = entries.some((e) => !Number.isSafeInteger(e.quantity) || e.quantity < 1);
  const hasUndefinedNew = entries.some((e) => e.isNew && !e.newProductData);
  const totalQuantity = entries.reduce((sum, e) => sum + (e.quantity || 0), 0);
  const newProductCount = entries.filter((entry) => entry.isNew).length;
  const editingNewEntry = editingNewEntryIndex === null ? null : entries[editingNewEntryIndex];
  const getEntryDetails = (entry: StockEntryItem) => entry.isNew
    ? entry.newProductData
    : products.find((product) => product.id === entry.productId);

  const getCurrentStock = (entry: StockEntryItem) => {
    if (entry.isNew) return 0;
    return products.find((product) => product.id === entry.productId)?.stock ?? 0;
  };

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
      width: 300,
      render: (_: unknown, record: StockEntryItem) => {
        const details = getEntryDetails(record);
        const identity = details
          ? [details.brand, details.model, details.size, details.color].filter(Boolean).join(' · ')
          : '';
        return (
          <div className="stock-entry__product-cell">
            <div className="stock-entry__product-heading">
              <Text strong>{record.name}</Text>
              {record.isNew && <Tag color="purple">Yeni ürün</Tag>}
            </div>
            {identity && <Text className="stock-entry__product-meta">{identity}</Text>}
            <Text className="stock-entry__barcode">{record.barcode}</Text>
          </div>
        );
      },
    },
    {
      title: 'Alış / Satış',
      key: 'prices',
      width: 155,
      render: (_: unknown, record: StockEntryItem) => {
        const details = getEntryDetails(record);
        if (!details) return <Text type="secondary">-</Text>;
        return (
          <div className="stock-entry__prices">
            <span><Text type="secondary">Alış</Text><Text>{formatPrice(details.purchasePrice)}</Text></span>
            <span><Text type="secondary">Satış</Text><Text strong>{formatPrice(details.salePrice)}</Text></span>
          </div>
        );
      },
    },
    {
      title: 'Mevcut Stok',
      key: 'current',
      width: 94,
      align: 'center' as const,
      render: (_: unknown, record: StockEntryItem) => {
        if (record.isNew) return <span className="stock-entry__stock-value stock-entry__stock-value--empty">Yeni</span>;
        return <span className="stock-entry__stock-value">{getCurrentStock(record)}</span>;
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
      width: 94,
      align: 'center' as const,
      render: (_: unknown, record: StockEntryItem) => {
        const newStock = getCurrentStock(record) + (record.quantity || 0);
        return <span className="stock-entry__stock-value stock-entry__stock-value--new">{newStock}</span>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 78,
      render: (_: unknown, record: StockEntryItem, index: number) => (
        <Space size={2} className="stock-entry__row-actions">
          {record.isNew && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              aria-label={`${record.name} ürününün bilgilerini düzenle`}
              title="Yeni ürün bilgilerini düzenle"
              onClick={() => openNewProductEditForm(index)}
            />
          )}
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            aria-label={`${record.name} ürününü listeden kaldır`}
            title="Listeden kaldır"
            onClick={() => removeEntry(index)}
          />
        </Space>
      ),
    },
  ];

  const searchPanel = (
    <>
      <div className="stock-entry__search-card">
        <Input.Search
          autoFocus
          prefix={<SearchOutlined />}
          placeholder="Barkod okutun veya ürün adı, marka, model ile arayın..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setNotFoundBarcode(null);
            setNoMatchQuery(null);
          }}
          onSearch={handleSearchSubmit}
          enterButton="Ekle"
          size="large"
          allowClear
          aria-label="Mal kabul listesine ürün ekle"
        />
      </div>

      {filteredProducts.length > 0 && (
        <div className="stock-entry__suggestions">
          {filteredProducts.slice(0, 5).map((product) => (
            <button
              key={product.id}
              type="button"
              className="stock-entry__suggestion"
              onClick={() => addExistingProduct(product)}
            >
              <div className="stock-entry__suggestion-product">
                <div className="stock-entry__suggestion-heading">
                  <Text strong>{product.name}</Text>
                  <Text className="stock-entry__barcode">{product.barcode}</Text>
                </div>
                <Text className="stock-entry__product-meta">
                  {[product.brand, product.model, product.size, product.color].filter(Boolean).join(' · ')}
                </Text>
              </div>
              <div className="stock-entry__suggestion-summary">
                <Text strong>Stok: {product.stock}</Text>
                <Text type="secondary">
                  Alış {formatPrice(product.purchasePrice)} · Satış {formatPrice(product.salePrice)}
                </Text>
              </div>
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
                onChange={(value) => setPendingQuantity(value ?? 1)}
                addonBefore="Adet"
                style={{ width: 132 }}
              />
              <Button type="primary" danger icon={<PlusOutlined />} onClick={openNewProductForm}>
                Yeni Ürün Oluştur
              </Button>
            </div>
          }
          className="stock-entry__notice"
        />
      )}
    </>
  );

  return (
    <>
      <div className="stock-entry__page">
        <header className="stock-entry__page-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleClose}
            disabled={isApplying}
            className="stock-entry__back-button"
          >
            Stok listesine dön
          </Button>
          {entries.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setClearConfirmOpen(true)}
              disabled={isApplying}
            >
              Listeyi Temizle
            </Button>
          )}
        </header>

        {entries.length === 0 ? (
          <section className="stock-entry__spotlight">
            <div className="stock-entry__spotlight-brand">
              <span className="stock-entry__spotlight-icon"><InboxOutlined /></span>
              <h1>Mal Kabul</h1>
              <p>
                Barkodu okutun veya ürün arayın. Eklediğiniz ürünler onaylayana kadar
                stokları değiştirmeden güvenli bir kabul listesinde tutulur.
              </p>
            </div>
            <div className="stock-entry__spotlight-search">{searchPanel}</div>
            <div className="stock-entry__spotlight-hints">
              <span><CheckCircleOutlined /> Aynı barkodu tekrar okutursanız miktar artar</span>
              <span><CheckCircleOutlined /> Tüm stoklar tek onayla birlikte güncellenir</span>
            </div>
          </section>
        ) : (
          <div className="stock-entry__workspace">
            <main className="stock-entry__workspace-main">
              <div className="stock-entry__workspace-heading">
                <div>
                  <div className="stock-entry__workspace-title-row">
                    <h1>Mal Kabul Listesi</h1>
                    <span className="stock-entry__count-badge">{entries.length}</span>
                  </div>
                  <p>Ürünleri ve giriş miktarlarını kontrol ederek listeyi tamamlayın.</p>
                </div>
              </div>

              {searchPanel}

              <div className="stock-entry__table-wrap">
                <Table<StockEntryItem>
                  columns={columns}
                  dataSource={entries}
                  rowKey={(record) => record.productId ?? record.barcode}
                  pagination={false}
                  size="middle"
                  scroll={{ x: 870 }}
                  className="stock-entry__table"
                />
              </div>

              <div className="stock-entry__mobile-list">
                {entries.map((entry, index) => {
                  const details = getEntryDetails(entry);
                  const currentStock = getCurrentStock(entry);
                  const newStock = currentStock + entry.quantity;
                  return (
                    <article className="stock-entry__mobile-card" key={entry.productId ?? entry.barcode}>
                      <div className="stock-entry__mobile-card-header">
                        <div className="stock-entry__product-cell">
                          <div className="stock-entry__product-heading">
                            <Text strong>{entry.name}</Text>
                            {entry.isNew && <Tag color="purple">Yeni ürün</Tag>}
                          </div>
                          {details && (
                            <Text className="stock-entry__product-meta">
                              {[details.brand, details.model, details.size, details.color].filter(Boolean).join(' · ')}
                            </Text>
                          )}
                          <Text className="stock-entry__barcode">{entry.barcode}</Text>
                        </div>
                        <Space size={2}>
                          {entry.isNew && (
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              aria-label={`${entry.name} ürününün bilgilerini düzenle`}
                              onClick={() => openNewProductEditForm(index)}
                            />
                          )}
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            aria-label={`${entry.name} ürününü listeden kaldır`}
                            onClick={() => removeEntry(index)}
                          />
                        </Space>
                      </div>

                      {details && (
                        <div className="stock-entry__mobile-prices">
                          <span><small>Kayıtlı alış</small><strong>{formatPrice(details.purchasePrice)}</strong></span>
                          <span><small>Kayıtlı satış</small><strong>{formatPrice(details.salePrice)}</strong></span>
                        </div>
                      )}

                      <div className="stock-entry__mobile-stock-flow">
                        <span>
                          <small>Mevcut</small>
                          <strong>{entry.isNew ? 'Yeni' : currentStock}</strong>
                        </span>
                        <span className="stock-entry__mobile-flow-arrow">+</span>
                        <label>
                          <small>Giriş miktarı</small>
                          <InputNumber
                            min={1}
                            precision={0}
                            value={entry.quantity}
                            onChange={(value) => updateQuantity(index, value ?? 1)}
                          />
                        </label>
                        <span className="stock-entry__mobile-flow-arrow">=</span>
                        <span>
                          <small>Yeni stok</small>
                          <strong className="stock-entry__mobile-new-stock">{newStock}</strong>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </main>

            <aside className="stock-entry__summary-card">
              <div className="stock-entry__summary-title">
                <span><InboxOutlined /></span>
                <div>
                  <h2>Kabul Özeti</h2>
                  <p>Henüz stoğa işlenmedi</p>
                </div>
              </div>

              <div className="stock-entry__summary-stats">
                <div><span>Ürün çeşidi</span><strong>{entries.length}</strong></div>
                <div><span>Toplam adet</span><strong>{totalQuantity}</strong></div>
                <div><span>Yeni ürün</span><strong>{newProductCount}</strong></div>
              </div>

              {newProductCount > 0 && (
                <div className="stock-entry__summary-new-product">
                  <PlusOutlined />
                  <span>{newProductCount} yeni ürün kartı bu işlemle oluşturulacak.</span>
                </div>
              )}

              <div className="stock-entry__summary-assurance">
                <CheckCircleOutlined />
                <span>Stoklar yalnızca onay verdiğinizde tek seferde güncellenecek.</span>
              </div>

              <div className="stock-entry__summary-actions">
                <Button
                  type="primary"
                  danger
                  block
                  size="large"
                  icon={<InboxOutlined />}
                  loading={isApplying}
                  disabled={hasInvalidQuantity || hasUndefinedNew}
                  onClick={() => setApplyConfirmOpen(true)}
                >
                  Stoğa İşle
                </Button>
                <Button block onClick={handleClose} disabled={isApplying}>Vazgeç</Button>
              </div>
            </aside>
          </div>
        )}
      </div>

      <ProductFormModal
        open={newProductOpen}
        editingProduct={null}
        initialBarcode={editingNewEntry ? undefined : pendingBarcode}
        initialValues={editingNewEntry?.newProductData}
        hideStockField
        title={editingNewEntry ? 'Yeni Ürün Bilgilerini Düzenle' : undefined}
        existingBarcodes={[
          ...products.map((product) => product.barcode),
          ...entries.map((entry) => entry.barcode),
        ]}
        onCancel={closeNewProductForm}
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
            {newProductCount > 0 && (
              <Text type="secondary">Bu işlem sırasında {newProductCount} yeni ürün kartı oluşturulacak.</Text>
            )}
            <Text type="secondary">Onayladığınızda listedeki miktarlar mevcut stoklara eklenecek.</Text>
          </div>
        </div>
      </Modal>

      <Modal
        title="Kabul listesi temizlensin mi?"
        open={clearConfirmOpen}
        onCancel={() => setClearConfirmOpen(false)}
        onOk={clearEntries}
        okText="Listeyi Temizle"
        cancelText="Devam Et"
        okButtonProps={{ danger: true }}
        centered
      >
        <Text type="secondary">
          Listedeki {entries.length} ürün kaldırılacak. Mal Kabul ekranında kalıp yeni bir liste hazırlayabilirsiniz.
        </Text>
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
