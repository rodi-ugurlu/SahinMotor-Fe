import type { Product } from '../types/stock';

const EXCHANGE_RATE = 32.50;

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Motul 10W40 Motor Yağı', code: 'MTO-001', category: 'Motor Yağı', stock: 2, minStock: 5, priceTL: 450, priceUSD: 13.85, description: '4T 10W40 sentetik motor yağı 1L' },
  { id: '2', name: 'Castrol Power1 10W40', code: 'CST-002', category: 'Motor Yağı', stock: 15, minStock: 10, priceTL: 380, priceUSD: 11.69, description: '4T yarı sentetik motor yağı 1L' },
  { id: '3', name: 'Fren Hidroliği DOT4', code: 'FRN-001', category: 'Fren Sistemi', stock: 1, minStock: 3, priceTL: 120, priceUSD: 3.69, description: 'DOT4 fren hidroliği 500ml' },
  { id: '4', name: 'Fren Balatası Ön Set', code: 'FRN-002', category: 'Fren Sistemi', stock: 8, minStock: 5, priceTL: 280, priceUSD: 8.62, description: 'Sinterli ön fren balatası' },
  { id: '5', name: 'Hava Filtresi Universal', code: 'FLT-001', category: 'Filtre', stock: 4, minStock: 5, priceTL: 85, priceUSD: 2.62, description: 'Yıkanabilir hava filtresi' },
  { id: '6', name: 'Yağ Filtresi', code: 'FLT-002', category: 'Filtre', stock: 20, minStock: 10, priceTL: 65, priceUSD: 2.00 },
  { id: '7', name: 'NGK Buji CR8E', code: 'ELK-001', category: 'Elektrik', stock: 12, minStock: 10, priceTL: 95, priceUSD: 2.92, description: 'Standart buji' },
  { id: '8', name: 'Akü 12V 9Ah', code: 'ELK-002', category: 'Elektrik', stock: 3, minStock: 3, priceTL: 450, priceUSD: 13.85, description: 'Bakımsız kuru akü' },
  { id: '9', name: 'Zincir Seti 520 O-Ring', code: 'ZNC-001', category: 'Zincir/Dişli', stock: 6, minStock: 4, priceTL: 850, priceUSD: 26.15, description: '520 O-Ring zincir + ön/arka dişli set' },
  { id: '10', name: 'Zincir Spreyi 400ml', code: 'ZNC-002', category: 'Zincir/Dişli', stock: 8, minStock: 5, priceTL: 150, priceUSD: 4.62, description: 'Zincir bakım spreyi' },
  { id: '11', name: 'Debriyaj Teli', code: 'DGR-001', category: 'Diğer', stock: 5, minStock: 3, priceTL: 75, priceUSD: 2.31 },
  { id: '12', name: 'Gaz Teli', code: 'DGR-002', category: 'Diğer', stock: 7, minStock: 3, priceTL: 70, priceUSD: 2.15 },
];

let products = [...MOCK_PRODUCTS];

export function getExchangeRate(): number {
  return EXCHANGE_RATE;
}

export async function getProducts(): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...products]), 400);
  });
}

export async function addProduct(data: Omit<Product, 'id' | 'priceUSD'>): Promise<Product> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct: Product = {
        ...data,
        id: String(Date.now()),
        priceUSD: Number((data.priceTL / EXCHANGE_RATE).toFixed(2)),
      };
      products = [newProduct, ...products];
      resolve(newProduct);
    }, 300);
  });
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'priceUSD'>>): Promise<Product> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) return reject(new Error('Ürün bulunamadı'));
      const updated = {
        ...products[index],
        ...data,
        priceUSD: data.priceTL !== undefined ? Number((data.priceTL / EXCHANGE_RATE).toFixed(2)) : products[index].priceUSD,
      };
      products[index] = updated;
      resolve(updated);
    }, 300);
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      products = products.filter((p) => p.id !== id);
      resolve();
    }, 300);
  });
}
