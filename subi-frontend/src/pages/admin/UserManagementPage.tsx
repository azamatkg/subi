import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowRight,
  Shield,
  Users,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { showWarningMessage } from '@/utils/errorHandling';
import { ROUTES } from '@/constants';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';

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
  useSetPageTitle(t('userManagement.title'));

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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 flex items-center justify-center shadow-lg">
              <Users className="h-7 w-7 text-primary-700" />
            </div>
            {t('userManagement.title')}
          </h1>
        </div>

        
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
      </div>
    </ErrorBoundary>
  );
};