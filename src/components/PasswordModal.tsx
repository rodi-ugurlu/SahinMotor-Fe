import { Form, Input, Modal } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface PasswordModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (password: string) => void;
}

export function PasswordModal({ open, onCancel, onSave }: PasswordModalProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: { newPassword: string }) => {
    onSave(values.newPassword);
    form.resetFields();
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={() => { onCancel(); form.resetFields(); }}
      onOk={() => form.submit()}
      okText="Güncelle"
      cancelText="İptal"
      okButtonProps={{ danger: true, type: 'primary' }}
      width={420}
      destroyOnClose
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#FFF5F5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <LockOutlined style={{ fontSize: 28, color: '#E32727' }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>Şifre Güncelle</div>
        <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Yeni şifrenizi belirleyin</div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
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
  );
}
