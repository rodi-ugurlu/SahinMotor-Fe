import { useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShopOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useDealers } from '../hooks/useDealers';
import { getBase64 } from '../../../shared/image';
import type { Dealer, DealerUser } from '../types/dealers';
import './DealersPage.css';

const { Text, Title } = Typography;

const ROLE_COLORS: Record<string, string> = {
  SuperAdmin: '#E32727',
  Admin: '#3B82F6',
  Personel: '#22C55E',
  Guest: '#94A3B8',
};

export default function DealersPage() {
  const {
    filteredDealers, availableUsers, state, search,
    setSearch, handleAdd, handleUpdate, handleDelete,
    handleAssignUser, handleRemoveUser, retry,
  } = useDealers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dealer | null>(null);
  const [detailDealer, setDetailDealer] = useState<Dealer | null>(null);
  const [assignUserId, setAssignUserId] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);

  const openAdd = () => {
    setEditingDealer(null);
    form.resetFields();
    setLogoFileList([]);
    setModalOpen(true);
  };

  const openEdit = (dealer: Dealer) => {
    setEditingDealer(dealer);
    form.setFieldsValue({ name: dealer.name });

    if (dealer.logoUrl) {
      setLogoFileList([{ uid: '-1', name: 'logo.png', status: 'done', url: dealer.logoUrl }]);
    } else {
      setLogoFileList([]);
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const logoUrl = logoFileList.length > 0 && logoFileList[0].originFileObj
        ? await getBase64(logoFileList[0].originFileObj as File)
        : logoFileList[0]?.url || undefined;
      if (editingDealer) {
        await handleUpdate(editingDealer.id, { ...values, logoUrl });
      } else {
        await handleAdd({ ...values, logoUrl });
      }
      setModalOpen(false);
      setEditingDealer(null);
      form.resetFields();
      setLogoFileList([]);
    } catch {
      // validation failed or service error
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      await handleDelete(deleteTarget.id);
      setDeleteTarget(null);
      if (detailDealer?.id === deleteTarget.id) setDetailDealer(null);
    } catch {
      // handled in hook
    }
  };

  const handleAssign = async () => {
    if (!detailDealer || !assignUserId) return;
    await handleAssignUser(detailDealer.id, assignUserId);
    setDetailDealer((prev) => prev ? { ...prev, assignedUserIds: [...prev.assignedUserIds, assignUserId] } : null);
    setAssignUserId(undefined);
  };

  const handleRemove = async (userId: string) => {
    if (!detailDealer) return;
    await handleRemoveUser(detailDealer.id, userId);
    setDetailDealer((prev) => prev ? { ...prev, assignedUserIds: prev.assignedUserIds.filter((id) => id !== userId) } : null);
  };

  const getAssignedUsers = (dealer: Dealer): DealerUser[] =>
    availableUsers.filter((u) => dealer.assignedUserIds.includes(u.id));

  const getUnassignedUsers = (dealer: Dealer): DealerUser[] =>
    availableUsers.filter((u) => !dealer.assignedUserIds.includes(u.id));

  const columns = [
    {
      title: 'Bayi',
      key: 'dealer',
      width: 260,
      render: (_: unknown, record: Dealer) => (
        <div className="dealers-page__dealer-cell">
          <div className="dealers-page__dealer-logo">
            {record.logoUrl ? <img src={record.logoUrl} alt={record.name} /> : record.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="dealers-page__dealer-name">{record.name}</div>
            <div className="dealers-page__dealer-date">Kayıt: {record.createdAt}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Kullanıcılar',
      key: 'users',
      render: (_: unknown, record: Dealer) => {
        const users = getAssignedUsers(record);
        return (
          <div className="dealers-page__user-tags">
            {users.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 13 }}>Atanmamış</Text>
            ) : (
              users.map((u) => (
                <Tag key={u.id} color={ROLE_COLORS[u.role]} style={{ margin: 0 }}>
                  {u.name}
                </Tag>
              ))
            )}
          </div>
        );
      },
    },
    {
      title: 'Kullanıcı Sayısı',
      key: 'userCount',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: Dealer) => (
        <Badge count={record.assignedUserIds.length} color={record.assignedUserIds.length > 0 ? '#E32727' : '#CBD5E1'} showZero />
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 110,
      render: (_: unknown, record: Dealer) => (
        <Space size={8}>
          <Tooltip title="Detay Gör" placement="top">
            <Button type="text" icon={<EyeOutlined style={{ fontSize: 16 }} />} onClick={() => setDetailDealer(record)} />
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
    <div className="dealers-page">
      {state === 'error' && (
        <Alert
          message="Bayi verileri yüklenirken hata oluştu"
          type="error" showIcon
          action={<Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>Yeniden Dene</Button>}
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      <div className="dealers-page__top-bar">
        <div className="dealers-page__title-row">
          <h1 className="dealers-page__title">Bayiler</h1>
          {state === 'loaded' && <Badge count={filteredDealers.length} color="#E32727" />}
        </div>
        <div className="dealers-page__actions">
          <Button type="primary" danger icon={<PlusOutlined />} onClick={openAdd}>
            Yeni Bayi
          </Button>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Bayi adı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
        </div>
      </div>

      {state === 'loading' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      )}

      {state === 'empty' && (
        <div className="dealers-page__empty">
          <ShopOutlined className="dealers-page__empty-icon" />
          <Text className="dealers-page__empty-text">Henüz bayi eklenmemiş</Text>
          <Button type="primary" danger icon={<PlusOutlined />} onClick={openAdd}>
            İlk Bayiyi Ekle
          </Button>
        </div>
      )}

      {state === 'loaded' && (
        <Table<Dealer>
          columns={columns}
          dataSource={filteredDealers}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (_t, range) => `Bu sayfada ${range[0]}-${range[1]} gösteriliyor` }}
          style={{ background: '#fff', borderRadius: 12 }}
          locale={{ emptyText: 'Aramanızla eşleşen bayi bulunamadı' }}
          scroll={{ x: 800 }}
        />
      )}

      <Modal
        title={editingDealer ? 'Bayi Düzenle' : 'Yeni Bayi Ekle'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingDealer(null); form.resetFields(); }}
        onOk={handleSubmit}
        okText="Kaydet"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Bayi Adı" rules={[{ required: true, message: 'Bayi adı gerekli' }]}>
            <Input placeholder="Bayi adı" size="large" />
          </Form.Item>

          <Form.Item label="Logo">
            <Upload
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              fileList={logoFileList}
              onChange={({ fileList: newList }) => setLogoFileList(newList)}
              beforeUpload={() => false}
            >
              {logoFileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Yükle</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={detailDealer ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              src={detailDealer.logoUrl}
              size={36}
              style={{ backgroundColor: detailDealer.logoUrl ? 'transparent' : '#E32727', flexShrink: 0 }}
            >
              {!detailDealer.logoUrl && detailDealer.name.charAt(0).toUpperCase()}
            </Avatar>
            <span>{detailDealer.name}</span>
          </div>
        ) : ''}
        open={!!detailDealer}
        onClose={() => { setDetailDealer(null); setAssignUserId(undefined); }}
        width={560}
      >
        {detailDealer && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Bayi Adı">{detailDealer.name}</Descriptions.Item>
              {detailDealer.logoUrl && (
                <Descriptions.Item label="Logo">
                  <img src={detailDealer.logoUrl} alt={detailDealer.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Kayıt Tarihi">{detailDealer.createdAt}</Descriptions.Item>
              <Descriptions.Item label="Kullanıcı Sayısı">
                <Badge count={detailDealer.assignedUserIds.length} color="#E32727" showZero />
              </Descriptions.Item>
            </Descriptions>


            <div className="dealers-page__assign-section">
              <Title level={5} style={{ marginBottom: 16 }}>
                <UserAddOutlined style={{ marginRight: 8 }} />
                Kullanıcı Yönetimi
              </Title>

              <div className="dealers-page__assign-row">
                <Select
                  showSearch
                  placeholder="Kullanıcı seç..."
                  value={assignUserId}
                  onChange={setAssignUserId}
                  style={{ flex: 1 }}
                  size="large"
                  filterOption={(input, option) =>
                    (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={getUnassignedUsers(detailDealer).map((u) => ({
                    value: u.id,
                    label: `${u.name} (${u.role})`,
                  }))}
                  notFoundContent="Atanabilir kullanıcı yok"
                />
                <Button
                  type="primary"
                  danger
                  icon={<UserAddOutlined />}
                  onClick={handleAssign}
                  disabled={!assignUserId}
                  size="large"
                >
                  Ata
                </Button>
              </div>

              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13 }}>Atanmış Kullanıcılar</Text>
              </div>

              {getAssignedUsers(detailDealer).length === 0 ? (
                <Text type="secondary" style={{ fontSize: 13 }}>Henüz kullanıcı atanmamış</Text>
              ) : (
                <div className="dealers-page__assigned-list">
                  {getAssignedUsers(detailDealer).map((u) => (
                    <div key={u.id} className="dealers-page__assigned-user">
                      <div
                        className="dealers-page__assigned-user-avatar"
                        style={{ backgroundColor: ROLE_COLORS[u.role] || '#94A3B8' }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="dealers-page__assigned-user-name">{u.name}</div>
                        <div className="dealers-page__assigned-user-role">{u.role}</div>
                      </div>
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<UserDeleteOutlined />}
                        onClick={() => handleRemove(u.id)}
                        style={{ marginLeft: 4 }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title="Bayiyi Sil"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={executeDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
      >
        <p>
          <strong>{deleteTarget?.name}</strong> bayisini silmek istediğinize emin misiniz?
          {deleteTarget && deleteTarget.assignedUserIds.length > 0 && (
            <span style={{ display: 'block', marginTop: 8, color: '#E32727' }}>
              Bu bayiye atanmış {deleteTarget.assignedUserIds.length} kullanıcı bulunuyor.
            </span>
          )}
        </p>
      </Modal>
    </div>
  );
}
