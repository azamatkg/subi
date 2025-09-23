import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { ROUTES } from '@/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAuth = true,
  redirectTo = ROUTES.LOGIN,
  fallback = null,
}) => {
  const { isAuthenticated, hasAnyRole, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading && requireAuth) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    // If user is authenticated but doesn't have required roles
    if (fallback) {
      return <>{fallback}</>;
    }

    // Redirect to dashboard or show unauthorized message
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

// Specific role-based route components
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>{children}</ProtectedRoute>
);

export const CreditManagerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.CREDIT_MANAGER]}>
    {children}
  </ProtectedRoute>
);

export const CreditAnalystRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute
    requiredRoles={[
      UserRole.ADMIN,
      UserRole.CREDIT_MANAGER,
      UserRole.CREDIT_ANALYST,
    ]}
  >
    {children}
  </ProtectedRoute>
);

export const DecisionMakerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.DECISION_MAKER]}>
    {children}
  </ProtectedRoute>
);

export const CommissionMemberRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute
    requiredRoles={[
      UserRole.ADMIN,
      UserRole.COMMISSION_MEMBER,
      UserRole.CREDIT_ANALYST,
    ]}
  >
    {children}
  </ProtectedRoute>
);

// Public route (no authentication required)
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;

// Redirect authenticated users away from public routes (like login)
export const GuestRoute: React.FC<{
  children: React.ReactNode;
  redirectTo?: string;
}> = ({ children, redirectTo = ROUTES.DASHBOARD }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
