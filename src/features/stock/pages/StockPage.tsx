import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Input,
  Modal,
  Progress,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  CameraOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useStock } from '../hooks/useStock';
import { ProductFormModal } from '../components/ProductFormModal';
import type { Product } from '../types/stock';
import './StockPage.css';

const { Text } = Typography;

function getStockColor(stock: number, min: number): 'danger' | 'warning' | 'safe' {
  if (stock <= min) return 'danger';
  if (stock <= min * 2) return 'warning';
  return 'safe';
}

function getStockPercent(stock: number, min: number): number {
  const max = min * 4;
  return Math.min(Math.round((stock / max) * 100), 100);
}

function getStockStatus(stock: number, min: number): { color: string; label: string } {
  const c = getStockColor(stock, min);
  if (c === 'danger') return { color: 'red', label: 'Kritik' };
  if (c === 'warning') return { color: 'orange', label: 'Az' };
  return { color: 'green', label: 'Yeterli' };
}

export default function StockPage() {
  const {
    filteredProducts,
    state,
    search,
    filter,
    criticalCount,
    totalValue,
    setSearch,
    setFilter,
    handleAdd,
    handleUpdate,
    handleDelete,
    retry,
  } = useStock();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const openAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const confirmDelete = (product: Product) => {
    setDeleteTarget(product);
  };

  const executeDelete = async () => {
    if (deleteTarget) {
      await handleDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (values: Omit<Product, 'id' | 'priceUSD'>) => {
    if (editingProduct) {
      await handleUpdate(editingProduct.id, values);
    } else {
      await handleAdd(values);
    }
    setModalOpen(false);
    setEditingProduct(null);
  };

  const columns = [
    {
      title: 'Ürün',
      key: 'product',
      width: 280,
      render: (_: unknown, record: Product) => (
        <div className="stock-page__product-cell">
          <div className="stock-page__product-image">
            {record.imageUrl ? <img src={record.imageUrl} alt={record.name} /> : record.name.charAt(0)}
          </div>
          <div className="stock-page__product-info">
            <Text className="stock-page__product-name" ellipsis>{record.name}</Text>
            <Text className="stock-page__product-code">{record.code}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (cat: string) => <Tag>{cat}</Tag>,
    },
    {
      title: 'Stok Adedi',
      key: 'stock',
      width: 140,
      sorter: (a: Product, b: Product) => a.stock - b.stock,
      render: (_: unknown, record: Product) => {
        const color = getStockColor(record.stock, record.minStock);
        return (
          <div className="stock-page__stock-cell">
            <Text className={`stock-page__stock-count stock-page__stock-count--${color}`}>
              {record.stock}
            </Text>
            <Progress
              percent={getStockPercent(record.stock, record.minStock)}
              size="small"
              showInfo={false}
              strokeColor={color === 'danger' ? '#E32727' : color === 'warning' ? '#F59E0B' : '#22C55E'}
              trailColor="#F1F5F9"
            />
          </div>
        );
      },
    },
    {
      title: 'Min. Stok',
      dataIndex: 'minStock',
      key: 'minStock',
      width: 90,
      align: 'center' as const,
    },
    {
      title: 'Birim Fiyat',
      key: 'price',
      width: 130,
      sorter: (a: Product, b: Product) => a.priceTL - b.priceTL,
      render: (_: unknown, record: Product) => (
        <div>
          <Text strong>₺{record.priceTL.toLocaleString('tr-TR')}</Text>
          <br />
          <Text className="stock-page__price-usd">${record.priceUSD}</Text>
        </div>
      ),
    },
    {
      title: 'Dolar Fiyat',
      dataIndex: 'priceUSD',
      key: 'priceUSD',
      width: 100,
      render: (val: number) => <Text>${val}</Text>,
      responsive: ['lg' as const],
    },
    {
      title: 'Durum',
      key: 'status',
      width: 90,
      render: (_: unknown, record: Product) => {
        const status = getStockStatus(record.stock, record.minStock);
        return <Badge status={status.color as 'success' | 'warning' | 'error'} text={status.label} />;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Product) => (
        <Space size={4}>
          <Tooltip title="Düzenle">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Sil">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(record)} />
          </Tooltip>
          <Tooltip title="Fotoğraf">
            <Button type="text" size="small" icon={<CameraOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="stock-page">
      {criticalCount > 0 && state === 'loaded' && (
        <Alert
          message={
            <span>
              <WarningOutlined style={{ marginRight: 8 }} />
              {criticalCount} ürün kritik stok seviyesinin altında! Tedarik edilmesi gerekiyor.
            </span>
          }
          type="warning"
          showIcon={false}
          action={
            <Button size="small" type="link" onClick={() => setFilter('critical')}>
              Detay
            </Button>
          }
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      {state === 'error' && (
        <Alert
          message="Stok verileri yüklenirken hata oluştu"
          type="error"
          showIcon
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>
              Yeniden Dene
            </Button>
          }
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      <div className="stock-page__top-bar">
        <div className="stock-page__title-row">
          <h1 className="stock-page__title">Stok Yönetimi</h1>
          {state === 'loaded' && (
            <Badge count={filteredProducts.length} color="#E32727" overflowCount={999} />
          )}
        </div>

        <div className="stock-page__actions">
          <Button type="primary" danger icon={<PlusOutlined />} onClick={openAdd}>
            Yeni Ürün
          </Button>
          <Button icon={<DollarOutlined />}>
            Dolar Kuru: ₺32,50
          </Button>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
        </div>
      </div>

      <div className="stock-page__filter-row">
        <div className="stock-page__filter-tags">
          <Tag
            color={filter === 'all' ? 'red' : 'default'}
            style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }}
            onClick={() => setFilter('all')}
          >
            Tümü
          </Tag>
          <Tag
            color={filter === 'critical' ? 'red' : 'default'}
            style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }}
            onClick={() => setFilter('critical')}
          >
            Kritik Stok {criticalCount > 0 && <Badge count={criticalCount} size="small" style={{ marginLeft: 4 }} />}
          </Tag>
          <Tag
            color={filter === 'normal' ? 'green' : 'default'}
            style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }}
            onClick={() => setFilter('normal')}
          >
            Normal
          </Tag>
        </div>

        <Text className="stock-page__total-value">
          Toplam Stok Değeri: ₺{totalValue.toLocaleString('tr-TR')}
        </Text>
      </div>

      {state === 'loading' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      )}

      {state === 'empty' && (
        <div className="stock-page__empty">
          <InboxOutlined className="stock-page__empty-icon" />
          <Text className="stock-page__empty-text">Henüz ürün eklenmemiş</Text>
          <Button type="primary" danger icon={<PlusOutlined />} onClick={openAdd}>
            İlk Ürünü Ekle
          </Button>
        </div>
      )}

      {state === 'loaded' && (
        <Table<Product>
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (total) => `Toplam ${total} ürün` }}
          style={{ background: '#fff', borderRadius: 12 }}
          locale={{ emptyText: 'Aramanızla eşleşen ürün bulunamadı' }}
          scroll={{ x: 1000 }}
        />
      )}

      <ProductFormModal
        open={modalOpen}
        editingProduct={editingProduct}
        onCancel={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
      />

      <Modal
        title="Ürünü Sil"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={executeDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
      >
        <p>
          <strong>{deleteTarget?.name}</strong> ürününü silmek istediğinize emin misiniz?
        </p>
      </Modal>
    </div>
  );
}
