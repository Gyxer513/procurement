import { PurchaseTable } from '../../purchases/PurchaseTable';
import { MainPage } from './main';
import PurchaseViewPage from '../purchases/PurchaseViewPage';
import { createBrowserRouter } from 'react-router-dom';

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
