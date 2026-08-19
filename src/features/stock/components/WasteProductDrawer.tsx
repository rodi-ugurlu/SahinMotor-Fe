import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Drawer,
  Empty,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { WorkflowProductSearch } from '../../../components/WorkflowProductSearch';
import { WASTE_REASON_OPTIONS } from '../types/stock';
import type { Product, WasteEntryItem, WasteReason } from '../types/stock';
import './StockEntryDrawer.css';
import './WasteProductDrawer.css';

const { Text } = Typography;

interface WasteProductDrawerProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onApply: (entries: WasteEntryItem[]) => Promise<void>;
}

export function WasteProductDrawer({ open, products, onClose, onApply }: WasteProductDrawerProps) {
  const [entries, setEntries] = useState<WasteEntryItem[]>([]);
  const [search, setSearch] = useState('');
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
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
    setSearchNotice(null);
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

  const addProduct = (product: Product) => {
    if (product.stock < 1) {
      message.warning(`${product.name} için düşülebilecek stok bulunmuyor`);
      return;
    }

    const existingEntry = entries.find((entry) => entry.productId === product.id);
    if (existingEntry) {
      if (existingEntry.quantity >= product.stock) {
        message.warning(`${product.name} için atık miktarı mevcut stoktan fazla olamaz`);
        return;
      }
      setEntries((previousEntries) => previousEntries.map((entry) => (
        entry.productId === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry
      )));
    } else {
      setEntries((previousEntries) => [
        ...previousEntries,
        {
          productId: product.id,
          barcode: product.barcode,
          name: product.name,
          quantity: 1,
        },
      ]);
    }

    setSearch('');
    setSearchNotice(null);
  };

  const handleSearchSubmit = () => {
    const query = search.trim();
    if (!query) return;

    const barcodeMatch = products.find((product) => product.barcode === query);
    if (barcodeMatch) {
      addProduct(barcodeMatch);
      return;
    }

    const normalizedQuery = query.toLocaleLowerCase('tr-TR');
    const nameMatch = products.find((product) => product.name.toLocaleLowerCase('tr-TR') === normalizedQuery);
    if (nameMatch) {
      addProduct(nameMatch);
      return;
    }

    if (filteredProducts.length === 1) {
      addProduct(filteredProducts[0]);
      return;
    }

    if (filteredProducts.length > 1) {
      setSearchNotice('Birden fazla ürün bulundu. Atık listesine eklemek istediğiniz ürünü önerilerden seçin.');
      return;
    }

    setSearchNotice(`“${query}” aramasıyla kayıtlı ürün bulunamadı. Atık işlemi yalnızca mevcut stok ürünlerine uygulanabilir.`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setEntries((previousEntries) => previousEntries.map((entry) => (
      entry.productId === productId ? { ...entry, quantity } : entry
    )));
  };

  const updateReason = (productId: string, reason: WasteReason) => {
    setEntries((previousEntries) => previousEntries.map((entry) => (
      entry.productId === productId ? { ...entry, reason } : entry
    )));
  };

  const removeEntry = (productId: string) => {
    setEntries((previousEntries) => previousEntries.filter((entry) => entry.productId !== productId));
  };

  const getProduct = (productId: string) => products.find((product) => product.id === productId);
  const totalQuantity = entries.reduce((total, entry) => total + (entry.quantity || 0), 0);
  const hasInvalidEntry = entries.some((entry) => {
    const product = getProduct(entry.productId);
    return !product
      || !Number.isSafeInteger(entry.quantity)
      || entry.quantity < 1
      || entry.quantity > product.stock
      || !entry.reason;
  });

  const handleApply = async () => {
    if (entries.length === 0 || hasInvalidEntry) return;
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
      width: 245,
      render: (_: unknown, record: WasteEntryItem) => {
        const product = getProduct(record.productId);
        const identity = product
          ? [product.brand, product.model, product.size, product.color].filter(Boolean).join(' · ')
          : '';
        return (
          <div className="stock-entry__product-cell">
            <Text strong>{record.name}</Text>
            {identity && <Text className="stock-entry__product-meta">{identity}</Text>}
            <Text className="stock-entry__barcode">{record.barcode}</Text>
          </div>
        );
      },
    },
    {
      title: 'Mevcut Stok',
      key: 'currentStock',
      width: 95,
      align: 'center' as const,
      render: (_: unknown, record: WasteEntryItem) => (
        <span className="stock-entry__stock-value">{getProduct(record.productId)?.stock ?? '-'}</span>
      ),
    },
    {
      title: 'Atık Miktarı',
      key: 'quantity',
      width: 120,
      render: (_: unknown, record: WasteEntryItem) => {
        const currentStock = getProduct(record.productId)?.stock ?? 0;
        return (
          <InputNumber
            min={1}
            max={currentStock}
            precision={0}
            value={record.quantity}
            status={record.quantity > currentStock ? 'error' : undefined}
            onChange={(value) => updateQuantity(record.productId, value ?? 1)}
            style={{ width: '100%' }}
          />
        );
      },
    },
    {
      title: 'Atık Nedeni',
      key: 'reason',
      width: 195,
      render: (_: unknown, record: WasteEntryItem) => (
        <Select<WasteReason>
          value={record.reason}
          placeholder="Neden seçin"
          options={[...WASTE_REASON_OPTIONS]}
          onChange={(reason) => updateReason(record.productId, reason)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Kalan Stok',
      key: 'remainingStock',
      width: 95,
      align: 'center' as const,
      render: (_: unknown, record: WasteEntryItem) => {
        const product = getProduct(record.productId);
        const remainingStock = Math.max((product?.stock ?? 0) - (record.quantity || 0), 0);
        const isCritical = product ? remainingStock <= product.minStock : true;
        return (
          <span className={`stock-entry__stock-value waste-product__remaining-stock${isCritical ? ' waste-product__remaining-stock--critical' : ''}`}>
            {remainingStock}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: unknown, record: WasteEntryItem) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          aria-label={`${record.name} ürününü atık listesinden kaldır`}
          title="Listeden kaldır"
          onClick={() => removeEntry(record.productId)}
        />
      ),
    },
  ];

  return (
    <>
      <Drawer
        title="Atık Ürün"
        open={open}
        onClose={handleClose}
        width="min(920px, 100vw)"
        destroyOnHidden
        closable={!isApplying}
        keyboard={!isApplying}
        maskClosable={!isApplying}
        footer={(
          <div className="stock-entry__footer">
            <div className="stock-entry__footer-summary">
              <Text type="secondary">Hazırlanan atık</Text>
              <Text strong>{entries.length} ürün · {totalQuantity} adet</Text>
            </div>
            <Space>
              <Button onClick={handleClose} disabled={isApplying}>Vazgeç</Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                loading={isApplying}
                disabled={entries.length === 0 || hasInvalidEntry}
                onClick={() => setApplyConfirmOpen(true)}
              >
                Stoktan Düş
              </Button>
            </Space>
          </div>
        )}
      >
        <div className="stock-entry__intro waste-product__intro">
          <span className="stock-entry__intro-icon waste-product__intro-icon"><WarningOutlined /></span>
          <div>
            <Text strong>Atık ürün listesini hazırlayın</Text>
            <Text type="secondary">Son kullanma tarihi geçen, hasarlı veya kullanılamaz ürünleri kontrollü şekilde stoktan düşürün.</Text>
          </div>
        </div>

        <div className="stock-entry__search-card">
          <WorkflowProductSearch
            autoFocus
            value={search}
            ariaLabel="Atık listesine ürün eklemek için ara"
            scanLabel="Barkod girişine odaklan"
            onChange={(value) => {
              setSearch(value);
              setSearchNotice(null);
            }}
            onSubmit={handleSearchSubmit}
            options={filteredProducts.slice(0, 5).map((product) => ({
              key: product.id,
              ariaLabel: `${product.name} ürününü atık listesine ekle`,
              onSelect: () => addProduct(product),
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
                  <Text type={product.stock > 0 ? 'secondary' : 'danger'}>
                    Stok: <strong>{product.stock}</strong>
                  </Text>
                </div>
              ),
            }))}
          />
        </div>

        {searchNotice && (
          <Alert
            type="warning"
            showIcon
            message="Ürün atık listesine eklenemedi"
            description={searchNotice}
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
          <Table<WasteEntryItem>
            columns={columns}
            dataSource={entries}
            rowKey="productId"
            pagination={false}
            size="middle"
            scroll={{ x: 800 }}
            className="stock-entry__table waste-product__table"
          />
        )}
      </Drawer>

      <Modal
        title="Atık ürünleri stoktan düş"
        open={applyConfirmOpen}
        onCancel={() => setApplyConfirmOpen(false)}
        onOk={handleApply}
        okText="Stoktan Düş"
        cancelText="Kontrole Dön"
        confirmLoading={isApplying}
        okButtonProps={{ danger: true, type: 'primary' }}
        centered
      >
        <div className="stock-entry__confirm-content waste-product__confirm-content">
          <ExclamationCircleOutlined />
          <div>
            <Text strong>{entries.length} üründen toplam {totalQuantity} adet stoktan düşülecek.</Text>
            <Text type="secondary">Bu işlem seçili ürünlerin stok miktarını azaltır ve atık nedenlerini kaydeder.</Text>
          </div>
        </div>
      </Modal>

      <Modal
        title="Hazırlanan atık listesi silinsin mi?"
        open={discardConfirmOpen}
        onCancel={() => setDiscardConfirmOpen(false)}
        onOk={closeAndReset}
        okText="Listeyi Sil"
        cancelText="Devam Et"
        okButtonProps={{ danger: true }}
        centered
      >
        <Text type="secondary">
          Atık listesindeki {entries.length} ürün henüz stoktan düşülmedi. Kapatırsanız hazırladığınız liste kaybolacak.
        </Text>
      </Modal>
    </>
  );
}
