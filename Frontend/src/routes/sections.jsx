import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import { usePathname } from 'src/routes/hooks';

import DashboardLayout from 'src/layouts/dashboard';

export const IndexPage = lazy(() => import('src/pages/app'));
// export const BlogPage = lazy(() => import('src/pages/blog'));
export const RequestPage = lazy(() => import('src/pages/requests'));
export const RequestDetailsPage = lazy(() => import('src/pages/request-details'));
export const Payments = lazy(() => import('src/pages/payments'));
export const ListTenant = lazy(() => import('src/pages/list-tenants'));
export const LoginPage = lazy(() => import('src/pages/login'));
// export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

export const LandingPage = lazy(() => import('src/pages/landing'))

// ----------------------------------------------------------------------

export default function Router() {
  const pathname = usePathname();
  const userID = pathname.split("/")[3]
  const routes = useRoutes([
    {
      path: "dashboard",
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { 
          path: "tenant/:userID",
          children: [
            { element: <IndexPage />, index: true },
            { path: 'requests', element: <RequestPage access="tenant"/> },
            { path: 'requests/:requestID', element: <RequestDetailsPage /> },
            {path: 'payments', element: <Payments tenantID={userID}/>},
          ]
        },
        {
          path: "manager/:userID",
          children: [
            { element: <IndexPage />, index: true },
            { path: 'requests', element: <RequestPage access="manager"/> },
            { path: 'requests/:requestID', element: <RequestDetailsPage /> },
            {path: 'list-tenants',element: <ListTenant managerID={userID} /> }
          ]
        }
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
