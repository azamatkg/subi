import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  FileText,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import {
  AccessibleAmount,
  AccessibleDate,
  AccessibleStatusBadge,
} from '@/components/ui/accessible-status-badge';
import {
  AccessibleHeading,
  Landmark,
  LiveRegion,
} from '@/components/ui/focus-trap';
import { CardSkeleton, ListItemSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAnnouncement } from '@/lib/accessibility';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';

export const DashboardPage: React.FC = () => {
  const { userDisplayName } = useAuth();
  const { formatCurrency, formatNumber } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const announce = useAnnouncement();
  useSetPageTitle('Панель управления');

  // Enhanced dashboard state with loading simulation
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalAmount: 0,
    thisMonthApplications: 0,
    growthRate: 0,
    approvalRate: 0,
  });

  // Simulate data loading - only run once on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setDashboardStats({
        totalApplications: 156,
        pendingApplications: 23,
        approvedApplications: 89,
        rejectedApplications: 12,
        totalAmount: 25600000, // in som
        thisMonthApplications: 34,
        growthRate: 12.5,
        approvalRate: 78.2,
      });
      setIsLoading(false);
      announce('Данные дашборда обновлены', 'polite');
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
        totalApplications:
          prev.totalApplications + Math.floor(Math.random() * 5),
        pendingApplications: Math.max(
          0,
          prev.pendingApplications + Math.floor(Math.random() * 3) - 1
        ),
      }));
      setIsLoading(false);
      announce('Данные обновлены', 'polite');
    }, 500);
  }, [announce]);

  const recentApplications = [
    {
      id: '1',
      applicantName: 'Айгүл Токтосунова',
      amount: 500000,
      status: 'UNDER_COMPLETION',
      createdAt: '2024-09-01T10:00:00Z',
      programName: 'Микрокредитование',
      priority: 'high' as const,
    },
    {
      id: '2',
      applicantName: 'Максат Жолдошев',
      amount: 750000,
      status: 'APPROVED',
      createdAt: '2024-09-01T09:30:00Z',
      programName: 'Малый бизнес',
      priority: 'medium' as const,
    },
    {
      id: '3',
      applicantName: 'Нургуль Осмонова',
      amount: 300000,
      status: 'SUBMITTED',
      createdAt: '2024-09-01T08:45:00Z',
      programName: 'Стартап поддержка',
      priority: 'low' as const,
    },
  ];

  const quickActions = [
    {
      id: 'new-application',
      title: 'Новая заявка',
      description: 'Создать заявку на кредит',
      icon: FileText,
      color: 'blue',
      href: '/applications/new',
    },
    {
      id: 'commission',
      title: 'Комиссия',
      description: 'Заседания комиссии',
      icon: Users,
      color: 'purple',
      href: '/commissions',
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      description: 'Отчеты и статистика',
      icon: BarChart3,
      color: 'emerald',
      href: '/analytics',
    },
    {
      id: 'schedule',
      title: 'Расписание',
      description: 'Календарь событий',
      icon: Calendar,
      color: 'orange',
      href: '/schedule',
    },
  ];

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
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors'>
              {title}
            </CardTitle>
            <div
              className={cn(
                'p-2 rounded-xl transition-transform duration-300',
                'group-hover:scale-110 group-hover:rotate-3',
                `bg-gradient-to-br ${colorStyles[color].split(' ')[0]} ${colorStyles[color].split(' ')[1]}`
              )}
            >
              <Icon className='h-5 w-5' aria-hidden='true' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='space-y-2'>
            <div className='text-3xl font-bold tracking-tight text-foreground'>
              {typeof value === 'number' ? formatNumber(value) : value}
            </div>

            {trend !== undefined && (
              <div className='flex items-center gap-1'>
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
                    aria-hidden='true'
                  />
                  <span>{Math.abs(trend)}%</span>
                </div>
                <span className='text-xs text-muted-foreground'>
                  от прошлого месяца
                </span>
              </div>
            )}

            {description && (
              <p className='text-xs text-muted-foreground leading-relaxed'>
                {description}
              </p>
            )}
          </div>
        </CardContent>

        {/* Hover effect gradient */}
        <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700' />
      </Card>
    );
  };

  return (
    <Landmark role='main' aria-labelledby='dashboard-title'>
      {/* Live region for announcements */}
      <LiveRegion>{isLoading && 'Загружаются данные дашборда'}</LiveRegion>

      <div className='space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'>
        {/* Enhanced Header Section */}
        <header className='space-y-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='space-y-2'>
              <p className='text-muted-foreground text-base sm:text-lg leading-relaxed'>
                Добро пожаловать,{' '}
                <span className='font-semibold text-foreground'>
                  {userDisplayName}
                </span>
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <div className='hidden sm:flex items-center gap-2 text-sm text-muted-foreground'>
                <Clock className='h-4 w-4' aria-hidden='true' />
                <AccessibleDate date={lastUpdated} format='short' />
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={refreshData}
                disabled={isLoading}
                className='group'
                aria-label='Обновить данные'
              >
                <RefreshCw
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isLoading && 'animate-spin',
                    'group-hover:rotate-180'
                  )}
                  aria-hidden='true'
                />
                <span className='hidden sm:inline ml-2'>Обновить</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Enhanced Stats Cards Grid */}
        <section aria-labelledby='stats-title'>
          <AccessibleHeading level={2} id='stats-title' className='sr-only'>
            Статистика заявок
          </AccessibleHeading>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
            <StatCard
              title='Всего заявок'
              value={dashboardStats.totalApplications}
              icon={FileText}
              trend={dashboardStats.growthRate}
              color='blue'
              loading={isLoading}
              onClick={() => announce('Переход к списку всех заявок')}
              description='Общее количество заявок в системе'
            />
            <StatCard
              title='На рассмотрении'
              value={dashboardStats.pendingApplications}
              icon={Clock}
              color='amber'
              loading={isLoading}
              onClick={() => announce('Переход к заявкам на рассмотрении')}
              description='Заявки ожидающие решения'
            />
            <StatCard
              title='Одобрено'
              value={dashboardStats.approvedApplications}
              icon={CheckCircle}
              trend={8.5}
              color='emerald'
              loading={isLoading}
              onClick={() => announce('Переход к одобренным заявкам')}
              description='Успешно одобренные заявки'
            />
            <StatCard
              title='Общая сумма'
              value={formatCurrency(dashboardStats.totalAmount)}
              icon={CreditCard}
              trend={23.2}
              color='purple'
              loading={isLoading}
              onClick={() => announce('Просмотр финансовой аналитики')}
              description='Общий объем одобренных кредитов'
            />
          </div>
        </section>

        {/* Main Content Grid - Enhanced for Mobile */}
        <div className='grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8'>
          {/* Recent Applications - Full width on mobile, 2/3 on desktop */}
          <Card className='xl:col-span-8 border-0 shadow-lg'>
            <CardHeader className='flex flex-row items-center justify-between pb-4'>
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center'>
                  <FileText
                    className='h-5 w-5 text-primary'
                    aria-hidden='true'
                  />
                </div>
                <div>
                  <CardTitle className='text-xl font-semibold'>
                    Последние заявки
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    Недавно поданные заявки
                  </p>
                </div>
              </div>
              <Button variant='ghost' size='sm' className='gap-2'>
                <Eye className='h-4 w-4' aria-hidden='true' />
                <span className='hidden sm:inline'>Все заявки</span>
                <ArrowUpRight className='h-3 w-3' aria-hidden='true' />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-3'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ListItemSkeleton key={i} showAvatar />
                  ))}
                </div>
              ) : (
                <div className='space-y-4'>
                  {recentApplications.map(app => (
                    <div
                      key={app.id}
                      className={cn(
                        'group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4',
                        'p-4 rounded-xl transition-all duration-200',
                        'bg-gradient-to-r from-muted/50 to-muted/30',
                        'hover:from-muted/70 hover:to-muted/50',
                        'hover:shadow-md cursor-pointer',
                        'focus:ring-2 focus:ring-primary/20 focus:outline-none',
                        app.priority === 'high' &&
                          'ring-1 ring-red-200 dark:ring-red-800'
                      )}
                      tabIndex={0}
                      role='button'
                      aria-label={`Заявка ${app.applicantName}, сумма ${formatCurrency(app.amount)}`}
                    >
                      {/* Mobile: Stacked layout */}
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-start justify-between'>
                          <div>
                            <h3 className='font-semibold text-foreground group-hover:text-primary transition-colors'>
                              {app.applicantName}
                            </h3>
                            <p className='text-sm text-muted-foreground'>
                              {app.programName}
                            </p>
                          </div>
                          <AccessibleStatusBadge status={app.status} showIcon />
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <AccessibleAmount
                            amount={app.amount}
                            className='font-semibold text-lg'
                          />
                          <AccessibleDate
                            date={app.createdAt}
                            format='short'
                            className='text-muted-foreground'
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Notifications Sidebar */}
          <div className='xl:col-span-4 space-y-6'>
            {/* Quick Actions */}
            <Card className='border-0 shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center'>
                    <Zap
                      className='h-5 w-5 text-emerald-600'
                      aria-hidden='true'
                    />
                  </div>
                  <CardTitle className='text-xl'>Быстрые действия</CardTitle>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                {quickActions.map(action => (
                  <Button
                    key={action.id}
                    variant='outline'
                    className={cn(
                      'w-full justify-start gap-3 p-4 h-auto border-0',
                      'bg-gradient-to-r from-muted/30 to-muted/20',
                      'hover:from-primary/10 hover:to-primary/5',
                      'hover:text-primary transition-all duration-200',
                      'group'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-200',
                        'group-hover:scale-110',
                        action.color === 'blue' && 'bg-blue-500/10',
                        action.color === 'purple' && 'bg-purple-500/10',
                        action.color === 'emerald' && 'bg-emerald-500/10',
                        action.color === 'orange' && 'bg-orange-500/10'
                      )}
                    >
                      <action.icon
                        className={cn(
                          'h-4 w-4',
                          action.color === 'blue' && 'text-blue-600',
                          action.color === 'purple' && 'text-purple-600',
                          action.color === 'emerald' && 'text-emerald-600',
                          action.color === 'orange' && 'text-orange-600'
                        )}
                        aria-hidden='true'
                      />
                    </div>
                    <div className='text-left'>
                      <div className='font-medium'>{action.title}</div>
                      <div className='text-xs text-muted-foreground'>
                        {action.description}
                      </div>
                    </div>
                    <ArrowUpRight
                      className='h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity'
                      aria-hidden='true'
                    />
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Enhanced Notifications */}
            <Card className='border-0 shadow-lg'>
              <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center'>
                      <AlertCircle
                        className='h-5 w-5 text-amber-600'
                        aria-hidden='true'
                      />
                    </div>
                    <CardTitle className='text-xl'>Уведомления</CardTitle>
                  </div>
                  <Badge variant='secondary' className='text-xs'>
                    2
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div
                    className={cn(
                      'p-4 rounded-xl transition-all duration-200 hover:shadow-md',
                      'bg-gradient-to-r from-amber-50 to-orange-50',
                      'dark:from-amber-950/30 dark:to-orange-950/30',
                      'border border-amber-200/50 dark:border-amber-800/50'
                    )}
                  >
                    <div className='flex gap-3'>
                      <AlertCircle
                        className='h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5'
                        aria-hidden='true'
                      />
                      <div className='space-y-1'>
                        <p className='text-sm font-semibold text-amber-900 dark:text-amber-100'>
                          Требуется внимание
                        </p>
                        <p className='text-xs text-amber-700 dark:text-amber-300 leading-relaxed'>
                          5 заявок ожидают документы более 3 дней
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'p-4 rounded-xl transition-all duration-200 hover:shadow-md',
                      'bg-gradient-to-r from-blue-50 to-cyan-50',
                      'dark:from-blue-950/30 dark:to-cyan-950/30',
                      'border border-blue-200/50 dark:border-blue-800/50'
                    )}
                  >
                    <div className='flex gap-3'>
                      <Calendar
                        className='h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5'
                        aria-hidden='true'
                      />
                      <div className='space-y-1'>
                        <p className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
                          Заседание комиссии
                        </p>
                        <p className='text-xs text-blue-700 dark:text-blue-300 leading-relaxed'>
                          Запланировано на завтра в 14:00
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Landmark>
  );
};
