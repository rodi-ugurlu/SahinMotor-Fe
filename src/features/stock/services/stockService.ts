import type { Product } from '../types/stock';

const now = '06.08.2026 14:30';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', barcode: '8691234567001', name: 'Motul 10W40 Motor Yağı', brand: 'Motul', model: '10W40', size: 'M', color: 'Amber', purchasePrice: 320, salePrice: 450, stock: 2, minStock: 5, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '2', barcode: '8691234567002', name: 'Castrol Power1 10W40', brand: 'Castrol', model: 'Power1', size: 'M', color: 'Altın', purchasePrice: 260, salePrice: 380, stock: 15, minStock: 10, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '3', barcode: '8691234567003', name: 'Fren Hidroliği DOT4', brand: 'Bosch', model: 'DOT4', size: 'S', color: 'Sarı', purchasePrice: 80, salePrice: 120, stock: 1, minStock: 3, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '4', barcode: '8691234567004', name: 'Fren Balatası Ön Set', brand: 'EBC', model: 'FA228', size: 'M', color: 'Bakır', purchasePrice: 190, salePrice: 280, stock: 8, minStock: 5, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '5', barcode: '8691234567005', name: 'Hava Filtresi Universal', brand: 'K&N', model: 'HA-8090', size: 'L', color: 'Kırmızı', purchasePrice: 55, salePrice: 85, stock: 4, minStock: 5, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '6', barcode: '8691234567006', name: 'Yağ Filtresi', brand: 'Mann', model: 'MW64', size: 'M', color: 'Beyaz', purchasePrice: 40, salePrice: 65, stock: 20, minStock: 10, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '7', barcode: '8691234567007', name: 'NGK Buji CR8E', brand: 'NGK', model: 'CR8E', size: 'S', color: 'Gri', purchasePrice: 60, salePrice: 95, stock: 12, minStock: 10, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '8', barcode: '8691234567008', name: 'Akü 12V 9Ah', brand: 'Yuasa', model: 'YTX9-BS', size: 'L', color: 'Siyah', purchasePrice: 300, salePrice: 450, stock: 3, minStock: 3, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '9', barcode: '8691234567009', name: 'Zincir Seti 520 O-Ring', brand: 'DID', model: '520VX2', size: 'XL', color: 'Çelik', purchasePrice: 580, salePrice: 850, stock: 6, minStock: 4, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '10', barcode: '8691234567010', name: 'Zincir Spreyi 400ml', brand: 'Motul', model: 'Chain Lube', size: 'M', color: 'Beyaz', purchasePrice: 95, salePrice: 150, stock: 8, minStock: 5, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '11', barcode: '8691234567011', name: 'Debriyaj Teli', brand: 'Domino', model: 'DT-200', size: 'M', color: 'Gri', purchasePrice: 45, salePrice: 75, stock: 5, minStock: 3, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
  { id: '12', barcode: '8691234567012', name: 'Gaz Teli', brand: 'Domino', model: 'GT-150', size: 'M', color: 'Siyah', purchasePrice: 40, salePrice: 70, stock: 7, minStock: 3, dealerId: 'd1', createdAt: now, updatedAt: now, imageUrl: '/image.png' },
];

let products = [...MOCK_PRODUCTS];

export async function getProducts(): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...products]), 400);
  });
}

export async function addProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const newProduct: Product = { ...data, id: String(Date.now()), createdAt: now, updatedAt: now };
      products = [newProduct, ...products];
      resolve(newProduct);
    }, 300);
  });
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) return reject(new Error('Ürün bulunamadı'));
      const now = new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      products[index] = { ...products[index], ...data, updatedAt: now };
      resolve(products[index]);
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
