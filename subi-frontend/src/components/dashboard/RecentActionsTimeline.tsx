import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  Edit,
  Shield,
  Key,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentAction {
  id: string;
  type:
    | 'user_login'
    | 'user_logout'
    | 'application_created'
    | 'application_approved'
    | 'application_rejected'
    | 'document_uploaded'
    | 'document_downloaded'
    | 'role_assigned'
    | 'permission_granted'
    | 'profile_updated';
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface RecentActionsTimelineProps {
  actions?: RecentAction[];
  limit?: number;
  showHeader?: boolean;
}

const actionIcons = {
  user_login: {
    icon: User,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  },
  user_logout: {
    icon: User,
    color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
  },
  application_created: {
    icon: FileText,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  },
  application_approved: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  },
  application_rejected: {
    icon: XCircle,
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  },
  document_uploaded: {
    icon: Upload,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  },
  document_downloaded: {
    icon: Download,
    color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
  },
  role_assigned: {
    icon: Shield,
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  },
  permission_granted: {
    icon: Key,
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  },
  profile_updated: {
    icon: Edit,
    color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30',
  },
};

// Mock data generator
const generateMockActions = (): RecentAction[] => {
  const mockActions: RecentAction[] = [
    {
      id: '1',
      type: 'application_approved',
      userId: '1',
      userName: 'Айгүл Токтосунова',
      description: 'Заявка на микрокредит одобрена',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      metadata: { applicationId: 'APP-001', amount: 500000 },
    },
    {
      id: '2',
      type: 'user_login',
      userId: '2',
      userName: 'Максат Жолдошев',
      description: 'Вошел в систему',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'document_uploaded',
      userId: '3',
      userName: 'Нургуль Осмонова',
      description: 'Загружен документ "Справка о доходах"',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      metadata: { documentType: 'income_certificate' },
    },
    {
      id: '4',
      type: 'role_assigned',
      userId: '4',
      userName: 'Асылбек Усенов',
      description: 'Назначена роль "Кредитный аналитик"',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      metadata: { role: 'CREDIT_ANALYST' },
    },
    {
      id: '5',
      type: 'application_created',
      userId: '5',
      userName: 'Гүлзада Алымбекова',
      description: 'Создана новая заявка на кредит',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: { applicationId: 'APP-002', programName: 'Стартап поддержка' },
    },
    {
      id: '6',
      type: 'permission_granted',
      userId: '6',
      userName: 'Эркин Маматов',
      description: 'Предоставлено разрешение "Управление пользователями"',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      metadata: { permission: 'USER_MANAGEMENT' },
    },
  ];

  return mockActions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - time.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'только что';
  if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ч назад`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} дн назад`;
};

export const RecentActionsTimeline: React.FC<RecentActionsTimelineProps> = ({
  actions = generateMockActions(),
  limit = 6,
  showHeader = true,
}) => {
  const displayedActions = actions.slice(0, limit);

  return (
    <Card className='border-0 shadow-lg'>
      {showHeader && (
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center'>
              <Activity className='h-5 w-5 text-blue-600' aria-hidden='true' />
            </div>
            <div>
              <CardTitle className='text-xl font-semibold'>
                Последние действия
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                Активность пользователей в системе
              </p>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className='space-y-4'>
          {displayedActions.map((action, index) => {
            const actionConfig = actionIcons[action.type];
            const Icon = actionConfig.icon;
            const isLast = index === displayedActions.length - 1;

            return (
              <div key={action.id} className='relative'>
                {/* Timeline line */}
                {!isLast && (
                  <div className='absolute left-5 top-12 w-0.5 h-8 bg-gradient-to-b from-border to-transparent' />
                )}

                <div className='flex gap-4 group'>
                  {/* Timeline dot with icon */}
                  <div
                    className={cn(
                      'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background',
                      actionConfig.color,
                      'transition-transform duration-200 group-hover:scale-110'
                    )}
                  >
                    <Icon className='h-4 w-4' aria-hidden='true' />
                  </div>

                  {/* Action content */}
                  <div className='flex-1 space-y-1 pb-4'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-foreground leading-tight'>
                          {action.description}
                        </p>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span className='font-medium'>{action.userName}</span>
                          <span>•</span>
                          <time
                            dateTime={action.timestamp}
                            className='flex items-center gap-1'
                          >
                            <Clock className='h-3 w-3' aria-hidden='true' />
                            {formatRelativeTime(action.timestamp)}
                          </time>
                        </div>

                        {/* Action metadata */}
                        {action.metadata && (
                          <div className='flex flex-wrap gap-1 mt-2'>
                            {Object.entries(action.metadata).map(
                              ([key, value]) => (
                                <Badge
                                  key={key}
                                  variant='secondary'
                                  className='text-xs px-2 py-0.5'
                                >
                                  {typeof value === 'string'
                                    ? value
                                    : JSON.stringify(value)}
                                </Badge>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load more actions button */}
          {actions.length > limit && (
            <div className='pt-2 border-t'>
              <button
                className='w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 hover:bg-muted/30 rounded-lg'
                onClick={() => {
                  // Handle load more actions
                  console.log('Load more actions');
                }}
              >
                Показать больше действий ({actions.length - limit} скрыто)
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
