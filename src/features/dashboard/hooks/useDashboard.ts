import { useEffect, useState } from 'react';
import type { DashboardStats, RecentSale, StockItem } from '../types/dashboard';
import { getDashboardStats, getRecentSales, getStockStatus } from '../services/dashboardService';

type State = 'loading' | 'loaded' | 'error';

interface UseDashboardReturn {
  stats: DashboardStats | null;
  recentSales: RecentSale[];
  stockItems: StockItem[];
  state: State;
  retry: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [state, setState] = useState<State>('loading');

  const fetch = () => {
    setState('loading');
    Promise.all([getDashboardStats(), getRecentSales(), getStockStatus()])
      .then(([s, sales, stock]) => {
        setStats(s);
        setRecentSales(sales);
        setStockItems(stock);
        setState('loaded');
      })
      .catch(() => setState('error'));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, []);

  return { stats, recentSales, stockItems, state, retry: fetch };
}
