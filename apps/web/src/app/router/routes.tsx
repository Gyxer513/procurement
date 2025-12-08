import {
  createBrowserRouter,
  type RouteObject,
  type RouterProviderProps,
} from 'react-router-dom';
import { PurchasePage } from '@pages/purchases/ui/PurchasePage';
import { MainPage } from '@pages/main/ui/MainPage';
import PurchaseDetailsPage from '@pages/purchase-details/ui/PurchaseDetailsPage';
import AdminPage from '@pages/admin/ui/AdminPage';

type AppRouter = RouterProviderProps['router'];

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainPage />,
    children: [
      { path: '/purchases', element: <PurchasePage /> },
      { path: '/purchases/:id', element: <PurchaseDetailsPage /> },
      { path: '/admin', element: <AdminPage /> },
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
