import { useCallback, useEffect, useMemo, useState } from 'react';
import { getReportData } from '../../reports/services/reportsService';
import { getLogs } from '../../logs/services/logsService';
import { getProducts } from '../../stock/services/stockService';
import type { DailyReport, MonthlyReport, ProductReport, ReportPeriod, ReportSummary, WeeklyReport } from '../../reports/types/reports';
import type { LogEntry, LogType } from '../../logs/types/logs';

type State = 'loading' | 'loaded' | 'error';

interface UseTransactionsReturn {
  state: State;
  period: ReportPeriod;
  summary: ReportSummary | null;
  daily: DailyReport[];
  weekly: WeeklyReport[];
  monthly: MonthlyReport[];
  products: ProductReport[];
  totalStockCount: number;
  totalStockValue: number;
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  logSearch: string;
  logTypeFilter: LogType | 'all';
  setPeriod: (p: ReportPeriod) => void;
  setLogSearch: (s: string) => void;
  setLogTypeFilter: (f: LogType | 'all') => void;
  retry: () => void;
}

export function useTransactions(): UseTransactionsReturn {
  const [state, setState] = useState<State>('loading');
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [daily, setDaily] = useState<DailyReport[]>([]);
  const [weekly, setWeekly] = useState<WeeklyReport[]>([]);
  const [monthly, setMonthly] = useState<MonthlyReport[]>([]);
  const [products, setProducts] = useState<ProductReport[]>([]);
  const [totalStockCount, setTotalStockCount] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState<LogType | 'all'>('all');

  const fetch = useCallback(() => {
    setState('loading');
    Promise.all([getReportData(period), getLogs(), getProducts()])
      .then(([reportData, logData, stockProducts]) => {
        setSummary(reportData.summary);
        setDaily(reportData.daily);
        setWeekly(reportData.weekly);
        setMonthly(reportData.monthly);
        setProducts(reportData.products);
        setTotalStockCount(stockProducts.reduce((sum, p) => sum + p.stock, 0));
        setTotalStockValue(stockProducts.reduce((sum, p) => sum + p.stock * p.salePrice, 0));
        setLogs(logData);
        setState('loaded');
      })
      .catch(() => setState('error'));
  }, [period]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (logTypeFilter !== 'all') {
      result = result.filter((l) => l.type === logTypeFilter);
    }
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      result = result.filter(
        (l) =>
          l.description.toLowerCase().includes(q) ||
          (l.detail && l.detail.toLowerCase().includes(q)) ||
          l.user.name.toLowerCase().includes(q) ||
          l.module.toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, logSearch, logTypeFilter]);

  return {
    state, period, summary, daily, weekly, monthly, products,
    totalStockCount, totalStockValue,
    logs, filteredLogs, logSearch, logTypeFilter,
    setPeriod, setLogSearch, setLogTypeFilter, retry: fetch,
  };
}
