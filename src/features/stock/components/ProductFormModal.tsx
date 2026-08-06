import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Product } from '../types/stock';
import { CATEGORIES } from '../types/stock';

const { TextArea } = Input;

interface ProductFormModalProps {
  open: boolean;
  editingProduct: Product | null;
  onCancel: () => void;
  onSubmit: (values: Omit<Product, 'id' | 'priceUSD'>) => Promise<void>;
}

export function ProductFormModal({ open, editingProduct, onCancel, onSubmit }: ProductFormModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!editingProduct;

  useEffect(() => {
    if (open) {
      if (editingProduct) {
        form.setFieldsValue(editingProduct);
      } else {
        form.resetFields();
      }
    }
  }, [open, editingProduct, form]);

  const handleFinish = async (values: Record<string, unknown>) => {
    await onSubmit(values as Omit<Product, 'id' | 'priceUSD'>);
    form.resetFields();
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
          <Form.Item name="name" label="Ürün Adı" rules={[{ required: true, message: 'Ürün adı gerekli' }]}>
            <Input placeholder="Ürün adı" />
          </Form.Item>
          <Form.Item name="code" label="Ürün Kodu" rules={[{ required: true, message: 'Ürün kodu gerekli' }]}>
            <Input placeholder="Otomatik veya manuel" />
          </Form.Item>
        </div>

        <Form.Item name="category" label="Kategori" rules={[{ required: true, message: 'Kategori seçin' }]}>
          <Select placeholder="Kategori seçin" options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="stock" label="Stok Adedi" rules={[{ required: true, message: 'Stok adedi gerekli' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item
            name="minStock"
            label="Minimum Stok"
            rules={[{ required: true, message: 'Min. stok gerekli' }]}
            tooltip="Bu seviyenin altına düşünce uyarı gönderilir"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="5" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="priceTL" label="Birim Fiyat (₺)" rules={[{ required: true, message: 'Fiyat gerekli' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" prefix="₺" />
          </Form.Item>
          <Form.Item name="priceUSD" label="Dolar Fiyatı ($)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Otomatik" prefix="$" disabled />
          </Form.Item>
        </div>

        <Form.Item name="imageUrl" label="Ürün Görseli">
          <Upload
            listType="picture-card"
            maxCount={1}
            accept="image/*"
            beforeUpload={() => false}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Yükle</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item name="description" label="Açıklama">
          <TextArea rows={3} maxLength={200} placeholder="Opsiyonel açıklama" showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
