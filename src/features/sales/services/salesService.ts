import type { Customer, Sale, SaleItem, PaymentMethod } from '../types/sales';

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Motul 10W40 Motor Yağı', barcode: '8691234567001', price: 450 },
  { id: 'p2', name: 'Castrol Power1 10W40', barcode: '8691234567002', price: 380 },
  { id: 'p3', name: 'Fren Hidroliği DOT4', barcode: '8691234567003', price: 120 },
  { id: 'p4', name: 'Fren Balatası Ön Set', barcode: '8691234567004', price: 280 },
  { id: 'p5', name: 'Hava Filtresi Universal', barcode: '8691234567005', price: 85 },
  { id: 'p6', name: 'NGK Buji CR8E', barcode: '8691234567006', price: 95 },
  { id: 'p7', name: 'Akü 12V 9Ah', barcode: '8691234567007', price: 450 },
  { id: 'p8', name: 'Zincir Seti 520 O-Ring', barcode: '8691234567008', price: 850 },
  { id: 'p9', name: 'Zincir Spreyi 400ml', barcode: '8691234567009', price: 150 },
  { id: 'p10', name: 'LS2 FF320 Kask', barcode: '8691234567010', price: 3200 },
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', fullName: 'Ahmet Yılmaz', type: 'individual', tc: '12345678901', phone: '0532 123 45 67', email: 'ahmet@mail.com', billingAddress: 'Atatürk Cad. No:42, Kadıköy/İstanbul' },
  { id: 'c2', fullName: 'Mehmet Kaya', type: 'individual', tc: '23456789012', phone: '0533 987 65 43', email: 'mehmet@mail.com', billingAddress: 'Cumhuriyet Mah. 123. Sk. No:5, Çankaya/Ankara' },
  { id: 'c3', fullName: 'Ayşe Demir', type: 'individual', tc: '34567890123', phone: '0555 456 78 90', email: 'ayse@mail.com', billingAddress: 'İnönü Bulvarı No:78, Konak/İzmir' },
  { id: 'c4', fullName: 'Öztürk Motor Ltd. Şti.', type: 'company', vkn: '1234567890', taxOffice: 'Kadıköy', phone: '0542 111 22 33', billingAddress: 'Sanayi Sitesi 5. Blok No:12, Kadıköy/İstanbul' },
  { id: 'c5', fullName: 'Yıldız Ticaret A.Ş.', type: 'company', vkn: '2345678901', taxOffice: 'Çankaya', phone: '0530 444 55 66', email: 'can@mail.com', billingAddress: 'Kızılay Meydanı İş Hanı Kat:3, Çankaya/Ankara' },
];

let sales: Sale[] = [
  {
    id: 's1', bayiId: 'd1', personelId: 'u1', musteriId: 'c1',
    musteriAdi: 'Ahmet Yılmaz', musteriTelefon: '0532 123 45 67', musteriEmail: 'ahmet@mail.com',
    items: [
      { productId: 'p1', productName: 'Motul 10W40 Motor Yağı', productCode: '8691234567001', unitPrice: 450, quantity: 2, discountPercent: 0, discountAmount: 0, total: 900 },
    ],
    toplamTutar: 1080, odemeYontemi: 'kart', durum: 'bitti',
    createdAt: '06.08.2026 14:30', updatedAt: '06.08.2026 14:30',
  },
  {
    id: 's2', bayiId: 'd1', personelId: 'u2', musteriId: 'c2',
    musteriAdi: 'Mehmet Kaya', musteriTelefon: '0533 987 65 43', musteriEmail: 'mehmet@mail.com',
    items: [
      { productId: 'p10', productName: 'LS2 FF320 Kask', productCode: '8691234567010', unitPrice: 3200, quantity: 1, discountPercent: 10, discountAmount: 320, total: 2880 },
    ],
    toplamTutar: 3456, odemeYontemi: 'nakit', durum: 'bitti',
    createdAt: '06.08.2026 16:00', updatedAt: '06.08.2026 16:00',
  },
  {
    id: 's3', bayiId: 'd1', personelId: 'u3', musteriId: 'c3',
    musteriAdi: 'Ayşe Demir', musteriTelefon: '0555 456 78 90', musteriEmail: 'ayse@mail.com',
    items: [
      { productId: 'p4', productName: 'Fren Balatası Ön Set', productCode: '8691234567004', unitPrice: 280, quantity: 1, discountPercent: 0, discountAmount: 0, total: 280 },
      { productId: 'p3', productName: 'Fren Hidroliği DOT4', productCode: '8691234567003', unitPrice: 120, quantity: 2, discountPercent: 0, discountAmount: 0, total: 240 },
    ],
    toplamTutar: 624, odemeYontemi: 'havale', durum: 'taslak',

    createdAt: '05.08.2026 10:15', updatedAt: '05.08.2026 10:15',
  },
  {
    id: 's4', bayiId: 'd2', personelId: 'u4', musteriId: 'c4',
    musteriAdi: 'Ali Öztürk', musteriTelefon: '0542 111 22 33',
    items: [
      { productId: 'p6', productName: 'NGK Buji CR8E', productCode: '8691234567006', unitPrice: 95, quantity: 4, discountPercent: 5, discountAmount: 19, total: 361 },
    ],
    toplamTutar: 433, odemeYontemi: 'kart', durum: 'bitti',
    createdAt: '04.08.2026 09:00', updatedAt: '04.08.2026 09:00',
  },
  {
    id: 's5', bayiId: 'd2', personelId: 'u5', musteriId: 'c5',
    musteriAdi: 'Can Yıldız', musteriTelefon: '0530 444 55 66', musteriEmail: 'can@mail.com',
    items: [
      { productId: 'p8', productName: 'Zincir Seti 520 O-Ring', productCode: '8691234567008', unitPrice: 850, quantity: 1, discountPercent: 0, discountAmount: 0, total: 850 },
      { productId: 'p9', productName: 'Zincir Spreyi 400ml', productCode: '8691234567009', unitPrice: 150, quantity: 1, discountPercent: 0, discountAmount: 0, total: 150 },
    ],
    toplamTutar: 1200, odemeYontemi: 'nakit', durum: 'iptal',
    createdAt: '03.08.2026 11:45', updatedAt: '03.08.2026 11:45',
  },
];

export async function getProducts(): Promise<Array<{ id: string; name: string; barcode: string; price: number }>> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS), 200));
}

export async function getCustomers(): Promise<Customer[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_CUSTOMERS), 200));
}

export async function getSales(): Promise<Sale[]> {
  return new Promise((resolve) => setTimeout(() => resolve([...sales]), 300));
}

export async function createSale(data: {
  bayiId: string;
  personelId: string;
  musteriId: string;
  musteriAdi: string;
  musteriTelefon: string;
  musteriEmail?: string;
  items: SaleItem[];
  odemeYontemi: PaymentMethod;
  durum: Sale['durum'];
}): Promise<Sale> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const subtotal = data.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const discountTotal = data.items.reduce((sum, i) => sum + i.discountAmount, 0);
      const taxAmount = (subtotal - discountTotal) * 0.2;
      const grandTotal = subtotal - discountTotal + taxAmount;
      const now = new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      const sale: Sale = {
        id: String(Date.now()),
        bayiId: data.bayiId,
        personelId: data.personelId,
        musteriId: data.musteriId,
        musteriAdi: data.musteriAdi,
        musteriTelefon: data.musteriTelefon,
        musteriEmail: data.musteriEmail,
        items: data.items,
        toplamTutar: grandTotal,
        odemeYontemi: data.odemeYontemi,
        durum: data.durum,
        createdAt: now,
        updatedAt: now,
      };
      sales = [sale, ...sales];
      resolve(sale);
    }, 300);
  });
}

export async function updateSaleStatus(id: string, durum: Sale['durum']): Promise<Sale> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = sales.findIndex((s) => s.id === id);
      if (index === -1) return reject(new Error('Satış bulunamadı'));
      sales[index] = { ...sales[index], durum, updatedAt: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) };
      resolve(sales[index]);
    }, 200);
  });
}

export async function deleteSale(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      sales = sales.filter((s) => s.id !== id);
      resolve();
    }, 200);
  });
}
