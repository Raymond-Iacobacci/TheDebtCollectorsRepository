import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard/common';

export const IndexPage = lazy(() => import('src/pages/app'));
export const AnnouncementsPage = lazy(() => import('src/pages/announcements'));
export const RequestPage = lazy(() => import('src/pages/requests'));
export const RequestDetailsPage = lazy(() => import('src/pages/request-details'));
export const ListTenant = lazy(() => import('src/pages/list-tenants'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const PaymentsHistory = lazy(() => import('src/pages/payments-history'));
export const Expenses = lazy(() => import('src/pages/expenses'));
export const Report = lazy(() => import('src/pages/report'));

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: 'dashboard',
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        {
          path: 'tenant/:userID',
          children: [
            { path: 'main', element: <IndexPage /> },
            { path: 'announcements', element: <AnnouncementsPage /> },
            { path: 'requests', element: <RequestPage /> },
            { path: 'requests/:requestID', element: <RequestDetailsPage /> },
            { path: 'payments-history', element: <PaymentsHistory /> },
          ],
        },
        {
          path: 'manager/:userID',
          children: [
            { path: 'main', element: <IndexPage /> },
            { path: 'announcements', element: <AnnouncementsPage /> },
            { path: 'requests', element: <RequestPage /> },
            { path: 'requests/:requestID', element: <RequestDetailsPage /> },
            { path: 'list-tenants', element: <ListTenant /> },
            { path: 'list-tenants/:tenantID', element: <PaymentsHistory /> },
            { path: 'expenses', element: <Expenses /> },
            { path: 'report', element: <Report /> },
          ],
        },
      ],
    },
    {
      path: '/',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
