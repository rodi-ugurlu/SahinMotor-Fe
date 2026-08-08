import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SahinLogin from '../features/auth/pages/SahinLogin';
import BusinessSelectionPage from '../features/business/pages/BusinessSelectionPage';
import DashboardLayout from '../layouts/DashboardLayout';
import SalesPage from '../features/sales/pages/SalesPage';
import StockPage from '../features/stock/pages/StockPage';
import CustomersPage from '../features/customers/pages/CustomersPage';
import DealersPage from '../features/dealers/pages/DealersPage';
import UsersPage from '../features/users/pages/UsersPage';
import TransactionsPage from '../features/transactions/pages/TransactionsPage';
import NotFoundPage from '../pages/NotFoundPage';

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
    path: '/koman/login',
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
        element: <SalesPage />,
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
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'dealers',
        element: <DealersPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'transactions',
        element: <TransactionsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
