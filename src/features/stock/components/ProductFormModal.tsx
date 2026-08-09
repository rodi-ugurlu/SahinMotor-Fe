import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Modal, Select, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import type { Product } from '../types/stock';
import { getBase64 } from '../../../shared/image';

interface ProductFormModalProps {
  open: boolean;
  editingProduct: Product | null;
  onCancel: () => void;
  onSubmit: (values: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function ProductFormModal({ open, editingProduct, onCancel, onSubmit }: ProductFormModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!editingProduct;
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (open) {
      if (editingProduct) {
        form.setFieldsValue(editingProduct);
        if (editingProduct.imageUrl) {
          setFileList([{ uid: '-1', name: 'image.png', status: 'done', url: editingProduct.imageUrl }]);
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [open, editingProduct, form]);

  const handleFinish = async (values: Record<string, unknown>) => {
    const imageUrl = fileList.length > 0 && fileList[0].originFileObj
      ? await getBase64(fileList[0].originFileObj as File)
      : fileList[0]?.url || undefined;
    await onSubmit({ ...values, imageUrl } as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
    form.resetFields();
    setFileList([]);
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  return (
    <Modal
      title={isEdit ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Kaydet"
      cancelText="İptal"
      okButtonProps={{ danger: true, type: 'primary' }}
      width={640}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="barcode" label="Barkod" rules={[{ required: true, message: 'Barkod gerekli' }]}>
            <Input placeholder="Barkod numarası" />
          </Form.Item>
          <Form.Item name="name" label="Tam Adı" rules={[{ required: true, message: 'Ürün adı gerekli' }]}>
            <Input placeholder="Ürün tam adı" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="brand" label="Marka" rules={[{ required: true, message: 'Marka gerekli' }]}>
            <Input placeholder="Marka" />
          </Form.Item>
          <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Model gerekli' }]}>
            <Input placeholder="Model" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="size" label="Beden / Ebat" rules={[{ required: true, message: 'Beden gerekli' }]}>
            <Select placeholder="Beden seçin" options={['S', 'M', 'L', 'XL', 'Belirtilmemiş'].map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="color" label="Renk" rules={[{ required: true, message: 'Renk gerekli' }]}>
            <Input placeholder="Renk" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="purchasePrice" label="Alış Fiyatı (₺)" rules={[{ required: true, message: 'Alış fiyatı gerekli' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" prefix="₺" />
          </Form.Item>
          <Form.Item name="salePrice" label="Satış Fiyatı (₺)" rules={[{ required: true, message: 'Satış fiyatı gerekli' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" prefix="₺" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="stock" label="Stok Miktarı" rules={[{ required: true, message: 'Stok miktarı gerekli' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item name="minStock" label="Stok Eşik Değeri" rules={[{ required: true, message: 'Eşik değeri gerekli' }]} tooltip="Bu seviyenin altına düşünce kritik stok uyarısı verilir">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="5" />
          </Form.Item>
        </div>

        <Form.Item label="Ürün Görseli">
          <Upload
            listType="picture-card"
            maxCount={1}
            accept="image/*"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
          >
            {fileList.length === 0 && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Yükle</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
