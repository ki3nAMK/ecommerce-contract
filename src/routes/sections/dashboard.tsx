import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/one'));
const PageTwo = lazy(() => import('src/pages/dashboard/two'));
const PageThree = lazy(() => import('src/pages/dashboard/three'));
const PageFour = lazy(() => import('src/pages/dashboard/four'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product_list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product_create'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product_edit'));
const OrderListPage = lazy(() => import('src/pages/dashboard/order_list'));
const OrderDetailPage = lazy(() => import('src/pages/dashboard/order_detail'));

// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout isContainNavbar={false}>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

const layoutSellerContent = (
  <DashboardLayout isContainNavbar type='seller'>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

const layoutClientContent = (
  <DashboardLayout isContainNavbar type='client'>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      {
        path: 'product',
        children: [
          { path: 'cart', element: <PageThree /> },
          { path: ':id', element: <PageTwo /> },
        ],
      },
    ],
  },
  {
    path: 'seller',
    element: CONFIG.auth.skip ? <>{layoutSellerContent}</> : <AuthGuard>{layoutSellerContent}</AuthGuard>,
    children: [
      { element: <PageFour />, index: true },
      {
        path: 'product',
        children: [
          { index: true, element: <ProductListPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: 'edit/:id', element: <ProductEditPage /> }
        ],
      },
      {
        path: 'order',
        children: [
          { index: true, element: <OrderListPage /> },
          { path: 'detail/:id', element: <OrderDetailPage /> }
        ]
      }
    ],
  },
  {
    path: 'user',
    element: CONFIG.auth.skip ? <>{layoutClientContent}</> : <AuthGuard>{layoutClientContent}</AuthGuard>,
    children: [
      { element: <PageFour />, index: true },
      {
        path: 'order',
        children: [
          { index: true, element: <OrderListPage /> },
          { path: 'detail/:id', element: <OrderDetailPage /> }
        ]
      }
    ]
  }
];
