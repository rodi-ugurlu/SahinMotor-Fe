import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Drawer,
  Empty,
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
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { WorkflowProductSearch } from '../../../components/WorkflowProductSearch';
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
  const [editingNewEntryIndex, setEditingNewEntryIndex] = useState<number | null>(null);
  const [pendingBarcode, setPendingBarcode] = useState('');
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [isApplying, setIsApplying] = useState(false);
  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR');
    if (!query) return [];
    return products.filter((product) => (
      [product.name, product.barcode, product.brand, product.model, product.size, product.color]
        .some((value) => value.toLocaleLowerCase('tr-TR').includes(query))
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
    setEntries((previousEntries) => {
      const existingEntry = previousEntries.find((entry) => !entry.isNew && entry.productId === product.id);
      if (existingEntry) {
        return previousEntries.map((entry) => (
          entry.productId === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        ));
      }
      return [
        ...previousEntries,
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
    const query = search.trim();
    if (!query) return;

    const stagedEntry = entries.find((entry) => entry.barcode === query);
    if (stagedEntry) {
      setEntries((previousEntries) => previousEntries.map((entry) => (
        entry.barcode === query ? { ...entry, quantity: entry.quantity + 1 } : entry
      )));
      setSearch('');
      setNotFoundBarcode(null);
      setNoMatchQuery(null);
      return;
    }

    const barcodeMatch = products.find((product) => product.barcode === query);
    if (barcodeMatch) {
      addExistingProduct(barcodeMatch);
      return;
    }

    const normalizedQuery = query.toLocaleLowerCase('tr-TR');
    const nameMatch = products.find((product) => product.name.toLocaleLowerCase('tr-TR') === normalizedQuery);
    if (nameMatch) {
      addExistingProduct(nameMatch);
      return;
    }

    if (filteredProducts.length === 1) {
      addExistingProduct(filteredProducts[0]);
      return;
    }

    if (filteredProducts.length > 1) {
      setNotFoundBarcode(null);
      setNoMatchQuery('Birden fazla ürün bulundu. Eklemek istediğiniz ürünü öneri listesinden seçin.');
      return;
    }

    if (/^\d{6,32}$/.test(query)) {
      setPendingQuantity(1);
      setNotFoundBarcode(query);
      setNoMatchQuery(null);
      return;
    }

    setNotFoundBarcode(null);
    setNoMatchQuery(`“${query}” aramasıyla eşleşen ürün bulunamadı. Yeni ürün eklemek için barkod numarasıyla arayın.`);
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
    const { stock: _ignoredStock, ...newProductData } = values;
    void _ignoredStock;

    setEntries((previousEntries) => {
      if (editingNewEntryIndex !== null) {
        return previousEntries.map((entry, index) => index === editingNewEntryIndex
          ? {
              ...entry,
              barcode: newProductData.barcode,
              name: newProductData.name,
              newProductData,
            }
          : entry);
      }

      const existingEntry = previousEntries.find((entry) => entry.isNew && entry.barcode === newProductData.barcode);
      if (existingEntry) {
        return previousEntries.map((entry) => (
          entry.isNew && entry.barcode === newProductData.barcode
            ? { ...entry, quantity: entry.quantity + pendingQuantity }
            : entry
        ));
      }

      return [
        ...previousEntries,
        {
          barcode: newProductData.barcode,
          name: newProductData.name,
          quantity: pendingQuantity,
          isNew: true,
          newProductData,
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
    setEntries((previousEntries) => previousEntries.map((entry, entryIndex) => (
      entryIndex === index ? { ...entry, quantity } : entry
    )));
  };

  const removeEntry = (index: number) => {
    setEntries((previousEntries) => previousEntries.filter((_, entryIndex) => entryIndex !== index));
  };

  const getEntryDetails = (entry: StockEntryItem) => entry.isNew
    ? entry.newProductData
    : products.find((product) => product.id === entry.productId);

  const getCurrentStock = (entry: StockEntryItem) => {
    if (entry.isNew) return 0;
    return products.find((product) => product.id === entry.productId)?.stock ?? 0;
  };

  const hasInvalidQuantity = entries.some((entry) => !Number.isSafeInteger(entry.quantity) || entry.quantity < 1);
  const hasUndefinedNewProduct = entries.some((entry) => entry.isNew && !entry.newProductData);
  const totalQuantity = entries.reduce((total, entry) => total + (entry.quantity || 0), 0);
  const newProductCount = entries.filter((entry) => entry.isNew).length;
  const editingNewEntry = editingNewEntryIndex === null ? null : entries[editingNewEntryIndex];

  const handleApply = async () => {
    if (entries.length === 0 || hasInvalidQuantity || hasUndefinedNewProduct) return;
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
      width: 280,
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
      title: 'Mevcut Stok',
      key: 'current',
      width: 105,
      align: 'center' as const,
      render: (_: unknown, record: StockEntryItem) => (
        record.isNew
          ? <span className="stock-entry__stock-value stock-entry__stock-value--empty">Yeni</span>
          : <span className="stock-entry__stock-value">{getCurrentStock(record)}</span>
      ),
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
          onChange={(value) => updateQuantity(index, value ?? 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Yeni Stok',
      key: 'newStock',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: StockEntryItem) => (
        <span className="stock-entry__stock-value stock-entry__stock-value--new">
          {getCurrentStock(record) + (record.quantity || 0)}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 76,
      render: (_: unknown, record: StockEntryItem, index: number) => (
        <Space size={2}>
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

  return (
    <>
      <Drawer
        title="Mal Kabul"
        open={open}
        onClose={handleClose}
        width="min(860px, 100vw)"
        destroyOnHidden
        closable={!isApplying}
        keyboard={!isApplying}
        maskClosable={!isApplying}
        footer={(
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
                disabled={entries.length === 0 || hasInvalidQuantity || hasUndefinedNewProduct}
                onClick={() => setApplyConfirmOpen(true)}
              >
                Stoğa İşle
              </Button>
            </Space>
          </div>
        )}
      >
        <div className="stock-entry__intro">
          <span className="stock-entry__intro-icon"><InboxOutlined /></span>
          <div>
            <Text strong>Ürünleri kabul listesinde hazırlayın</Text>
            <Text type="secondary">Ürünleri arayın veya barkod okutun; stoklar yalnızca onayınızla güncellenir.</Text>
          </div>
        </div>

        <div className="stock-entry__search-card">
          <WorkflowProductSearch
            autoFocus
            value={search}
            ariaLabel="Mal kabul listesine ürün eklemek için ara"
            scanLabel="Barkod girişine odaklan"
            onChange={(value) => {
              setSearch(value);
              setNotFoundBarcode(null);
              setNoMatchQuery(null);
            }}
            onSubmit={handleSearchSubmit}
            options={filteredProducts.slice(0, 5).map((product) => ({
              key: product.id,
              ariaLabel: `${product.name} ürününü mal kabul listesine ekle`,
              onSelect: () => addExistingProduct(product),
              content: (
                <div className="stock-entry__suggestion">
                  <div>
                    <div className="stock-entry__suggestion-heading">
                      <Text strong>{product.name}</Text>
                      <Text className="stock-entry__barcode">{product.barcode}</Text>
                    </div>
                    <Text className="stock-entry__product-meta">
                      {[product.brand, product.model, product.size, product.color].filter(Boolean).join(' · ')}
                    </Text>
                  </div>
                  <Text type="secondary">Stok: <strong>{product.stock}</strong></Text>
                </div>
              ),
            }))}
          />
        </div>

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
            description={(
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
            )}
            className="stock-entry__notice"
          />
        )}

        {entries.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Henüz ürün eklenmedi. Barkod veya ürün adıyla arayın."
            className="stock-entry__empty"
          />
        ) : (
          <>
            <Table<StockEntryItem>
              columns={columns}
              dataSource={entries}
              rowKey={(record) => record.productId ?? record.barcode}
              pagination={false}
              size="middle"
              scroll={{ x: 690 }}
              className="stock-entry__table"
            />
          </>
        )}
      </Drawer>

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
