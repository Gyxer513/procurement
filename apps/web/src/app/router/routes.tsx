import {
  createBrowserRouter,
  type RouteObject,
  type RouterProviderProps,
  Navigate,
} from 'react-router-dom';

import { MainPage } from '@pages/main/ui/MainPage';
import { PurchasePage } from '@pages/purchases/ui/PurchasePage';
import PurchaseDetailsPage from '@pages/purchase-details/ui/PurchaseDetailsPage';
import AdminPage from '@pages/admin/ui/AdminPage';
import ReportsPage from '@pages/reports/ui/ReportsPage';

import ErrorPage from '@pages/error/ui/ErrorPage';
import { RequireClientRole } from './RequireRealmRole';

type AppRouter = RouterProviderProps['router'];

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainPage />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="purchases" replace /> },

      { path: 'purchases', element: <PurchasePage /> },
      { path: 'purchases/:id', element: <PurchaseDetailsPage /> },

      { path: 'reports', element: <ReportsPage /> },

      // единая страница ошибок по коду
      { path: 'error/:code?', element: <ErrorPage /> },

      {
        path: 'admin',
        element: (
          <RequireClientRole role="senior_admin" clientId="procurement-web">
            <AdminPage />
          </RequireClientRole>
        ),
      },

      // любой неизвестный путь -> /error/404
      { path: '*', element: <Navigate to="/error/404" replace /> },
    ],
  },
];

export const router: AppRouter = createBrowserRouter(routes, {
  future: {
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_fetcherPersist: true,
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
  },
});
