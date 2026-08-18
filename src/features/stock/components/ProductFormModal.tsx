import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Modal, Select, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import type { Product, ProductFormValues } from '../types/stock';
import { getBase64 } from '../../../shared/image';
import './ProductFormModal.css';

interface ProductFormModalProps {
  open: boolean;
  editingProduct: Product | null;
  onCancel: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  initialBarcode?: string;
  hideStockField?: boolean;
  existingBarcodes?: string[];
}

export function ProductFormModal({
  open,
  editingProduct,
  onCancel,
  onSubmit,
  initialBarcode,
  hideStockField,
  existingBarcodes = [],
}: ProductFormModalProps) {
  const [form] = Form.useForm();
  const isEdit = !!editingProduct;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- opening a modal starts a fresh upload draft */
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
        if (initialBarcode) {
          form.setFieldsValue({ barcode: initialBarcode });
        }
        setFileList([]);
      }
    }
  }, [open, editingProduct, form, initialBarcode]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleFinish = async (values: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const imageUrl = fileList.length > 0 && fileList[0].originFileObj
        ? await getBase64(fileList[0].originFileObj as File)
        : fileList[0]?.url || undefined;
      await onSubmit({
        ...values,
        barcode: String(values.barcode).trim(),
        name: String(values.name).trim(),
        imageUrl,
      } as ProductFormValues);
      form.resetFields();
      setFileList([]);
    } finally {
      setIsSubmitting(false);
    }
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
      confirmLoading={isSubmitting}
      closable={!isSubmitting}
      keyboard={!isSubmitting}
      maskClosable={!isSubmitting}
      okText="Kaydet"
      cancelText="İptal"
      okButtonProps={{ danger: true, type: 'primary' }}
      width={640}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        <div className="product-form__grid">
          <Form.Item
            name="barcode"
            label="Barkod"
            rules={[
              { required: true, message: 'Barkod gerekli' },
              { pattern: /^\d{6,32}$/, message: 'Barkod 6-32 haneli sayısal bir değer olmalıdır' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const barcode = String(value).trim();
                  const ownBarcode = editingProduct?.barcode.trim();
                  const duplicate = existingBarcodes.some((item) => item.trim() === barcode);
                  if (duplicate && barcode !== ownBarcode) {
                    return Promise.reject(new Error('Bu barkodla kayıtlı bir ürün zaten var'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Barkod numarası" />
          </Form.Item>
          <Form.Item name="name" label="Tam Adı" rules={[{ required: true, whitespace: true, message: 'Ürün adı gerekli' }]}>
            <Input placeholder="Ürün tam adı" />
          </Form.Item>
        </div>

        <div className="product-form__grid">
          <Form.Item name="brand" label="Marka" rules={[{ required: true, whitespace: true, message: 'Marka gerekli' }]}>
            <Input placeholder="Marka" />
          </Form.Item>
          <Form.Item name="model" label="Model" rules={[{ required: true, whitespace: true, message: 'Model gerekli' }]}>
            <Input placeholder="Model" />
          </Form.Item>
        </div>

        <div className="product-form__grid">
          <Form.Item name="size" label="Beden / Ebat" rules={[{ required: true, message: 'Beden gerekli' }]}>
            <Select placeholder="Beden seçin" options={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Belirtilmemiş'].map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="color" label="Renk" rules={[{ required: true, whitespace: true, message: 'Renk gerekli' }]}>
            <Input placeholder="Renk" />
          </Form.Item>
        </div>

        <div className="product-form__grid">
          <Form.Item name="purchasePrice" label="Alış Fiyatı (₺)" rules={[{ required: true, message: 'Alış fiyatı gerekli' }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0" prefix="₺" />
          </Form.Item>
          <Form.Item name="salePrice" label="Satış Fiyatı (₺)" rules={[{ required: true, message: 'Satış fiyatı gerekli' }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0" prefix="₺" />
          </Form.Item>
        </div>

        <div className={`product-form__grid ${hideStockField ? 'product-form__grid--single' : ''}`}>
          {!hideStockField && (
            <Form.Item name="stock" label="Stok Miktarı" rules={[{ required: true, message: 'Stok miktarı gerekli' }]}>
              <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          )}
          <Form.Item name="minStock" label="Stok Eşik Değeri" rules={[{ required: true, message: 'Eşik değeri gerekli' }]} tooltip="Bu seviyenin altına düşünce kritik stok uyarısı verilir">
            <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="5" />
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
