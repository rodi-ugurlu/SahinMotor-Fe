import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Radio,
  Select,
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
  EyeOutlined,
  IdcardOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useCustomers } from '../hooks/useCustomers';
import type { Customer, CustomerFormValues, CustomerType } from '../types/customers';
import './CustomersPage.css';

const { Text, Title } = Typography;

const TYPE_LABELS: Record<CustomerType, string> = {
  individual: 'Bireysel',
  company: 'Kurumsal',
};

const TYPE_COLORS: Record<CustomerType, string> = {
  individual: '#3B82F6',
  company: '#8B5CF6',
};

export default function CustomersPage() {
  const {
    filteredCustomers, state, search, typeFilter,
    setSearch, setTypeFilter, handleAdd, handleUpdate, handleDelete, retry,
  } = useCustomers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();
  const [formType, setFormType] = useState<CustomerType>('individual');

  const openAdd = () => {
    setEditingCustomer(null);
    setFormType('individual');
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormType(customer.type);
    form.setFieldsValue(customer);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values, type: formType };
      if (editingCustomer) {
        await handleUpdate(editingCustomer.id, data);
      } else {
        await handleAdd(data as CustomerFormValues);
      }
      setModalOpen(false);
      setEditingCustomer(null);
      form.resetFields();
    } catch {
      // validation failed or service error
    }
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

  const columns = [
    {
      title: 'Müşteri',
      key: 'customer',
      width: 170,
      render: (_: unknown, record: Customer) => (
        <div className="customers-page__customer-cell">
          <Text className="customers-page__customer-name">{record.fullName}</Text>
          <Text className="customers-page__customer-sub">{record.phone}</Text>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v: CustomerType) => (
        <Tag color={TYPE_COLORS[v]}>{TYPE_LABELS[v]}</Tag>
      ),
    },
    {
      title: 'TC',
      dataIndex: 'tc',
      key: 'tc',
      width: 110,
      render: (v: string) => <Text>{v || '-'}</Text>,
    },
    {
      title: 'VKN',
      dataIndex: 'vkn',
      key: 'vkn',
      width: 110,
      render: (v: string) => <Text>{v || '-'}</Text>,
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
      width: 140,
      ellipsis: true,
      render: (v: string) => <Text>{v}</Text>,
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 90,
      render: (_: unknown, record: Customer) => (
        <Space size={6}>
          <Tooltip title="Detay Gör" placement="top">
            <Button type="text" icon={<EyeOutlined style={{ fontSize: 16 }} />} onClick={() => setDetailCustomer(record)} />
          </Tooltip>
          <Tooltip title="Düzenle" placement="top">
            <Button type="text" icon={<EditOutlined style={{ fontSize: 16 }} />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Sil" placement="top">
            <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 16 }} />} onClick={() => setDeleteTarget(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="customers-page">
      {state === 'error' && (
        <Alert
          message="Müşteri verileri yüklenirken hata oluştu"
          type="error" showIcon
          action={<Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>Yeniden Dene</Button>}
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      <div className="customers-page__top-bar">
        <div className="customers-page__title-row">
          <h1 className="customers-page__title">Müşteriler</h1>
          {state === 'loaded' && <Badge count={filteredCustomers.length} color="#E32727" />}
        </div>
        <div className="customers-page__actions">
          <Button type="primary" danger icon={<PlusOutlined />} onClick={openAdd}>
            Yeni Müşteri
          </Button>
          <Select
            value={typeFilter}
            onChange={(v) => setTypeFilter(v)}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'Tümü' },
              { value: 'individual', label: 'Bireysel' },
              { value: 'company', label: 'Kurumsal' },
            ]}
          />
          <Input
            prefix={<SearchOutlined />}
            placeholder="İsim, telefon, TC, VKN ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
        </div>
      </div>

      {state === 'loading' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      )}

      {state === 'empty' && (
        <div className="customers-page__empty">
          <IdcardOutlined className="customers-page__empty-icon" />
          <Text className="customers-page__empty-text">Henüz müşteri eklenmemiş</Text>
          <Button type="primary" danger icon={<PlusOutlined />} onClick={openAdd}>
            İlk Müşteriyi Ekle
          </Button>
        </div>
      )}

      {state === 'loaded' && (
        <Table<Customer>
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (_t, range) => `Bu sayfada ${range[0]}-${range[1]} gösteriliyor` }}
          style={{ background: '#fff', borderRadius: 12 }}
          locale={{ emptyText: 'Aramanızla eşleşen müşteri bulunamadı' }}
          scroll={{ x: 600 }}
        />
      )}

      <Modal
        title={editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingCustomer(null); form.resetFields(); }}
        onOk={handleSubmit}
        okText="Kaydet"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Müşteri Tipi">
            <Radio.Group
              value={formType}
              onChange={(e) => {
                setFormType(e.target.value);
                form.resetFields();
              }}
              disabled={!!editingCustomer}
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

          <Form.Item
            name="fullName"
            label={formType === 'individual' ? 'Ad Soyad' : 'Firma Adı'}
            rules={[{ required: true, message: formType === 'individual' ? 'Ad soyad gerekli' : 'Firma adı gerekli' }]}
          >
            <Input placeholder={formType === 'individual' ? 'Ad Soyad' : 'Firma Adı'} />
          </Form.Item>

          {formType === 'individual' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item name="tc" label="TC Kimlik No" rules={[{ required: true, message: 'TC gerekli' }, { pattern: /^\d{11}$/, message: 'TC 11 haneli olmalıdır' }]}>
                <Input placeholder="12345678901" maxLength={11} />
              </Form.Item>
              <Form.Item name="phone" label="Telefon" rules={[{ required: true, message: 'Telefon gerekli' }]}>
                <Input placeholder="05xx xxx xx xx" />
              </Form.Item>
            </div>
          )}

          {formType === 'company' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Form.Item name="vkn" label="Vergi No" rules={[{ required: true, message: 'VKN gerekli' }, { pattern: /^\d{10}$/, message: 'VKN 10 haneli olmalıdır' }]}>
                  <Input placeholder="1234567890" maxLength={10} />
                </Form.Item>
                <Form.Item name="taxOffice" label="Vergi Dairesi" rules={[{ required: true, message: 'Vergi dairesi gerekli' }]}>
                  <Input placeholder="Vergi dairesi adı" />
                </Form.Item>
              </div>
              <Form.Item name="phone" label="Telefon" rules={[{ required: true, message: 'Telefon gerekli' }]}>
                <Input placeholder="05xx xxx xx xx" />
              </Form.Item>
            </>
          )}

          <Form.Item name="email" label="E-posta" rules={[{ type: 'email', message: 'Geçerli bir e-posta girin' }]}>
            <Input placeholder="ornek@mail.com" type="email" />
          </Form.Item>

          <Form.Item name="billingAddress" label="Fatura Adresi" rules={[{ required: true, message: 'Fatura adresi gerekli' }]}>
            <Input.TextArea rows={2} placeholder="Açık fatura adresi" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={detailCustomer ? `${detailCustomer.fullName} — Detay` : ''}
        open={!!detailCustomer}
        onClose={() => setDetailCustomer(null)}
        width={560}
      >
        {detailCustomer && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Ad Soyad">{detailCustomer.fullName}</Descriptions.Item>
              <Descriptions.Item label="Müşteri Tipi">
                <Tag color={TYPE_COLORS[detailCustomer.type]}>{TYPE_LABELS[detailCustomer.type]}</Tag>
              </Descriptions.Item>
              {detailCustomer.type === 'individual' && (
                <Descriptions.Item label="TC Kimlik No">{detailCustomer.tc}</Descriptions.Item>
              )}
              {detailCustomer.type === 'company' && (
                <>
                  <Descriptions.Item label="Vergi No (VKN)">{detailCustomer.vkn}</Descriptions.Item>
                  <Descriptions.Item label="Vergi Dairesi">{detailCustomer.taxOffice}</Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Telefon">{detailCustomer.phone}</Descriptions.Item>
              <Descriptions.Item label="E-posta">{detailCustomer.email}</Descriptions.Item>
              <Descriptions.Item label="Fatura Adresi">{detailCustomer.billingAddress}</Descriptions.Item>
              <Descriptions.Item label="Kayıt Tarihi">{detailCustomer.createdAt}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginBottom: 12 }}>
              <ShoppingCartOutlined style={{ marginRight: 8 }} />
              Alışveriş Geçmişi
            </Title>
            <div style={{ color: '#94A3B8', textAlign: 'center', padding: 24 }}>
              Alışveriş geçmişi yakında eklenecek
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title="Müşteriyi Sil"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={executeDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
      >
        <p><strong>{deleteTarget?.fullName}</strong> müşterisini silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
