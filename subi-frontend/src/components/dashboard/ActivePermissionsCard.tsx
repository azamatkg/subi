import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  Users,
  Shield,
  FileText,
  Settings,
  BarChart3,
  Eye,
  ArrowUpRight,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionInfo {
  id: string;
  name: string;
  displayName: string;
  category: 'system' | 'user_management' | 'applications' | 'reports' | 'settings';
  activeUsers: number;
  totalAssigned: number;
  recentUsage: number; // usage count in last 24h
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}

interface ActivePermissionsCardProps {
  permissions?: PermissionInfo[];
  showHeader?: boolean;
  maxPermissions?: number;
}

const categoryIcons = {
  system: { icon: Shield, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  user_management: { icon: Users, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  applications: { icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  reports: { icon: BarChart3, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  settings: { icon: Settings, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
};

const riskLevelConfig = {
  low: { label: 'Низкий', color: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30', icon: CheckCircle },
  medium: { label: 'Средний', color: 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30', icon: Eye },
  high: { label: 'Высокий', color: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30', icon: AlertTriangle },
};

// Mock data generator
const generateMockPermissions = (): PermissionInfo[] => {
  return [
    {
      id: 'system_admin',
      name: 'SYSTEM_ADMINISTRATION',
      displayName: 'Системное администрирование',
      category: 'system',
      activeUsers: 3,
      totalAssigned: 5,
      recentUsage: 15,
      riskLevel: 'high',
      description: 'Полный доступ к системным настройкам'
    },
    {
      id: 'user_create',
      name: 'USER_CREATE',
      displayName: 'Создание пользователей',
      category: 'user_management',
      activeUsers: 8,
      totalAssigned: 12,
      recentUsage: 23,
      riskLevel: 'medium',
      description: 'Создание новых пользователей'
    },
    {
      id: 'user_edit',
      name: 'USER_EDIT',
      displayName: 'Редактирование пользователей',
      category: 'user_management',
      activeUsers: 6,
      totalAssigned: 15,
      recentUsage: 31,
      riskLevel: 'medium',
      description: 'Изменение данных пользователей'
    },
    {
      id: 'app_approve',
      name: 'APPLICATION_APPROVE',
      displayName: 'Одобрение заявок',
      category: 'applications',
      activeUsers: 12,
      totalAssigned: 18,
      recentUsage: 45,
      riskLevel: 'high',
      description: 'Одобрение кредитных заявок'
    },
    {
      id: 'app_reject',
      name: 'APPLICATION_REJECT',
      displayName: 'Отклонение заявок',
      category: 'applications',
      activeUsers: 10,
      totalAssigned: 18,
      recentUsage: 28,
      riskLevel: 'medium',
      description: 'Отклонение кредитных заявок'
    },
    {
      id: 'reports_view',
      name: 'REPORTS_VIEW',
      displayName: 'Просмотр отчетов',
      category: 'reports',
      activeUsers: 25,
      totalAssigned: 45,
      recentUsage: 67,
      riskLevel: 'low',
      description: 'Доступ к системным отчетам'
    },
    {
      id: 'settings_modify',
      name: 'SETTINGS_MODIFY',
      displayName: 'Изменение настроек',
      category: 'settings',
      activeUsers: 5,
      totalAssigned: 8,
      recentUsage: 12,
      riskLevel: 'medium',
      description: 'Изменение системных настроек'
    },
    {
      id: 'documents_download',
      name: 'DOCUMENTS_DOWNLOAD',
      displayName: 'Скачивание документов',
      category: 'applications',
      activeUsers: 34,
      totalAssigned: 78,
      recentUsage: 89,
      riskLevel: 'low',
      description: 'Скачивание документов заявок'
    },
  ];
};

const getCategoryDisplayName = (category: string): string => {
  const categoryNames = {
    system: 'Система',
    user_management: 'Пользователи',
    applications: 'Заявки',
    reports: 'Отчеты',
    settings: 'Настройки',
  };
  return categoryNames[category as keyof typeof categoryNames] || category;
};

export const ActivePermissionsCard: React.FC<ActivePermissionsCardProps> = ({
  permissions = generateMockPermissions(),
  showHeader = true,
  maxPermissions = 8,
}) => {

  const displayedPermissions = permissions.slice(0, maxPermissions);
  const totalActiveUsers = permissions.reduce((sum, perm) => sum + perm.activeUsers, 0);

  // Group permissions by category for summary
  const categoryStats = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = { count: 0, active: 0 };
    }
    acc[perm.category].count++;
    if (perm.activeUsers > 0) acc[perm.category].active++;
    return acc;
  }, {} as Record<string, { count: number; active: number }>);

  return (
    <Card className="border-0 shadow-lg">
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  Активные разрешения
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalActiveUsers} активных использований
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </button>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {/* Category summary */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(categoryStats).slice(0, 4).map(([category, stats]) => {
              const categoryConfig = categoryIcons[category as keyof typeof categoryIcons];
              const Icon = categoryConfig?.icon || Key;

              return (
                <div
                  key={category}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                >
                  <div className={cn('p-1 rounded', categoryConfig?.color)}>
                    <Icon className="h-3 w-3" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {getCategoryDisplayName(category)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.active}/{stats.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Permissions list */}
          {displayedPermissions.map((permission) => {
            const categoryConfig = categoryIcons[permission.category];
            const riskConfig = riskLevelConfig[permission.riskLevel];
            const Icon = categoryConfig?.icon || Key;
            const RiskIcon = riskConfig.icon;
            const usagePercentage = (permission.activeUsers / permission.totalAssigned) * 100;

            return (
              <div
                key={permission.id}
                className={cn(
                  'group relative p-3 rounded-lg transition-all duration-200',
                  'bg-gradient-to-r from-muted/20 to-muted/10',
                  'hover:from-muted/40 hover:to-muted/30',
                  'hover:shadow-sm cursor-pointer',
                  'border border-transparent hover:border-border/30'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Permission icon */}
                    <div className={cn('p-1.5 rounded-lg', categoryConfig?.color)}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {permission.displayName}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs px-1.5 py-0.5', riskConfig.color)}
                        >
                          <RiskIcon className="h-2.5 w-2.5 mr-1" aria-hidden="true" />
                          {riskConfig.label}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {permission.description}
                      </p>

                      {/* Usage stats */}
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                          <span className="font-medium">{permission.activeUsers}</span>
                          <span className="text-muted-foreground">/ {permission.totalAssigned}</span>
                        </div>

                        <div className="flex items-center gap-1 text-muted-foreground">
                          <BarChart3 className="h-3 w-3" aria-hidden="true" />
                          <span>{permission.recentUsage} использований</span>
                        </div>

                        <Badge variant="outline" className="text-xs">
                          {getCategoryDisplayName(permission.category)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Usage percentage and action */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">
                        {usagePercentage.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        использ.
                      </div>
                    </div>

                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Usage bar */}
                <div className="mt-2">
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500 rounded-full',
                        permission.riskLevel === 'high' && 'bg-red-500',
                        permission.riskLevel === 'medium' && 'bg-yellow-500',
                        permission.riskLevel === 'low' && 'bg-green-500'
                      )}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary footer */}
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Всего активных разрешений
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {displayedPermissions.filter(p => p.activeUsers > 0).length}/{displayedPermissions.length}
                </Badge>
                <button
                  className="text-primary hover:text-primary/80 transition-colors text-xs font-medium"
                  onClick={() => {
                    // Handle view all permissions
                    console.log('View all permissions');
                  }}
                >
                  Подробнее
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};