import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

export const IndexPage = lazy(() => import('src/pages/app'));
// export const BlogPage = lazy(() => import('src/pages/blog'));
export const RequestPage = lazy(() => import('src/pages/requests'));
export const RequestDetailsPage = lazy(() => import('src/pages/request-details'));
// export const LoginPage = lazy(() => import('src/pages/login'));
// export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: "/",
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
          ]
        },
        {
          path: "manager/:userID",
          children: [
            { element: <IndexPage />, index: true },
            { path: 'requests', element: <RequestPage access="manager"/> },
            { path: 'requests/:requestID', element: <RequestDetailsPage /> },
          ]
        }
      ],
    },
    // {
    //   path: 'login',
    //   element: <LoginPage />,
    // },
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
