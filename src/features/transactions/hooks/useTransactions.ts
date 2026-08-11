import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getReportData } from '../../reports/services/reportsService';
import { getLogs } from '../../logs/services/logsService';
import { getProducts } from '../../stock/services/stockService';
import { getSales } from '../../sales/services/salesService';
import type { DailyReport, MonthlyReport, ProductReport, ReportPeriod, ReportSummary, WeeklyReport } from '../../reports/types/reports';
import type { LogEntry, LogType } from '../../logs/types/logs';
import type { Sale } from '../../sales/types/sales';

type State = 'loading' | 'loaded' | 'error';
export type DatePreset = 'today' | 'weekly' | 'monthly' | 'quarterly';

interface UseTransactionsReturn {
  state: State;
  businessId: string;
  period: ReportPeriod;
  datePreset: DatePreset;
  summary: ReportSummary | null;
  daily: DailyReport[];
  weekly: WeeklyReport[];
  monthly: MonthlyReport[];
  products: ProductReport[];
  totalStockCount: number;
  totalStockValue: number;
  criticalStockCount: number;
  salesList: Sale[];
  selectedSale: Sale | null;
  isInvoiceModalOpen: boolean;
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  logSearch: string;
  logTypeFilter: LogType | 'all';
  logRoleFilter: string | 'all';
  setPeriod: (p: ReportPeriod) => void;
  setDatePreset: (preset: DatePreset) => void;
  setLogSearch: (s: string) => void;
  setLogTypeFilter: (f: LogType | 'all') => void;
  setLogRoleFilter: (r: string | 'all') => void;
  openInvoiceModal: (sale: Sale | DailyReport) => void;
  closeInvoiceModal: () => void;
  exportToCSV: () => void;
  retry: () => void;
}

export function useTransactions(): UseTransactionsReturn {
  const { businessId = 'd1' } = useParams<{ businessId: string }>();
  const [state, setState] = useState<State>('loading');
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [datePreset, setDatePreset] = useState<DatePreset>('daily' as DatePreset);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [daily, setDaily] = useState<DailyReport[]>([]);
  const [weekly, setWeekly] = useState<WeeklyReport[]>([]);
  const [monthly, setMonthly] = useState<MonthlyReport[]>([]);
  const [products, setProducts] = useState<ProductReport[]>([]);
  const [totalStockCount, setTotalStockCount] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [criticalStockCount, setCriticalStockCount] = useState(0);
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState<LogType | 'all'>('all');
  const [logRoleFilter, setLogRoleFilter] = useState<string | 'all'>('all');

  const fetch = useCallback(() => {
    setState('loading');
    Promise.all([
      getReportData(period),
      getLogs(),
      getProducts(),
      getSales(),
    ])
      .then(([reportData, logData, stockProducts, salesData]) => {
        setSummary(reportData.summary);
        setDaily(reportData.daily);
        setWeekly(reportData.weekly);
        setMonthly(reportData.monthly);
        setProducts(reportData.products);

        // Filter stock products by businessId if available
        const filteredProducts = stockProducts.filter((p) => !p.dealerId || p.dealerId === businessId);
        const targetProducts = filteredProducts.length > 0 ? filteredProducts : stockProducts;

        setTotalStockCount(targetProducts.reduce((sum, p) => sum + p.stock, 0));
        setTotalStockValue(targetProducts.reduce((sum, p) => sum + p.stock * p.salePrice, 0));
        setCriticalStockCount(targetProducts.filter((p) => p.stock <= p.minStock).length);

        // Filter sales by businessId
        const filteredSales = salesData.filter((s) => !s.bayiId || s.bayiId === businessId);
        setSalesList(filteredSales.length > 0 ? filteredSales : salesData);

        setLogs(logData);
        setState('loaded');
      })
      .catch(() => setState('error'));
  }, [period, businessId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filteredLogs = useMemo(() => {
    let result = logs.filter((l) => l.type !== 'login' && l.type !== 'logout');
    if (logTypeFilter !== 'all') {

      result = result.filter((l) => l.type === logTypeFilter);
    }
    if (logRoleFilter !== 'all') {
      result = result.filter((l) => l.user.role === logRoleFilter);
    }
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      result = result.filter(
        (l) =>
          l.description.toLowerCase().includes(q) ||
          (l.detail && l.detail.toLowerCase().includes(q)) ||
          l.user.name.toLowerCase().includes(q) ||
          l.module.toLowerCase().includes(q) ||
          l.ip.includes(q) ||
          (l.changes && l.changes.some((c) => c.field.toLowerCase().includes(q) || c.newValue.toLowerCase().includes(q)))
      );
    }
    return result;
  }, [logs, logSearch, logTypeFilter, logRoleFilter]);

  const openInvoiceModal = useCallback((saleOrReport: Sale | DailyReport) => {
    if ('items' in saleOrReport) {
      setSelectedSale(saleOrReport as Sale);
    } else {
      const report = saleOrReport as DailyReport;
      const found = salesList.find((s) => s.id === report.invoiceNo || s.musteriAdi === report.customer);
      if (found) {
        setSelectedSale(found);
      } else {
        // Construct fallback Sale object for invoice preview modal
        setSelectedSale({
          id: report.invoiceNo,
          bayiId: businessId,
          personelId: 'u1',
          musteriId: 'c1',
          musteriAdi: report.customer,
          musteriTelefon: '0532 000 00 00',
          items: [
            {
              productId: 'p1',
              productName: 'Motosiklet Bakım / Yedek Parça Hizmeti',
              productCode: 'SRV-001',
              unitPrice: Math.round(report.total / report.itemCount),
              quantity: report.itemCount,
              discountPercent: 0,
              discountAmount: 0,
              total: report.total,
            },
          ],
          toplamTutar: report.total,
          odemeYontemi: 'kart',
          durum: 'bitti',
          createdAt: report.date + ' 14:30',
          updatedAt: report.date + ' 14:30',
        });
      }
    }
    setIsInvoiceModalOpen(true);
  }, [salesList, businessId]);

  const closeInvoiceModal = useCallback(() => {
    setIsInvoiceModalOpen(false);
    setSelectedSale(null);
  }, []);

  const exportToCSV = useCallback(() => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Tarih', 'Kullanıcı', 'Rol', 'İşlem Türü', 'Modül', 'Açıklama', 'IP Adresi'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.date}"`,
      `"${l.user.name}"`,
      `"${l.user.role}"`,
      `"${l.type}"`,
      `"${l.module}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.ip}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `islem_loglari_${businessId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredLogs, logs, businessId]);

  return {
    state,
    businessId,
    period,
    datePreset,
    summary,
    daily,
    weekly,
    monthly,
    products,
    totalStockCount,
    totalStockValue,
    criticalStockCount,
    salesList,
    selectedSale,
    isInvoiceModalOpen,
    logs,
    filteredLogs,
    logSearch,
    logTypeFilter,
    logRoleFilter,
    setPeriod,
    setDatePreset,
    setLogSearch,
    setLogTypeFilter,
    setLogRoleFilter,
    openInvoiceModal,
    closeInvoiceModal,
    exportToCSV,
    retry: fetch,
  };
}

