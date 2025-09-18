import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { StatCard } from '@/components/ui/stat-card';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { RecentActionsTimeline } from '@/components/dashboard/RecentActionsTimeline';
import { ActiveRolesCard } from '@/components/dashboard/ActiveRolesCard';
import { ActivePermissionsCard } from '@/components/dashboard/ActivePermissionsCard';

export const UserManagementDashboard: React.FC = () => {
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
    return <DashboardSkeleton />;
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