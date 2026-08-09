import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Input,
  Modal,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useStock } from '../hooks/useStock';
import { ProductFormModal } from '../components/ProductFormModal';
import type { Product } from '../types/stock';
import './StockPage.css';

const { Text } = Typography;

export default function StockPage() {
  const {
    filteredProducts, state, search, filter,
    setSearch, setFilter, handleAdd, handleUpdate, handleDelete, retry,
  } = useStock();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [formKey, setFormKey] = useState(0);

  const openAdd = () => {
    setEditingProduct(null);
    setFormKey((k) => k + 1);
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
    if (!deleteTarget) return;
    try {
      await handleDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // handled in hook
    }
  };

  const handleSubmit = async (values: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingProduct) {
        await handleUpdate(editingProduct.id, values);
      } else {
        await handleAdd(values);
      }
      setModalOpen(false);
      setEditingProduct(null);
    } catch {
      // handled in hook
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, imageUrl?: string) => {
    if (!imageUrl) return;
    setHoveredImage(imageUrl);
    setHoverPosition({ x: e.clientX + 16, y: e.clientY - 100 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hoveredImage) return;
    setHoverPosition({ x: e.clientX + 16, y: e.clientY - 100 });
  };

  const handleMouseLeave = () => {
    setHoveredImage(null);
  };

  const columns = [
    {
      title: 'Ürün',
      key: 'product',
      width: 260,
      render: (_: unknown, record: Product) => (
        <div
          className="stock-page__product-cell"
          onMouseEnter={(e) => handleMouseEnter(e, record.imageUrl)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="stock-page__product-image">
            {record.imageUrl ? <img src={record.imageUrl} alt={record.name} /> : record.name.charAt(0)}
          </div>
          <div className="stock-page__product-info">
            <Text className="stock-page__product-name" ellipsis>{record.name}</Text>
            <Text className="stock-page__product-barcode">{record.barcode}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Marka',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
      render: (v: string) => <Text>{v}</Text>,
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      width: 100,
      render: (v: string) => <Text>{v}</Text>,
    },
    {
      title: 'Beden',
      dataIndex: 'size',
      key: 'size',
      width: 90,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Renk',
      dataIndex: 'color',
      key: 'color',
      width: 80,
      render: (v: string) => <Text>{v}</Text>,
    },
    {
      title: 'Alış Fiyatı',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      width: 110,
      sorter: (a: Product, b: Product) => a.purchasePrice - b.purchasePrice,
      render: (v: number) => <Text>₺{v.toLocaleString('tr-TR')}</Text>,
    },
    {
      title: 'Satış Fiyatı',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 110,
      sorter: (a: Product, b: Product) => a.salePrice - b.salePrice,
      render: (v: number) => <Text strong>₺{v.toLocaleString('tr-TR')}</Text>,
    },
    {
      title: 'Stok',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      align: 'center' as const,
      sorter: (a: Product, b: Product) => a.stock - b.stock,
      render: (v: number, record: Product) => {
        const color = v <= record.minStock ? '#E32727' : '#22C55E';
        return <Text strong style={{ color, fontSize: 15 }}>{v}</Text>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 90,
      render: (_: unknown, record: Product) => (
        <Space size={8}>
          <Tooltip title="Düzenle" placement="top">
            <Button type="text" icon={<EditOutlined style={{ fontSize: 16 }} />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Sil" placement="top">
            <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 16 }} />} onClick={() => confirmDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="stock-page">
      {state === 'error' && (
        <Alert
          message="Stok verileri yüklenirken hata oluştu"
          type="error" showIcon
          action={<Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>Yeniden Dene</Button>}
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      <div className="stock-page__top-bar">
        <div className="stock-page__title-row">
          <h1 className="stock-page__title">Stok Yönetimi</h1>
          {state === 'loaded' && <Badge count={filteredProducts.length} color="#E32727" overflowCount={999} />}
        </div>
        <div className="stock-page__actions">
          <Button type="primary" danger icon={<PlusOutlined />} onClick={openAdd}>
            Yeni Ürün
          </Button>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Ürün, marka veya model ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
        </div>
      </div>

      <div className="stock-page__filter-row">
        <Tag
          color={filter === 'all' ? 'blue' : 'default'}
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
          Kritik Stok
        </Tag>
        <Tag
          color={filter === 'normal' ? 'green' : 'default'}
          style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }}
          onClick={() => setFilter('normal')}
        >
          Normal
        </Tag>
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
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (_total, range) => `Bu sayfada ${range[0]}-${range[1]} gösteriliyor` }}
          style={{ background: '#fff', borderRadius: 12 }}
          locale={{ emptyText: 'Aramanızla eşleşen ürün bulunamadı' }}
          scroll={{ x: 1100 }}
        />
      )}

      {hoveredImage && (
        <div
          className="stock-page__image-preview"
          style={{ left: hoverPosition.x, top: hoverPosition.y }}
        >
          <img src={hoveredImage} alt="Ürün önizleme" />
        </div>
      )}

      <ProductFormModal
        key={formKey}
        open={modalOpen}
        editingProduct={editingProduct}
        onCancel={() => { setModalOpen(false); setEditingProduct(null); }}
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
        <p><strong>{deleteTarget?.name}</strong> ürününü silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
