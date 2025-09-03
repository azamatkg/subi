import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { UserRole } from '@/types';

// Layout components
import { MainLayout } from '@/components/layouts/MainLayout';
import { AuthLayout } from '@/components/layouts/AuthLayout';

// Route protection components
import { 
  ProtectedRoute, 
  GuestRoute,
  AdminRoute,
  CreditManagerRoute,
  CreditAnalystRoute,
  DecisionMakerRoute,
  CommissionMemberRoute
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
import { ReferenceDataPage } from '@/pages/admin/ReferenceDataPage';
import { SystemConfigPage } from '@/pages/admin/SystemConfigPage';

// Error pages
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';

export const router = createBrowserRouter([
  // Public routes (guest only)
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
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

      // Admin routes
      {
        path: 'admin',
        element: <AdminRoute><div /></AdminRoute>,
        children: [
          {
            path: 'users',
            element: <UserManagementPage />,
          },
          {
            path: 'reference-data',
            element: <ReferenceDataPage />,
          },
          {
            path: 'system-config',
            element: <SystemConfigPage />,
          },
        ],
      },
    ],
  },

  // Legacy route redirects
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
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