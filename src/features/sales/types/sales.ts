export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

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

export type SaleType = 'proforma' | 'invoice';
export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customer: Customer;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  type: SaleType;
  status: SaleStatus;
}

export type SalesView = 'list' | 'new';
export type SaleStep = 1 | 2 | 3;
export type SalesFilter = 'all' | 'proforma' | 'invoice' | 'pending' | 'completed';
