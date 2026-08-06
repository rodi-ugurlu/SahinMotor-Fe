export interface DashboardStats {
  dailyRevenue: number;
  dailyRevenueChange: number;
  totalSalesCount: number;
  criticalStockCount: number;
  activeUserCount: number;
  activeUserRole: string;
}

export interface RecentSale {
  id: string;
  date: string;
  product: string;
  customer: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface StockItem {
  product: string;
  current: number;
  min: number;
  max: number;
}
