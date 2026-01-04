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
import NotFoundPage from '@pages/not-found/ui/NotFoundPage';
import ForbiddenPage from '@pages/forbidden/ui/ForbiddenPage';
import AppErrorPage from '@pages/app-error/ui/AppErrorPage';

import { RequireRealmRole } from './RequireRealmRole';

type AppRouter = RouterProviderProps['router'];

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainPage />,
    errorElement: <AppErrorPage />,
    children: [
      { index: true, element: <Navigate to="purchases" replace /> },

      { path: 'purchases', element: <PurchasePage /> },
      { path: 'purchases/:id', element: <PurchaseDetailsPage /> },

      { path: 'reports', element: <ReportsPage /> },

      { path: 'forbidden', element: <ForbiddenPage /> },

      {
        path: 'admin',
        element: (
          <RequireRealmRole role="admin">
            <AdminPage />
          </RequireRealmRole>
        ),
      },

      { path: '*', element: <NotFoundPage /> },
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
