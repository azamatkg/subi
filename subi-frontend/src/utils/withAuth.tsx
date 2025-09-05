import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { UserRole } from '@/types';

// Higher-order component version
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: UserRole[]
) => {
  const WrappedComponent = (props: P) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
