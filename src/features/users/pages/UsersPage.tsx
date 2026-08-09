import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useUsers } from '../hooks/useUsers';
import { USER_ROLES, ROLE_LABELS, ROLE_COLORS } from '../types/users';
import { getBase64 } from '../../../shared/image';
import type { User, UserRole } from '../types/users';
import './UsersPage.css';

const { Text } = Typography;

const DEALER_NAMES: Record<string, string> = {
  d1: 'Şahin Motor',
  d2: 'Koman Motor',
};

export default function UsersPage() {
  const {
    filteredUsers, state, search, roleFilter,
    setSearch, setRoleFilter,
    handleAdd, handleUpdate, handleDelete, handleResetPassword,
    retry,
  } = useUsers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [photoFileList, setPhotoFileList] = useState<UploadFile[]>([]);

  const openAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setPhotoFileList([]);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      dealerId: user.dealerId,
    });
    if (user.photoUrl) {
      setPhotoFileList([{ uid: '-1', name: 'photo.png', status: 'done', url: user.photoUrl }]);
    } else {
      setPhotoFileList([]);
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const photoUrl = photoFileList.length > 0 && photoFileList[0].originFileObj
        ? await getBase64(photoFileList[0].originFileObj as File)
        : photoFileList[0]?.url || undefined;
      if (editingUser) {
        await handleUpdate(editingUser.id, {
          fullName: values.fullName,
          email: values.email,
          photoUrl,
          role: values.role,
          dealerId: values.dealerId,
        });
      } else {
        await handleAdd({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          photoUrl,
          role: values.role,
          dealerId: values.dealerId,
        });
      }
      setModalOpen(false);
      setEditingUser(null);
      form.resetFields();
      setPhotoFileList([]);
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

  const executeResetPassword = async () => {
    if (!resetTarget) return;
    try {
      const values = await resetForm.validateFields();
      await handleResetPassword(resetTarget.id, values.newPassword);
      setResetTarget(null);
      resetForm.resetFields();
    } catch {
      // validation failed or service error
    }
  };

  const columns = [
    {
      title: 'Kullanıcı',
      key: 'user',
      width: 250,
      render: (_: unknown, record: User) => (
        <div className="users-page__user-cell">
          <div className="users-page__user-avatar" style={{ backgroundColor: ROLE_COLORS[record.role] }}>
            {record.photoUrl ? <img src={record.photoUrl} alt={record.fullName} /> : record.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="users-page__user-name">{record.fullName}</div>
            <div className="users-page__user-email">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 130,
      render: (role: UserRole) => (
        <Tag color={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</Tag>
      ),
    },
    {
      title: 'Bayi',
      key: 'dealer',
      width: 150,
      render: (_: unknown, record: User) => (
        <Text>{DEALER_NAMES[record.dealerId] || record.dealerId}</Text>
      ),
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: User) => (
        <Space size={4}>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button type="text" size="small" icon={<KeyOutlined />} onClick={() => { setResetTarget(record); resetForm.resetFields(); }} title="Şifre Sıfırla" />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => setDeleteTarget(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="users-page">
      {state === 'error' && (
        <Alert
          message="Kullanıcı verileri yüklenirken hata oluştu"
          type="error" showIcon
          action={<Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>Yeniden Dene</Button>}
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      <div className="users-page__top-bar">
        <div className="users-page__title-row">
          <h1 className="users-page__title">Kullanıcılar</h1>
          {state === 'loaded' && <Badge count={filteredUsers.length} color="#E32727" />}
        </div>
        <div className="users-page__actions">
          <Button type="primary" danger icon={<PlusOutlined />} onClick={openAdd}>
            Yeni Kullanıcı
          </Button>
          <Input
            prefix={<SearchOutlined />}
            placeholder="İsim veya e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
        </div>
      </div>

      <div className="users-page__filter-row">
        <Tag
          color={roleFilter === 'all' ? 'blue' : 'default'}
          style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }}
          onClick={() => setRoleFilter('all')}
        >
          Tümü
        </Tag>
        {USER_ROLES.map((role) => (
          <Tag
            key={role}
            color={roleFilter === role ? ROLE_COLORS[role] : 'default'}
            style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }}
            onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
          >
            {ROLE_LABELS[role]}
          </Tag>
        ))}
      </div>

      {state === 'loading' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      )}

      {state === 'empty' && (
        <div className="users-page__empty">
          <TeamOutlined className="users-page__empty-icon" />
          <Text className="users-page__empty-text">Henüz kullanıcı eklenmemiş</Text>
          <Button type="primary" danger icon={<PlusOutlined />} onClick={openAdd}>
            İlk Kullanıcıyı Ekle
          </Button>
        </div>
      )}

      {state === 'loaded' && (
        <Table<User>
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (_t, range) => `Bu sayfada ${range[0]}-${range[1]} gösteriliyor` }}
          style={{ background: '#fff', borderRadius: 12 }}
          locale={{ emptyText: 'Aramanızla eşleşen kullanıcı bulunamadı' }}
          scroll={{ x: 800 }}
        />
      )}

      <Modal
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingUser(null); form.resetFields(); }}
        onOk={handleSubmit}
        okText="Kaydet"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="fullName" label="Ad Soyad" rules={[{ required: true, message: 'Ad soyad gerekli' }]}>
              <Input placeholder="Ad Soyad" />
            </Form.Item>
            <Form.Item name="email" label="E-posta" rules={[{ required: true, message: 'E-posta gerekli' }, { type: 'email', message: 'Geçerli bir e-posta girin' }]}>
              <Input placeholder="ornek@mail.com" type="email" />
            </Form.Item>
          </div>

          {!editingUser && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item
                name="password"
                label="Parola"
                rules={[
                  { required: true, message: 'Parola gerekli' },
                  { min: 6, message: 'En az 6 karakter olmalı' },
                ]}
              >
                <Input.Password placeholder="Parola" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Parola Tekrar"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Parolayı tekrar girin' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('Parolalar eşleşmiyor'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Parola tekrar" />
              </Form.Item>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="role" label="Rol" rules={[{ required: true, message: 'Rol seçin' }]}>
              <Select placeholder="Rol seçin" options={USER_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))} />
            </Form.Item>
            <Form.Item name="dealerId" label="Bayi" rules={[{ required: true, message: 'Bayi seçin' }]}>
              <Select
                placeholder="Bayi seçin"
                options={Object.entries(DEALER_NAMES).map(([id, name]) => ({ value: id, label: name }))}
              />
            </Form.Item>
          </div>

          <Form.Item label="Profil Fotoğrafı">
            <Upload
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              fileList={photoFileList}
              onChange={({ fileList: newList }) => setPhotoFileList(newList)}
              beforeUpload={() => false}
            >
              {photoFileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Yükle</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Şifre Sıfırla"
        open={!!resetTarget}
        onCancel={() => { setResetTarget(null); resetForm.resetFields(); }}
        onOk={executeResetPassword}
        okText="Şifreyi Güncelle"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
        width={420}
        destroyOnClose
      >
        <p style={{ marginBottom: 16 }}>
          <strong>{resetTarget?.fullName}</strong> kullanıcısı için yeni şifre belirleyin.
        </p>
        <Form form={resetForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="Yeni Parola"
            rules={[
              { required: true, message: 'Yeni parola gerekli' },
              { min: 6, message: 'En az 6 karakter olmalı' },
            ]}
          >
            <Input.Password placeholder="Yeni parola" size="large" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Parola Tekrar"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Parolayı tekrar girin' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Parolalar eşleşmiyor'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Parola tekrar" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Kullanıcıyı Sil"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={executeDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, type: 'primary' }}
      >
        <p><strong>{deleteTarget?.fullName}</strong> kullanıcısını silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
