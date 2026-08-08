import { useEffect, useState } from 'react';
import { Form, Input, Modal, Upload } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

interface ProfileData {
  fullName: string;
  email: string;
  photoUrl?: string;
}

interface ProfileModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (values: ProfileData) => void;
  initialData: ProfileData;
}

function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

export function ProfileModal({ open, onCancel, onSave, initialData }: ProfileModalProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialData);
      if (initialData.photoUrl) {
        setFileList([{ uid: '-1', name: 'profile.png', status: 'done', url: initialData.photoUrl }]);
      } else {
        setFileList([]);
      }
    }
  }, [open, initialData, form]);

  const handleFinish = async (values: Record<string, unknown>) => {
    const photoUrl = fileList.length > 0 && fileList[0].originFileObj
      ? await getBase64(fileList[0].originFileObj as File)
      : fileList[0]?.url || undefined;
    onSave({ fullName: values.fullName as string, email: values.email as string, photoUrl });
    form.resetFields();
    setFileList([]);
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Kaydet"
      cancelText="İptal"
      okButtonProps={{ danger: true, type: 'primary' }}
      width={480}
      destroyOnClose
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Upload
          listType="picture-circle"
          maxCount={1}
          accept="image/*"
          fileList={fileList}
          onChange={({ fileList: newList }) => setFileList(newList)}
          beforeUpload={() => false}
          showUploadList={{ showPreviewIcon: false }}
        >
          {fileList.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <UserOutlined style={{ fontSize: 24, color: '#94A3B8' }} />
              <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Fotoğraf</span>
            </div>
          ) : null}
        </Upload>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginTop: 12 }}>Profil Düzenle</div>
        <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Ad soyad, e-posta ve profil fotoğrafını güncelle</div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="fullName" label="Ad Soyad" rules={[{ required: true, message: 'Ad soyad gerekli' }]}>
          <Input placeholder="Ad Soyad" size="large" />
        </Form.Item>
        <Form.Item name="email" label="E-posta" rules={[{ required: true, message: 'E-posta gerekli' }, { type: 'email', message: 'Geçerli bir e-posta girin' }]}>
          <Input placeholder="ornek@mail.com" size="large" type="email" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
