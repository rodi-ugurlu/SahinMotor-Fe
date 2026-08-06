export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface DailyReport {
  date: string;
  invoiceNo: string;
  customer: string;
  itemCount: number;
  total: number;
}

export interface WeeklyReport {
  week: string;
  totalSales: number;
  totalRevenue: number;
  avgRevenue: number;
}

export interface MonthlyReport {
  month: string;
  totalSales: number;
  totalRevenue: number;
  avgRevenue: number;
  growth: number;
}

export interface ProductReport {
  rank: number;
  productName: string;
  category: string;
  salesCount: number;
  totalRevenue: number;
  revenuePercent: number;
}

export interface ReportSummary {
  revenue: number;
  revenueChange: number;
  salesCount: number;
  salesChange: number;
  avgBasket: number;
  topItem: string;
}
