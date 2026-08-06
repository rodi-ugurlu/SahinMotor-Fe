import { useCallback, useEffect, useState } from 'react';
import type { DailyReport, MonthlyReport, ProductReport, ReportPeriod, ReportSummary, WeeklyReport } from '../types/reports';
import { getReportData } from '../services/reportsService';

type State = 'loading' | 'loaded' | 'error';

interface UseReportsReturn {
  period: ReportPeriod;
  summary: ReportSummary | null;
  daily: DailyReport[];
  weekly: WeeklyReport[];
  monthly: MonthlyReport[];
  products: ProductReport[];
  state: State;
  setPeriod: (p: ReportPeriod) => void;
  retry: () => void;
}

export function useReports(): UseReportsReturn {
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [daily, setDaily] = useState<DailyReport[]>([]);
  const [weekly, setWeekly] = useState<WeeklyReport[]>([]);
  const [monthly, setMonthly] = useState<MonthlyReport[]>([]);
  const [products, setProducts] = useState<ProductReport[]>([]);
  const [state, setState] = useState<State>('loading');

  const fetch = useCallback((p: ReportPeriod) => {
    setState('loading');
    getReportData(p)
      .then((data) => {
        setSummary(data.summary);
        setDaily(data.daily);
        setWeekly(data.weekly);
        setMonthly(data.monthly);
        setProducts(data.products);
        setState('loaded');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch(period);
  }, [period, fetch]);

  return { period, summary, daily, weekly, monthly, products, state, setPeriod, retry: () => fetch(period) };
}
