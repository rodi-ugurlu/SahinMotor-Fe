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

export interface StockEntryItem {
  productId?: string;
  barcode: string;
  name: string;
  quantity: number;
  isNew: boolean;
  newProductData?: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'stock'>;
}
