import getRouterBasename from '@/lib/router';
import { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter, Outlet } from 'react-router-dom';

import { Loader } from '@/components/Loader';

// OPTIMIZED: Code split routes for better initial load performance
// Each page is loaded only when the user navigates to it
// This saves ~300KB+ on initial load

const Home = lazy(() => import('pages/Home'));
const Env = lazy(() => import('pages/Env'));
const Thread = lazy(() => import('pages/Thread'));
const Element = lazy(() => import('pages/Element'));
const Login = lazy(() => import('pages/Login'));
const AuthCallback = lazy(() => import('pages/AuthCallback'));

// Loading fallback component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader className="!size-8" />
  </div>
);

// Wrapper to provide Suspense boundary
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <LazyRoute>
          <Home />
        </LazyRoute>
      )
    },
    {
      path: '/env',
      element: (
        <LazyRoute>
          <Env />
        </LazyRoute>
      )
    },
    {
      path: '/thread/:id?',
      element: (
        <LazyRoute>
          <Thread />
        </LazyRoute>
      )
    },
    {
      path: '/element/:id',
      element: (
        <LazyRoute>
          <Element />
        </LazyRoute>
      )
    },
    {
      path: '/login',
      element: (
        <LazyRoute>
          <Login />
        </LazyRoute>
      )
    },
    {
      path: '/login/callback',
      element: (
        <LazyRoute>
          <AuthCallback />
        </LazyRoute>
      )
    },
    {
      path: '/share/:id',
      element: (
        <LazyRoute>
          <Thread />
        </LazyRoute>
      )
    },
    {
      path: '*',
      element: <Navigate replace to="/" />
    }
  ],
  { basename: getRouterBasename() }
);
