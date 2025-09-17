import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import {
  TrendingUp,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import {
  AccessibleDate,
} from '@/components/ui/accessible-status-badge';
import {
  AccessibleHeading,
  Landmark,
  LiveRegion,
} from '@/components/ui/focus-trap';
import { CardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAnnouncement } from '@/lib/accessibility';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { LoanApplicationTrendChart } from '@/components/dashboard/LoanApplicationTrendChart';
import { LoanStatusDistributionChart } from '@/components/dashboard/LoanStatusDistributionChart';
import { LoanAmountByProgramChart } from '@/components/dashboard/LoanAmountByProgramChart';
import { RecentLoanActivitiesTimeline } from '@/components/dashboard/RecentLoanActivitiesTimeline';

export const DashboardPage: React.FC = () => {
  const { userDisplayName } = useAuth();
  const { formatNumber } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const announce = useAnnouncement();
  useSetPageTitle('Панель управления - Кредитная система');

  // Loan dashboard state
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    approvedLoans: 0,
    pendingReviews: 0,
    totalLoanAmount: 0,
  });

  // Simulate data loading - only run once on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setDashboardStats({
        totalApplications: 1247,
        approvedLoans: 856,
        pendingReviews: 73,
        totalLoanAmount: 12500000, // 12.5M
      });
      setIsLoading(false);
      announce('Данные кредитной системы обновлены', 'polite');
    };

    loadData();
  }, [announce]);

  const refreshData = useCallback(() => {
    setLastUpdated(new Date());
    setIsLoading(true);
    setTimeout(() => {
      setDashboardStats(prev => ({
        ...prev,
        // Simulate small changes in data
        totalApplications: prev.totalApplications + Math.floor(Math.random() * 3),
        approvedLoans: prev.approvedLoans + Math.floor(Math.random() * 2),
        pendingReviews: Math.max(0, prev.pendingReviews + Math.floor(Math.random() * 3) - 1),
        totalLoanAmount: prev.totalLoanAmount + Math.floor(Math.random() * 100000) - 50000,
      }));
      setIsLoading(false);
      announce('Данные обновлены', 'polite');
    }, 500);
  }, [announce]);

  // Enhanced StatCard with better accessibility and animation
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: number;
    description?: string;
    loading?: boolean;
    color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
    onClick?: () => void;
  }> = ({
    title,
    value,
    icon: Icon,
    trend,
    description,
    loading,
    color = 'blue',
    onClick,
  }) => {
    const colorStyles = {
      blue: 'from-blue-500/10 to-blue-600/5 border-blue-200/20 text-blue-700 dark:text-blue-300',
      emerald:
        'from-emerald-500/10 to-emerald-600/5 border-emerald-200/20 text-emerald-700 dark:text-emerald-300',
      amber:
        'from-amber-500/10 to-amber-600/5 border-amber-200/20 text-amber-700 dark:text-amber-300',
      red: 'from-red-500/10 to-red-600/5 border-red-200/20 text-red-700 dark:text-red-300',
      purple:
        'from-purple-500/10 to-purple-600/5 border-purple-200/20 text-purple-700 dark:text-purple-300',
    };

    if (loading) {
      return <CardSkeleton showTrend={trend !== undefined} />;
    }

    return (
      <Card
        className={cn(
          'group relative overflow-hidden transition-all duration-300',
          'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1',
          'border-0 shadow-md bg-gradient-to-br',
          colorStyles[color],
          onClick &&
            'cursor-pointer focus:ring-2 focus:ring-primary/20 focus:outline-none'
        )}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        onKeyDown={
          onClick
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              {title}
            </CardTitle>
            <div
              className={cn(
                'p-2 rounded-xl transition-transform duration-300',
                'group-hover:scale-110 group-hover:rotate-3',
                `bg-gradient-to-br ${colorStyles[color].split(' ')[0]} ${colorStyles[color].split(' ')[1]}`
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {typeof value === 'number' ? formatNumber(value) : value}
            </div>

            {trend !== undefined && (
              <div className="flex items-center gap-1">
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
                    trend > 0
                      ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30'
                      : trend < 0
                        ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
                        : 'text-muted-foreground bg-muted/50'
                  )}
                >
                  <TrendingUp
                    className={cn('h-3 w-3', trend < 0 && 'rotate-180')}
                    aria-hidden="true"
                  />
                  <span>{Math.abs(trend)}%</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  от прошлого месяца
                </span>
              </div>
            )}

            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </CardContent>

        {/* Hover effect gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      </Card>
    );
  };

  return (
    <Landmark role="main" aria-labelledby="dashboard-title">
      {/* Live region for announcements */}
      <LiveRegion>{isLoading && 'Загружаются данные кредитной системы'}</LiveRegion>

      <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Добро пожаловать,{' '}
                <span className="font-semibold text-foreground">
                  {userDisplayName}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <AccessibleDate date={lastUpdated} format="short" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
                className="group"
                aria-label="Обновить данные"
              >
                <RefreshCw
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isLoading && 'animate-spin',
                    'group-hover:rotate-180'
                  )}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline ml-2">Обновить</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Loan Stats Cards Grid */}
        <section aria-labelledby="stats-title">
          <AccessibleHeading level={2} id="stats-title" className="sr-only">
            Статистика кредитной системы
          </AccessibleHeading>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Всего заявок"
              value={dashboardStats.totalApplications}
              icon={CreditCard}
              trend={8.2}
              color="blue"
              loading={isLoading}
              onClick={() => announce('Переход к списку заявок')}
              description="За текущий месяц"
            />
            <StatCard
              title="Одобрено кредитов"
              value={dashboardStats.approvedLoans}
              icon={CheckCircle}
              trend={12.5}
              color="emerald"
              loading={isLoading}
              onClick={() => announce('Просмотр одобренных кредитов')}
              description="Успешно одобрено"
            />
            <StatCard
              title="На рассмотрении"
              value={dashboardStats.pendingReviews}
              icon={AlertCircle}
              trend={-3.2}
              color="amber"
              loading={isLoading}
              onClick={() => announce('Переход к заявкам на рассмотрении')}
              description="Ожидают решения"
            />
            <StatCard
              title="Общая сумма"
              value={`${(dashboardStats.totalLoanAmount / 1000000).toFixed(1)}М ₽`}
              icon={DollarSign}
              trend={15.7}
              color="purple"
              loading={isLoading}
              onClick={() => announce('Переход к финансовой статистике')}
              description="Выданные кредиты"
            />
          </div>
        </section>

        {/* Loan Management Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Loan Application Trend Chart */}
          <div className="xl:col-span-2">
            <LoanApplicationTrendChart />
          </div>

          {/* Loan Status Distribution */}
          <div className="xl:col-span-1">
            <LoanStatusDistributionChart />
          </div>

          {/* Loan Amount by Program */}
          <div className="xl:col-span-2">
            <LoanAmountByProgramChart />
          </div>

          {/* Recent Loan Activities */}
          <div className="xl:col-span-1">
            <RecentLoanActivitiesTimeline />
          </div>
        </div>
      </div>
    </Landmark>
  );
};
