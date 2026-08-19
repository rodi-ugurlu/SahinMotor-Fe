export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  model: string;
  size: string;
  color: string;
  purchasePrice: number;
  salePrice: number;
  imageUrl?: string;
  stock: number;
  minStock: number;
  dealerId: string;
  createdAt: string;
  updatedAt: string;
}

export type StockFilter = 'all' | 'critical' | 'normal';

export type ProductFormValues = Omit<Product, 'id' | 'dealerId' | 'createdAt' | 'updatedAt'>;

export interface StockEntryItem {
  productId?: string;
  barcode: string;
  name: string;
  quantity: number;
  isNew: boolean;
  newProductData?: Omit<Product, 'id' | 'dealerId' | 'createdAt' | 'updatedAt' | 'stock'>;
}

export const WASTE_REASON_OPTIONS = [
  { value: 'expired', label: 'Son kullanma tarihi geçti' },
  { value: 'damaged', label: 'Hasarlı / kırıldı' },
  { value: 'spilled', label: 'Döküldü / sızdırdı' },
  { value: 'unusable', label: 'Kirlenmiş / kullanılamaz' },
  { value: 'other', label: 'Diğer' },
] as const;

export type WasteReason = (typeof WASTE_REASON_OPTIONS)[number]['value'];

export interface WasteEntryItem {
  productId: string;
  barcode: string;
  name: string;
  quantity: number;
  reason?: WasteReason;
}

export interface WasteRecord extends WasteEntryItem {
  id: string;
  dealerId: string;
  reason: WasteReason;
  createdAt: string;
}
