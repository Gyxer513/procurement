import { PurchaseTable } from '../../purchases/PurchaseTable';
import { MainPage } from './main';
import PurchaseViewPage from '../purchases/PurchaseViewPage';
import { createBrowserRouter } from 'react-router-dom';
import AdminPage from '../admin/admin';

export const routes = [
  {
    path: '/',
    element: <MainPage />,
    children: [
      {
        path: '/purchases',
        element: <PurchaseTable />,
      },
      {
        path: '/purchases/:id',
        element: <PurchaseViewPage />,
      },
      {
        path: '/admin',
        element: <AdminPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes, {
  future: {
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_fetcherPersist: true,
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
  },
});
