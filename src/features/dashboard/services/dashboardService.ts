import type { DashboardStats, RecentSale, StockItem } from '../types/dashboard';

const MOCK_STATS: DashboardStats = {
  dailyRevenue: 12450,
  dailyRevenueChange: 12,
  totalSalesCount: 47,
  criticalStockCount: 3,
  activeUserCount: 4,
  activeUserRole: 'SuperAdmin',
};

const MOCK_RECENT_SALES: RecentSale[] = [
  { id: '1', date: '06.08.2026', product: 'Motul 10W40 Yağ', customer: 'Ahmet Yılmaz', amount: 850, status: 'completed' },
  { id: '2', date: '06.08.2026', product: 'LS2 FF320 Kask', customer: 'Mehmet Kaya', amount: 3200, status: 'completed' },
  { id: '3', date: '05.08.2026', product: 'Fren Balatası Set', customer: 'Ayşe Demir', amount: 450, status: 'pending' },
  { id: '4', date: '05.08.2026', product: 'NGK Buji 4\'lü', customer: 'Ali Öztürk', amount: 280, status: 'completed' },
  { id: '5', date: '04.08.2026', product: 'Zincir Seti 520', customer: 'Can Yıldız', amount: 1200, status: 'cancelled' },
];

const MOCK_STOCK: StockItem[] = [
  { product: 'Motul 10W40 Yağ', current: 2, min: 5, max: 50 },
  { product: 'Fren Hidroliği DOT4', current: 1, min: 3, max: 30 },
  { product: 'Hava Filtresi', current: 4, min: 5, max: 40 },
  { product: 'NGK Buji', current: 12, min: 10, max: 100 },
  { product: 'Zincir Spreyi', current: 8, min: 5, max: 60 },
];

export async function getDashboardStats(): Promise<DashboardStats> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_STATS), 500));
}

export async function getRecentSales(): Promise<RecentSale[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_RECENT_SALES), 500));
}

export async function getStockStatus(): Promise<StockItem[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_STOCK), 500));
}
