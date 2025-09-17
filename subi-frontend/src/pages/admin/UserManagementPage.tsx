import React, { useState, useEffect } from 'react';
import { Users, BarChart3, Shield, Key, TrendingUp, Clock, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { UserListPage } from './UserListPage';
import { RecentActionsTimeline } from '@/components/dashboard/RecentActionsTimeline';
import { ActiveRolesCard } from '@/components/dashboard/ActiveRolesCard';
import { ActivePermissionsCard } from '@/components/dashboard/ActivePermissionsCard';
import { cn } from '@/lib/utils';

// StatCard component for dashboard metrics
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  description?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
}> = ({ title, value, icon: Icon, trend, description, color = 'blue' }) => {
  const { t } = useTranslation();
  const colorStyles = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-200/20 text-blue-700 dark:text-blue-300',
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-200/20 text-emerald-700 dark:text-emerald-300',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-200/20 text-amber-700 dark:text-amber-300',
    red: 'from-red-500/10 to-red-600/5 border-red-200/20 text-red-700 dark:text-red-300',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-200/20 text-purple-700 dark:text-purple-300',
  };

  return (
    <Card className={cn(
      'border-0 shadow-md bg-gradient-to-br transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
      colorStyles[color]
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn(
            'p-2 rounded-xl',
            `bg-gradient-to-br ${colorStyles[color].split(' ')[0]} ${colorStyles[color].split(' ')[1]}`
          )}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1">
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
                trend > 0
                  ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30'
                  : trend < 0
                    ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
                    : 'text-muted-foreground bg-muted/50'
              )}>
                <TrendingUp
                  className={cn('h-3 w-3', trend < 0 && 'rotate-180')}
                  aria-hidden="true"
                />
                <span>{Math.abs(trend)}%</span>
              </div>
              <span className="text-xs text-muted-foreground">{t('userManagement.dashboard.fromLastMonth')}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main dashboard component
const UserManagementDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  // Simplified dashboard data
  const [dashboardData, setDashboardData] = useState({
    activeUsers: 0,
    onlineUsers: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      setDashboardData({
        activeUsers: 892,
        onlineUsers: 45,
      });

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted/50 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Only Active Users and Online Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          title={t('userManagement.dashboard.activeUsers')}
          value={dashboardData.activeUsers}
          icon={Activity}
          trend={5.4}
          color="emerald"
          description={t('userManagement.dashboard.activeInLast30Days')}
        />
        <StatCard
          title={t('userManagement.dashboard.onlineUsers')}
          value={dashboardData.onlineUsers}
          icon={Clock}
          color="purple"
          description={t('userManagement.dashboard.currentlyInSystem')}
        />
      </div>

      {/* New Dashboard Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Actions Timeline */}
        <div className="lg:col-span-2 xl:col-span-1">
          <RecentActionsTimeline />
        </div>

        {/* Active Roles Card */}
        <div className="xl:col-span-1">
          <ActiveRolesCard />
        </div>

        {/* Active Permissions Card */}
        <div className="xl:col-span-1">
          <ActivePermissionsCard />
        </div>
      </div>
    </div>
  );
};

export const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  useSetPageTitle(t('navigation.userManagement'));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="inline-flex items-center justify-start max-w-fit">
          <TabsTrigger value="dashboard" className="flex items-center justify-center">
            <BarChart3 className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('userManagement.tabs.users')}
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('userManagement.tabs.roles')}
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            {t('userManagement.tabs.permissions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <UserManagementDashboard />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserListPage />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('userManagement.rolesList')}
              </CardTitle>
              <CardDescription>
                Управление ролями пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  Управление ролями будет реализовано позже
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('userManagement.permissions')}
              </CardTitle>
              <CardDescription>
                Управление разрешениями системы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  Управление разрешениями будет реализовано позже
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};