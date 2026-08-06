import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SahinLogin from '../features/auth/pages/SahinLogin';
import BusinessSelectionPage from '../features/business/pages/BusinessSelectionPage';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import StockPage from '../features/stock/pages/StockPage';
import SalesPage from '../features/sales/pages/SalesPage';
import ReportsPage from '../features/reports/pages/ReportsPage';
import LogsPage from '../features/logs/pages/LogsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SahinLogin />,
  },
  {
    path: '/sahin/login',
    element: <SahinLogin />,
  },
  {
    path: '/select-business',
    element: <BusinessSelectionPage />,
  },
  {
    path: '/:businessId',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'sales',
        element: <SalesPage />,
      },
      {
        path: 'stock',
        element: <StockPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'logs',
        element: <LogsPage />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
