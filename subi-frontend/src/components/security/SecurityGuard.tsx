import React, { useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { hasRole, hasAnyRole, isAdmin } from '@/utils/auth';
import { hasPermission, hasAnyPermission, UserManagementPermission } from '@/utils/accessControl';
import { AuthUser } from '@/types/auth';
import { UserRole } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Clock, AlertTriangle, Loader2 } from 'lucide-react';

export interface SecurityGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;

  // Role-based access control
  requiredRoles?: UserRole[];
  requireAllRoles?: boolean;

  // Permission-based access control
  requiredPermissions?: UserManagementPermission[];
  requireAllPermissions?: boolean;

  // Admin-only access
  adminOnly?: boolean;

  // Route protection
  protectedRoute?: boolean;
  redirectTo?: string;

  // Security monitoring
  enableSecurityMonitoring?: boolean;
  logAccessAttempts?: boolean;

  // Session requirements
  requireActiveSession?: boolean;
  allowExpiredSession?: boolean;
}

export interface UnauthorizedAccessProps {
  reason: 'no_auth' | 'insufficient_roles' | 'insufficient_permissions' | 'session_expired' | 'rate_limited' | 'admin_required';
  requiredRoles?: UserRole[];
  requiredPermissions?: UserManagementPermission[];
  onRetry?: () => void;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({
  reason,
  requiredRoles,
  requiredPermissions,
  onRetry,
}) => {
  const getErrorContent = () => {
    switch (reason) {
      case 'no_auth':
        return {
          icon: <ShieldX className="h-12 w-12 text-destructive" />,
          title: 'Authentication Required',
          description: 'You must be logged in to access this content.',
          action: 'Please log in to continue.',
        };

      case 'insufficient_roles':
        return {
          icon: <ShieldX className="h-12 w-12 text-destructive" />,
          title: 'Insufficient Privileges',
          description: `This content requires ${requiredRoles?.join(' or ')} role(s).`,
          action: 'Contact your administrator to request access.',
        };

      case 'insufficient_permissions':
        return {
          icon: <ShieldX className="h-12 w-12 text-destructive" />,
          title: 'Permission Denied',
          description: `You don't have the required permissions: ${requiredPermissions?.join(', ')}.`,
          action: 'Contact your administrator to request the necessary permissions.',
        };

      case 'session_expired':
        return {
          icon: <Clock className="h-12 w-12 text-warning" />,
          title: 'Session Expired',
          description: 'Your session has expired for security reasons.',
          action: 'Please log in again to continue.',
        };

      case 'rate_limited':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-warning" />,
          title: 'Too Many Requests',
          description: 'You have exceeded the request limit. Please wait before trying again.',
          action: 'Wait a few minutes and try again.',
        };

      case 'admin_required':
        return {
          icon: <ShieldX className="h-12 w-12 text-destructive" />,
          title: 'Administrator Access Required',
          description: 'This content is restricted to administrators only.',
          action: 'Contact your system administrator for access.',
        };

      default:
        return {
          icon: <ShieldX className="h-12 w-12 text-destructive" />,
          title: 'Access Denied',
          description: 'You do not have permission to access this content.',
          action: 'Contact your administrator for assistance.',
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {errorContent.icon}
          </div>
          <CardTitle className="text-xl font-semibold">
            {errorContent.title}
          </CardTitle>
          <CardDescription>
            {errorContent.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {errorContent.action}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export interface SessionTimeoutWarningProps {
  timeRemaining: number;
  onExtendSession: () => void;
  onLogout: () => void;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  timeRemaining,
  onExtendSession,
  onLogout,
}) => {
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return (
    <Alert className="mb-4 border-warning bg-warning/10">
      <Clock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Session expires in {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
        <div className="flex gap-2">
          <Button size="sm" onClick={onExtendSession}>
            Extend Session
          </Button>
          <Button size="sm" variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export const SecurityGuard: React.FC<SecurityGuardProps> = ({
  children,
  fallback,
  requiredRoles = [],
  requireAllRoles = false,
  requiredPermissions = [],
  requireAllPermissions = false,
  adminOnly = false,
  protectedRoute = false,
  redirectTo = '/login',
  enableSecurityMonitoring = true,
  logAccessAttempts = true,
  requireActiveSession = true,
  allowExpiredSession = false,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const { sessionSecurity, logSecurityEvent, refreshSession } = useSecurityValidation({
    enableSessionMonitoring: requireActiveSession,
  });

  // Log access attempts if enabled
  useEffect(() => {
    if (logAccessAttempts && enableSecurityMonitoring) {
      logSecurityEvent(
        'access_attempt',
        `User attempted to access protected content at ${location.pathname}`
      );
    }
  }, [location.pathname, logAccessAttempts, enableSecurityMonitoring, logSecurityEvent]);

  // Check authentication
  if (!isAuthenticated || !user) {
    if (protectedRoute) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return <UnauthorizedAccess reason="no_auth" />;
  }

  // Check session validity
  if (requireActiveSession && !allowExpiredSession && !sessionSecurity.isSessionValid) {
    if (protectedRoute) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <UnauthorizedAccess
        reason="session_expired"
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Check admin-only access
  if (adminOnly && !isAdmin(user)) {
    if (enableSecurityMonitoring) {
      logSecurityEvent(
        'invalid_access',
        `Non-admin user ${user.username} attempted to access admin-only content`
      );
    }

    if (protectedRoute) {
      return <Navigate to="/unauthorized" replace />;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return <UnauthorizedAccess reason="admin_required" />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAllRoles
      ? requiredRoles.every(role => hasRole(user, role))
      : hasAnyRole(user, requiredRoles);

    if (!hasRequiredRoles) {
      if (enableSecurityMonitoring) {
        logSecurityEvent(
          'invalid_access',
          `User ${user.username} with roles [${user.roles.join(', ')}] attempted to access content requiring [${requiredRoles.join(', ')}]`
        );
      }

      if (protectedRoute) {
        return <Navigate to="/unauthorized" replace />;
      }

      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <UnauthorizedAccess
          reason="insufficient_roles"
          requiredRoles={requiredRoles}
        />
      );
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions
      ? requiredPermissions.every(permission => hasPermission(user, permission))
      : hasAnyPermission(user, requiredPermissions);

    if (!hasRequiredPermissions) {
      if (enableSecurityMonitoring) {
        logSecurityEvent(
          'invalid_access',
          `User ${user.username} attempted to access content requiring permissions [${requiredPermissions.join(', ')}]`
        );
      }

      if (protectedRoute) {
        return <Navigate to="/unauthorized" replace />;
      }

      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <UnauthorizedAccess
          reason="insufficient_permissions"
          requiredPermissions={requiredPermissions}
        />
      );
    }
  }

  // Render session timeout warning if needed
  const renderWithSessionWarning = (content: React.ReactNode) => {
    if (sessionSecurity.showTimeoutWarning && sessionSecurity.timeUntilExpiry > 0) {
      return (
        <>
          <SessionTimeoutWarning
            timeRemaining={sessionSecurity.timeUntilExpiry}
            onExtendSession={refreshSession}
            onLogout={logout}
          />
          {content}
        </>
      );
    }
    return content;
  };

  // All checks passed, render children
  return renderWithSessionWarning(<>{children}</>);
};

// Higher-order component for route protection
export function withSecurityGuard<P extends object>(
  Component: React.ComponentType<P>,
  securityConfig: Omit<SecurityGuardProps, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <SecurityGuard {...securityConfig} protectedRoute>
        <Component {...props} />
      </SecurityGuard>
    );
  };

  WrappedComponent.displayName = `withSecurityGuard(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Role-based guard shortcuts
export const AdminOnlyGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <SecurityGuard adminOnly fallback={fallback}>
    {children}
  </SecurityGuard>
);

export const RoleGuard: React.FC<{
  children: React.ReactNode;
  roles: UserRole[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}> = ({ children, roles, requireAll = false, fallback }) => (
  <SecurityGuard
    requiredRoles={roles}
    requireAllRoles={requireAll}
    fallback={fallback}
  >
    {children}
  </SecurityGuard>
);

export const PermissionGuard: React.FC<{
  children: React.ReactNode;
  permissions: UserManagementPermission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}> = ({ children, permissions, requireAll = false, fallback }) => (
  <SecurityGuard
    requiredPermissions={permissions}
    requireAllPermissions={requireAll}
    fallback={fallback}
  >
    {children}
  </SecurityGuard>
);

// Loading state component for async security checks
export const SecurityLoadingGuard: React.FC<{
  children: React.ReactNode;
  isLoading: boolean;
  loadingComponent?: React.ReactNode;
}> = ({ children, isLoading, loadingComponent }) => {
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying access permissions...</span>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};