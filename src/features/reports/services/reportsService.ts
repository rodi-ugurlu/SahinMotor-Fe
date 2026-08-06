import type { DailyReport, MonthlyReport, ProductReport, ReportPeriod, ReportSummary, WeeklyReport } from '../types/reports';

const MOCK_DAILY: DailyReport[] = [
  { date: '06.08.2026', invoiceNo: 'PRO-2026-001', customer: 'Ahmet Yılmaz', itemCount: 2, total: 1080 },
  { date: '06.08.2026', invoiceNo: 'PRO-2026-002', customer: 'Mehmet Kaya', itemCount: 1, total: 3456 },
  { date: '05.08.2026', invoiceNo: 'PRO-2026-003', customer: 'Ayşe Demir', itemCount: 3, total: 624 },
  { date: '04.08.2026', invoiceNo: 'PRO-2026-004', customer: 'Ali Öztürk', itemCount: 4, total: 433 },
  { date: '03.08.2026', invoiceNo: 'PRO-2026-005', customer: 'Can Yıldız', itemCount: 2, total: 1200 },
  { date: '02.08.2026', invoiceNo: 'PRO-2026-006', customer: 'Ahmet Yılmaz', itemCount: 1, total: 450 },
  { date: '01.08.2026', invoiceNo: 'PRO-2026-007', customer: 'Mehmet Kaya', itemCount: 3, total: 850 },
];

const MOCK_WEEKLY: WeeklyReport[] = [
  { week: '32. Hafta', totalSales: 12, totalRevenue: 6793, avgRevenue: 566 },
  { week: '31. Hafta', totalSales: 15, totalRevenue: 8200, avgRevenue: 547 },
  { week: '30. Hafta', totalSales: 10, totalRevenue: 5100, avgRevenue: 510 },
  { week: '29. Hafta', totalSales: 18, totalRevenue: 9400, avgRevenue: 522 },
  { week: '28. Hafta', totalSales: 14, totalRevenue: 7200, avgRevenue: 514 },
  { week: '27. Hafta', totalSales: 11, totalRevenue: 5800, avgRevenue: 527 },
  { week: '26. Hafta', totalSales: 16, totalRevenue: 8600, avgRevenue: 538 },
];

const MOCK_MONTHLY: MonthlyReport[] = [
  { month: 'Ağustos', totalSales: 8, totalRevenue: 5160, avgRevenue: 645, growth: 0 },
  { month: 'Temmuz', totalSales: 47, totalRevenue: 24500, avgRevenue: 521, growth: 12 },
  { month: 'Haziran', totalSales: 42, totalRevenue: 21800, avgRevenue: 519, growth: 8 },
  { month: 'Mayıs', totalSales: 38, totalRevenue: 20100, avgRevenue: 529, growth: -3 },
  { month: 'Nisan', totalSales: 35, totalRevenue: 19500, avgRevenue: 557, growth: 5 },
  { month: 'Mart', totalSales: 40, totalRevenue: 18500, avgRevenue: 463, growth: 15 },
  { month: 'Şubat', totalSales: 30, totalRevenue: 16000, avgRevenue: 533, growth: -8 },
  { month: 'Ocak', totalSales: 33, totalRevenue: 17400, avgRevenue: 527, growth: 10 },
  { month: 'Aralık', totalSales: 28, totalRevenue: 15800, avgRevenue: 564, growth: -5 },
  { month: 'Kasım', totalSales: 36, totalRevenue: 16600, avgRevenue: 461, growth: 7 },
  { month: 'Ekim', totalSales: 31, totalRevenue: 15500, avgRevenue: 500, growth: 0 },
  { month: 'Eylül', totalSales: 29, totalRevenue: 15500, avgRevenue: 534, growth: 0 },
];

const MOCK_PRODUCTS: ProductReport[] = [
  { rank: 1, productName: 'LS2 FF320 Kask', category: 'Kask', salesCount: 8, totalRevenue: 25600, revenuePercent: 22 },
  { rank: 2, productName: 'Motul 10W40 Motor Yağı', category: 'Motor Yağı', salesCount: 25, totalRevenue: 11250, revenuePercent: 18 },
  { rank: 3, productName: 'Zincir Seti 520 O-Ring', category: 'Zincir/Dişli', salesCount: 6, totalRevenue: 5100, revenuePercent: 14 },
  { rank: 4, productName: 'Castrol Power1 10W40', category: 'Motor Yağı', salesCount: 15, totalRevenue: 5700, revenuePercent: 12 },
  { rank: 5, productName: 'Akü 12V 9Ah', category: 'Elektrik', salesCount: 5, totalRevenue: 2250, revenuePercent: 8 },
  { rank: 6, productName: 'Fren Balatası Ön Set', category: 'Fren Sistemi', salesCount: 10, totalRevenue: 2800, revenuePercent: 7 },
  { rank: 7, productName: 'NGK Buji CR8E', category: 'Elektrik', salesCount: 20, totalRevenue: 1900, revenuePercent: 6 },
  { rank: 8, productName: 'Zincir Spreyi 400ml', category: 'Zincir/Dişli', salesCount: 12, totalRevenue: 1800, revenuePercent: 5 },
  { rank: 9, productName: 'Hava Filtresi Universal', category: 'Filtre', salesCount: 8, totalRevenue: 680, revenuePercent: 4 },
  { rank: 10, productName: 'Fren Hidroliği DOT4', category: 'Fren Sistemi', salesCount: 14, totalRevenue: 1680, revenuePercent: 4 },
];

export async function getReportData(period: ReportPeriod): Promise<{
  summary: ReportSummary;
  daily: DailyReport[];
  weekly: WeeklyReport[];
  monthly: MonthlyReport[];
  products: ProductReport[];
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const summary: ReportSummary = {
        revenue: period === 'daily' ? 4536 : period === 'weekly' ? 6793 : 24500,
        revenueChange: period === 'daily' ? 8 : period === 'weekly' ? -17 : 12,
        salesCount: period === 'daily' ? 3 : period === 'weekly' ? 12 : 47,
        salesChange: period === 'daily' ? -25 : period === 'weekly' ? -20 : 12,
        avgBasket: period === 'daily' ? 1512 : period === 'weekly' ? 566 : 521,
        topItem: period === 'daily' ? 'LS2 FF320 Kask' : period === 'weekly' ? 'Motul 10W40' : 'LS2 FF320 Kask',
      };
      resolve({
        summary,
        daily: MOCK_DAILY,
        weekly: MOCK_WEEKLY,
        monthly: MOCK_MONTHLY,
        products: MOCK_PRODUCTS,
      });
    }, 500);
  });
}
