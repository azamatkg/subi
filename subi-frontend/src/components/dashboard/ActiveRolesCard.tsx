import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  TrendingUp,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleInfo {
  id: string;
  name: string;
  displayName: string;
  activeUsers: number;
  totalUsers: number;
  recentActivity: number; // actions in last 24h
  color: string;
  description: string;
}

interface ActiveRolesCardProps {
  roles?: RoleInfo[];
  showHeader?: boolean;
  maxRoles?: number;
}

// Mock data generator
const generateMockRoles = (): RoleInfo[] => {
  return [
    {
      id: 'admin',
      name: 'ADMIN',
      displayName: 'Администратор',
      activeUsers: 3,
      totalUsers: 5,
      recentActivity: 28,
      color: '#DC2626',
      description: 'Полный доступ к системе'
    },
    {
      id: 'credit_manager',
      name: 'CREDIT_MANAGER',
      displayName: 'Кредитный менеджер',
      activeUsers: 8,
      totalUsers: 12,
      recentActivity: 45,
      color: '#7C3AED',
      description: 'Управление кредитными программами'
    },
    {
      id: 'credit_analyst',
      name: 'CREDIT_ANALYST',
      displayName: 'Кредитный аналитик',
      activeUsers: 15,
      totalUsers: 23,
      recentActivity: 67,
      color: '#059669',
      description: 'Анализ заявок и документов'
    },
    {
      id: 'decision_maker',
      name: 'DECISION_MAKER',
      displayName: 'Лицо принимающее решение',
      activeUsers: 6,
      totalUsers: 8,
      recentActivity: 32,
      color: '#EA580C',
      description: 'Принятие решений по заявкам'
    },
    {
      id: 'commission_member',
      name: 'COMMISSION_MEMBER',
      displayName: 'Член комиссии',
      activeUsers: 4,
      totalUsers: 7,
      recentActivity: 19,
      color: '#0891B2',
      description: 'Участие в заседаниях комиссии'
    },
    {
      id: 'user',
      name: 'USER',
      displayName: 'Пользователь',
      activeUsers: 156,
      totalUsers: 892,
      recentActivity: 89,
      color: '#6B7280',
      description: 'Подача заявок на кредит'
    },
  ];
};

const getActivityLevel = (activity: number): { label: string; color: string } => {
  if (activity >= 50) return { label: 'Высокая', color: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' };
  if (activity >= 25) return { label: 'Средняя', color: 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30' };
  return { label: 'Низкая', color: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30' };
};

export const ActiveRolesCard: React.FC<ActiveRolesCardProps> = ({
  roles = generateMockRoles(),
  showHeader = true,
  maxRoles = 6,
}) => {

  const displayedRoles = roles.slice(0, maxRoles);
  const totalActiveUsers = roles.reduce((sum, role) => sum + role.activeUsers, 0);
  const totalUsers = roles.reduce((sum, role) => sum + role.totalUsers, 0);

  return (
    <Card className="border-0 shadow-lg">
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  Активные роли
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalActiveUsers} из {totalUsers} пользователей онлайн
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
          {displayedRoles.map((role) => {
            const activityLevel = getActivityLevel(role.recentActivity);
            const activePercentage = (role.activeUsers / role.totalUsers) * 100;

            return (
              <div
                key={role.id}
                className={cn(
                  'group relative p-4 rounded-xl transition-all duration-200',
                  'bg-gradient-to-r from-muted/30 to-muted/20',
                  'hover:from-muted/50 hover:to-muted/40',
                  'hover:shadow-md cursor-pointer',
                  'border border-transparent hover:border-border/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Role color indicator */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: role.color }}
                      aria-hidden="true"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {role.displayName}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs px-2 py-0.5', activityLevel.color)}
                        >
                          {activityLevel.label}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {role.description}
                      </p>

                      {/* User stats */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                          <span className="font-medium">{role.activeUsers}</span>
                          <span className="text-muted-foreground">/ {role.totalUsers}</span>
                        </div>

                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="h-3 w-3" aria-hidden="true" />
                          <span>{role.recentActivity} действий</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active percentage and action button */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {activePercentage.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        активных
                      </div>
                    </div>

                    <ArrowUpRight
                      className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${activePercentage}%`,
                        backgroundColor: role.color,
                      }}
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
                Всего ролей активно
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {displayedRoles.filter(r => r.activeUsers > 0).length}/{displayedRoles.length}
                </Badge>
                <button
                  className="text-primary hover:text-primary/80 transition-colors text-xs font-medium"
                  onClick={() => {
                    // Handle view all roles
                    console.log('View all roles');
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