export interface SaleItem {
  productId: string;
  productName: string;
  productCode: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

export type PaymentMethod = 'kart' | 'nakit' | 'havale';
export type SaleStatus = 'taslak' | 'beklemede' | 'bitti' | 'iptal';

export interface Sale {
  id: string;
  bayiId: string;
  personelId: string;
  musteriId: string;
  musteriAdi: string;
  musteriTelefon: string;
  musteriEmail?: string;
  items: SaleItem[];
  toplamTutar: number;
  odemeYontemi: PaymentMethod;
  durum: SaleStatus;
  faturaDosyasi?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
}
