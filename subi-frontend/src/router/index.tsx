import React from 'react';
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/constants';

// Layout components
import { MainLayout } from '@/components/layouts/MainLayout';
import { AuthLayout } from '@/components/layouts/AuthLayout';

// Error boundary component
import { RouteErrorBoundary } from '@/components/ui/RouteErrorBoundary';

// Route protection components
import {
  AdminRoute,
  CommissionMemberRoute,
  CreditAnalystRoute,
  CreditManagerRoute,
  DecisionMakerRoute,
  GuestRoute,
  ProtectedRoute,
} from '@/components/common/ProtectedRoute';

// Page components (will be created later)
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

// Application pages
import { ApplicationListPage } from '@/pages/applications/ApplicationListPage';
import { ApplicationCreatePage } from '@/pages/applications/ApplicationCreatePage';
import { ApplicationDetailPage } from '@/pages/applications/ApplicationDetailPage';

// Credit Program pages
import { CreditProgramListPage } from '@/pages/credit-programs/CreditProgramListPage';
import { CreditProgramCreatePage } from '@/pages/credit-programs/CreditProgramCreatePage';
import { CreditProgramDetailPage } from '@/pages/credit-programs/CreditProgramDetailPage';

// Document pages
import { DocumentListPage } from '@/pages/documents/DocumentListPage';
import { DocumentTemplatePage } from '@/pages/documents/DocumentTemplatePage';

// Commission pages
import { CommissionListPage } from '@/pages/commissions/CommissionListPage';
import { CommissionDetailPage } from '@/pages/commissions/CommissionDetailPage';
import { MyReviewsPage } from '@/pages/commissions/MyReviewsPage';

// Admin pages
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { UserListPage } from '@/pages/admin/UserListPage';
import { UserDetailPage } from '@/pages/admin/UserDetailPage';
import { UserAddEditPage } from '@/pages/admin/UserAddEditPage';
import { ReferenceDataPage } from '@/pages/admin/ReferenceDataPage';
import { SystemConfigPage } from '@/pages/admin/SystemConfigPage';

// Decision pages
import { DecisionListPage } from '@/pages/decisions/DecisionListPage';
import { DecisionCreatePage } from '@/pages/decisions/DecisionCreatePage';
import { DecisionDetailPage } from '@/pages/decisions/DecisionDetailPage';
import { DecisionEditPage } from '@/pages/decisions/DecisionEditPage';
import { DecisionTypesPage } from '@/pages/decisions/DecisionTypesPage';
import { DecisionMakingBodiesPage } from '@/pages/decisions/DecisionMakingBodiesPage';

// Error pages
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';
import { TestPage } from '@/pages/TestPage';

export const router = createBrowserRouter([
  // Public routes (guest only)
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: 'login',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      // Dashboard
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'test',
        element: <TestPage />,
      },

      // Applications
      {
        path: 'applications',
        children: [
          {
            index: true,
            element: <ApplicationListPage />,
          },
          {
            path: 'new',
            element: <ApplicationCreatePage />,
          },
          {
            path: ':id',
            element: <ApplicationDetailPage />,
          },
        ],
      },

      // Credit Programs
      {
        path: 'credit-programs',
        children: [
          {
            index: true,
            element: <CreditProgramListPage />,
          },
          {
            path: 'new',
            element: (
              <CreditManagerRoute>
                <CreditProgramCreatePage />
              </CreditManagerRoute>
            ),
          },
          {
            path: ':id',
            element: <CreditProgramDetailPage />,
          },
        ],
      },

      // Documents
      {
        path: 'documents',
        children: [
          {
            index: true,
            element: <DocumentListPage />,
          },
          {
            path: 'templates',
            element: (
              <AdminRoute>
                <DocumentTemplatePage />
              </AdminRoute>
            ),
          },
        ],
      },

      // Commissions
      {
        path: 'commissions',
        children: [
          {
            index: true,
            element: (
              <CreditAnalystRoute>
                <CommissionListPage />
              </CreditAnalystRoute>
            ),
          },
          {
            path: 'my-reviews',
            element: (
              <CommissionMemberRoute>
                <MyReviewsPage />
              </CommissionMemberRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <CommissionMemberRoute>
                <CommissionDetailPage />
              </CommissionMemberRoute>
            ),
          },
        ],
      },

      // Decisions
      {
        path: 'decisions',
        children: [
          {
            index: true,
            element: (
              <DecisionMakerRoute>
                <DecisionListPage />
              </DecisionMakerRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <DecisionMakerRoute>
                <DecisionCreatePage />
              </DecisionMakerRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <DecisionMakerRoute>
                <DecisionDetailPage />
              </DecisionMakerRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <DecisionMakerRoute>
                <DecisionEditPage />
              </DecisionMakerRoute>
            ),
          },
        ],
      },

      // Admin routes
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <Outlet />
          </AdminRoute>
        ),
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: <UserManagementPage />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: 'users',
            errorElement: <RouteErrorBoundary />,
            children: [
              {
                index: true,
                element: <UserListPage />,
                errorElement: <RouteErrorBoundary />,
              },
              {
                path: 'new',
                element: <UserAddEditPage />,
                errorElement: <RouteErrorBoundary />,
              },
              {
                path: ':id',
                element: <UserDetailPage />,
                errorElement: <RouteErrorBoundary />,
              },
              {
                path: ':id/edit',
                element: <UserAddEditPage />,
                errorElement: <RouteErrorBoundary />,
              },
            ],
          },
          {
            path: 'reference-data',
            element: <ReferenceDataPage />,
          },
          {
            path: 'system-config',
            element: <SystemConfigPage />,
          },
          {
            path: 'decision-types',
            element: <DecisionTypesPage />,
          },
          {
            path: 'decision-making-bodies',
            element: <DecisionMakingBodiesPage />,
          },
        ],
      },
    ],
  },

  // Legacy route redirects
  {
    path: '/login',
    element: <Navigate to='/auth/login' replace />,
  },

  // Error pages
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
