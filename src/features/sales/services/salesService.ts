import type { Customer, Sale, SaleItem } from '../types/sales';

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Ahmet Yılmaz', phone: '0532 123 45 67', email: 'ahmet@mail.com', address: 'Kadıköy, İstanbul' },
  { id: 'c2', name: 'Mehmet Kaya', phone: '0533 987 65 43', email: 'mehmet@mail.com', address: 'Beşiktaş, İstanbul' },
  { id: 'c3', name: 'Ayşe Demir', phone: '0555 456 78 90', email: 'ayse@mail.com', address: 'Çankaya, Ankara' },
  { id: 'c4', name: 'Ali Öztürk', phone: '0542 111 22 33' },
  { id: 'c5', name: 'Can Yıldız', phone: '0530 444 55 66', email: 'can@mail.com' },
];

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Motul 10W40 Motor Yağı', code: 'MTO-001', price: 450 },
  { id: 'p2', name: 'Castrol Power1 10W40', code: 'CST-002', price: 380 },
  { id: 'p3', name: 'Fren Hidroliği DOT4', code: 'FRN-001', price: 120 },
  { id: 'p4', name: 'Fren Balatası Ön Set', code: 'FRN-002', price: 280 },
  { id: 'p5', name: 'Hava Filtresi Universal', code: 'FLT-001', price: 85 },
  { id: 'p6', name: 'NGK Buji CR8E', code: 'ELK-001', price: 95 },
  { id: 'p7', name: 'Akü 12V 9Ah', code: 'ELK-002', price: 450 },
  { id: 'p8', name: 'Zincir Seti 520 O-Ring', code: 'ZNC-001', price: 850 },
  { id: 'p9', name: 'Zincir Spreyi 400ml', code: 'ZNC-002', price: 150 },
  { id: 'p10', name: 'LS2 FF320 Kask', code: 'KSM-001', price: 3200 },
];

let sales: Sale[] = [
  {
    id: 's1', invoiceNo: 'PRO-2026-001', date: '06.08.2026 14:30',
    customer: MOCK_CUSTOMERS[0],
    items: [
      { productId: 'p1', productName: 'Motul 10W40 Motor Yağı', productCode: 'MTO-001', unitPrice: 450, quantity: 2, discountPercent: 0, discountAmount: 0, total: 900 },
    ],
    subtotal: 900, discountTotal: 0, taxRate: 20, taxAmount: 180, grandTotal: 1080,
    type: 'invoice', status: 'completed',
  },
  {
    id: 's2', invoiceNo: 'PRO-2026-002', date: '06.08.2026 16:00',
    customer: MOCK_CUSTOMERS[1],
    items: [
      { productId: 'p10', productName: 'LS2 FF320 Kask', productCode: 'KSM-001', unitPrice: 3200, quantity: 1, discountPercent: 10, discountAmount: 320, total: 2880 },
    ],
    subtotal: 3200, discountTotal: 320, taxRate: 20, taxAmount: 576, grandTotal: 3456,
    type: 'invoice', status: 'completed',
  },
  {
    id: 's3', invoiceNo: 'PRO-2026-003', date: '05.08.2026 10:15',
    customer: MOCK_CUSTOMERS[2],
    items: [
      { productId: 'p4', productName: 'Fren Balatası Ön Set', productCode: 'FRN-002', unitPrice: 280, quantity: 1, discountPercent: 0, discountAmount: 0, total: 280 },
      { productId: 'p3', productName: 'Fren Hidroliği DOT4', productCode: 'FRN-001', unitPrice: 120, quantity: 2, discountPercent: 0, discountAmount: 0, total: 240 },
    ],
    subtotal: 520, discountTotal: 0, taxRate: 20, taxAmount: 104, grandTotal: 624,
    type: 'proforma', status: 'pending',
  },
  {
    id: 's4', invoiceNo: 'PRO-2026-004', date: '04.08.2026 09:00',
    customer: MOCK_CUSTOMERS[3],
    items: [
      { productId: 'p6', productName: 'NGK Buji CR8E', productCode: 'ELK-001', unitPrice: 95, quantity: 4, discountPercent: 5, discountAmount: 19, total: 361 },
    ],
    subtotal: 380, discountTotal: 19, taxRate: 20, taxAmount: 72.2, grandTotal: 433.2,
    type: 'invoice', status: 'completed',
  },
  {
    id: 's5', invoiceNo: 'PRO-2026-005', date: '03.08.2026 11:45',
    customer: MOCK_CUSTOMERS[4],
    items: [
      { productId: 'p8', productName: 'Zincir Seti 520 O-Ring', productCode: 'ZNC-001', unitPrice: 850, quantity: 1, discountPercent: 0, discountAmount: 0, total: 850 },
      { productId: 'p9', productName: 'Zincir Spreyi 400ml', productCode: 'ZNC-002', unitPrice: 150, quantity: 1, discountPercent: 0, discountAmount: 0, total: 150 },
    ],
    subtotal: 1000, discountTotal: 0, taxRate: 20, taxAmount: 200, grandTotal: 1200,
    type: 'proforma', status: 'cancelled',
  },
];

let nextInvoiceNo = 6;

export async function getCustomers(): Promise<Customer[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_CUSTOMERS), 300));
}

export async function getProducts(): Promise<Array<{ id: string; name: string; code: string; price: number }>> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS), 300));
}

export async function getSales(): Promise<Sale[]> {
  return new Promise((resolve) => setTimeout(() => resolve([...sales]), 400));
}

export async function createSale(data: {
  customer: Customer;
  items: SaleItem[];
  type: 'proforma' | 'invoice';
}): Promise<Sale> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const subtotal = data.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const discountTotal = data.items.reduce((sum, i) => sum + i.discountAmount, 0);
      const taxRate = 20;
      const taxAmount = (subtotal - discountTotal) * (taxRate / 100);
      const grandTotal = subtotal - discountTotal + taxAmount;

      const sale: Sale = {
        id: String(Date.now()),
        invoiceNo: `PRO-2026-${String(nextInvoiceNo++).padStart(3, '0')}`,
        date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        customer: data.customer,
        items: data.items,
        subtotal,
        discountTotal,
        taxRate,
        taxAmount,
        grandTotal,
        type: data.type,
        status: data.type === 'invoice' ? 'completed' : 'pending',
      };
      sales = [sale, ...sales];
      resolve(sale);
    }, 400);
  });
}

export async function convertToInvoice(saleId: string): Promise<Sale> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = sales.findIndex((s) => s.id === saleId);
      if (index === -1) return reject(new Error('Satış bulunamadı'));
      sales[index] = { ...sales[index], type: 'invoice', status: 'completed' };
      resolve(sales[index]);
    }, 300);
  });
}

export async function deleteSale(saleId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      sales = sales.filter((s) => s.id !== saleId);
      resolve();
    }, 300);
  });
}

export async function scanBarcode(code: string): Promise<{ id: string; name: string; code: string; price: number } | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = MOCK_PRODUCTS.find((p) => p.code === code);
      resolve(product ?? null);
    }, 800);
  });
}
