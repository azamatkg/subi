import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  CreditCard, 
  FileText, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, userDisplayName } = useAuth();
  const { t, formatCurrency, formatNumber } = useTranslation();

  // Mock data - will be replaced with real API calls
  const dashboardStats = {
    totalApplications: 156,
    pendingApplications: 23,
    approvedApplications: 89,
    rejectedApplications: 12,
    totalAmount: 25600000, // in som
    thisMonthApplications: 34,
  };

  const recentApplications = [
    {
      id: '1',
      applicantName: 'Айгүл Токтосунова',
      amount: 500000,
      status: 'UNDER_COMPLETION',
      createdAt: '2024-09-01T10:00:00Z',
    },
    {
      id: '2',
      applicantName: 'Максат Жолдошев',
      amount: 750000,
      status: 'APPROVED',
      createdAt: '2024-09-01T09:30:00Z',
    },
    {
      id: '3',
      applicantName: 'Нургуль Осмонова',
      amount: 300000,
      status: 'SUBMITTED',
      createdAt: '2024-09-01T08:45:00Z',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'default';
      case 'UNDER_COMPLETION':
        return 'secondary';
      case 'APPROVED':
        return 'default'; // Green-ish
      case 'REJECTED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
  }> = ({ title, value, icon, trend, trendUp }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`text-xs flex items-center ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('navigation.dashboard')}
        </h1>
        <p className="text-muted-foreground">
          {t('auth.welcomeBack')}, {userDisplayName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('application.applications')}
          value={formatNumber(dashboardStats.totalApplications)}
          icon={<FileText />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Ожидают рассмотрения"
          value={formatNumber(dashboardStats.pendingApplications)}
          icon={<Clock />}
        />
        <StatCard
          title="Одобрено"
          value={formatNumber(dashboardStats.approvedApplications)}
          icon={<CheckCircle />}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Общая сумма"
          value={formatCurrency(dashboardStats.totalAmount)}
          icon={<CreditCard />}
          trend="+23%"
          trendUp={true}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Applications */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Последние заявки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{app.applicantName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(app.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(app.status)}>
                      {t(`application.status.${app.status.toLowerCase()}`)}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Overview */}
        <div className="col-span-3 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent text-left">
                <FileText className="h-4 w-4" />
                <span>Новая заявка</span>
              </button>
              <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent text-left">
                <Users className="h-4 w-4" />
                <span>Комиссия</span>
              </button>
              <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent text-left">
                <Calendar className="h-4 w-4" />
                <span>Расписание</span>
              </button>
            </CardContent>
          </Card>

          {/* Alerts/Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Уведомления
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Требуется внимание</p>
                    <p className="text-xs text-muted-foreground">
                      5 заявок ожидают документы более 3 дней
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Заседание комиссии</p>
                    <p className="text-xs text-muted-foreground">
                      Запланировано на завтра в 14:00
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};