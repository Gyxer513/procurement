import {
  createBrowserRouter,
  type RouteObject,
  type RouterProviderProps,
  Navigate,
} from 'react-router-dom';

import { PurchasePage } from '@pages/purchases/ui/PurchasePage';
import { MainPage } from '@pages/main/ui/MainPage';
import PurchaseDetailsPage from '@pages/purchase-details/ui/PurchaseDetailsPage';
import AdminPage from '@pages/admin/ui/AdminPage';
import ReportsPage from '@pages/reports/ui/ReportsPage';
import { RequireRealmRole } from './RequireRealmRole';

type AppRouter = RouterProviderProps['router'];

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainPage />,
    children: [
      // вот это и убирает "пустую" главную:
      { index: true, element: <Navigate to="purchases" replace /> },

      { path: 'purchases', element: <PurchasePage /> },
      { path: 'purchases/:id', element: <PurchaseDetailsPage /> },

      { path: 'reports', element: <ReportsPage /> },

      // админку закрываем ролью (пример)
      {
        path: 'admin',
        element: (
          <RequireRealmRole role="admin">
            <AdminPage />
          </RequireRealmRole>
        ),
      },
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
