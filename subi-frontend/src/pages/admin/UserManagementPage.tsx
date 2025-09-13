import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowRight,
  Settings,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { showWarningMessage } from '@/utils/errorHandling';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ROUTES } from '@/constants';

interface NavigationCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();

  // Error boundary fallback
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    console.error('UserManagementPage error:', error, errorInfo);
    showWarningMessage(
      t('userManagement.errors.pageError'),
      t('userManagement.errors.tryRefreshing')
    );
  };

  const navigationCards: NavigationCard[] = [
    {
      title: t('userManagement.navigation.userList.title'),
      description: t('userManagement.navigation.userList.description'),
      href: `${ROUTES.ADMIN}/users`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: t('userManagement.navigation.createUser.title'),
      description: t('userManagement.navigation.createUser.description'),
      href: `${ROUTES.ADMIN}/users/new`,
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: t('userManagement.navigation.roles.title'),
      description: t('userManagement.navigation.roles.description'),
      href: `${ROUTES.ADMIN}/reference-data`,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      title: t('userManagement.navigation.activity.title'),
      description: t('userManagement.navigation.activity.description'),
      href: `${ROUTES.ADMIN}/system-config`,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  const quickActions = [
    {
      label: t('userManagement.quickActions.viewAllUsers'),
      href: `${ROUTES.ADMIN}/users`,
      variant: 'default' as const,
    },
    {
      label: t('userManagement.quickActions.addNewUser'),
      href: `${ROUTES.ADMIN}/users/new`,
      variant: 'outline' as const,
    },
  ];

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          type="component"
          onRetry={resetErrorBoundary}
          showRetry={true}
        />
      )}
      onError={handleError}
    >
      <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={ROUTES.DASHBOARD}>
              {t('common.dashboard')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={ROUTES.ADMIN}>
              {t('common.admin')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('userManagement.title')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 flex items-center justify-center shadow-lg">
              <Users className="h-7 w-7 text-primary-700" />
            </div>
            {t('userManagement.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('userManagement.subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          {quickActions.map((action, index) => (
            <Button key={index} variant={action.variant} asChild>
              <Link to={action.href}>
                {action.label}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {navigationCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card
              key={index}
              className={`group hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 ${card.borderColor} bg-gradient-to-br from-background to-background/50`}
            >
              <Link to={card.href} className="block h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-xl ${card.bgColor} border-2 ${card.borderColor} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`h-7 w-7 ${card.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {card.title}
                      </CardTitle>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              {t('userManagement.overview.totalUsers')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">-</div>
            <p className="text-xs text-blue-600 mt-1">
              {t('userManagement.overview.totalUsersDesc')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              {t('userManagement.overview.activeUsers')}
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">-</div>
            <p className="text-xs text-green-600 mt-1">
              {t('userManagement.overview.activeUsersDesc')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              {t('userManagement.overview.adminUsers')}
            </CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">-</div>
            <p className="text-xs text-purple-600 mt-1">
              {t('userManagement.overview.adminUsersDesc')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="border-2 border-muted bg-gradient-to-r from-muted/20 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <Settings className="h-6 w-6 text-primary" />
            {t('userManagement.help.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            {t('userManagement.help.description')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`${ROUTES.ADMIN}/users`}>
                {t('userManagement.help.manageUsers')}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`${ROUTES.ADMIN}/reference-data`}>
                {t('userManagement.help.configureRoles')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </ErrorBoundary>
  );
};
