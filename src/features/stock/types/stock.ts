export type ProductCategory = 'Motor Yağı' | 'Fren Sistemi' | 'Filtre' | 'Elektrik' | 'Zincir/Dişli' | 'Diğer';

export interface Product {
  id: string;
  name: string;
  code: string;
  category: ProductCategory;
  stock: number;
  minStock: number;
  priceTL: number;
  priceUSD: number;
  imageUrl?: string;
  description?: string;
}

export type StockFilter = 'all' | 'critical' | 'normal';

export const CATEGORIES: ProductCategory[] = [
  'Motor Yağı',
  'Fren Sistemi',
  'Filtre',
  'Elektrik',
  'Zincir/Dişli',
  'Diğer',
];
