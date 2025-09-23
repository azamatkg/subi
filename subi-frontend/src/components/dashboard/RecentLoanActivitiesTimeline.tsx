import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  FileText,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoanActivity {
  id: string;
  type:
    | 'approval'
    | 'rejection'
    | 'disbursement'
    | 'submission'
    | 'review'
    | 'commission';
  title: string;
  description: string;
  amount?: number;
  applicant: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

const dummyActivities: LoanActivity[] = [
  {
    id: '1',
    type: 'disbursement',
    title: 'Кредит выдан',
    description: 'Бизнес-кредит #2024-0891',
    amount: 2500000,
    applicant: 'ОсОО "Альфа Трейд"',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    status: 'completed',
  },
  {
    id: '2',
    type: 'approval',
    title: 'Заявка одобрена',
    description: 'Микрокредит #2024-0892',
    amount: 150000,
    applicant: 'Курманов Азамат',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    status: 'completed',
  },
  {
    id: '3',
    type: 'submission',
    title: 'Новая заявка',
    description: 'Агрокредит #2024-0893',
    amount: 800000,
    applicant: 'КХ "Жаныл Талаа"',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    status: 'pending',
  },
  {
    id: '4',
    type: 'commission',
    title: 'Направлено в комиссию',
    description: 'Ипотечный кредит #2024-0890',
    amount: 5000000,
    applicant: 'Сатаров Бекбол',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'pending',
  },
  {
    id: '5',
    type: 'rejection',
    title: 'Заявка отклонена',
    description: 'Потребительский кредит #2024-0889',
    amount: 300000,
    applicant: 'Мамбетова Айжан',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    status: 'cancelled',
  },
  {
    id: '6',
    type: 'review',
    title: 'Документы на проверке',
    description: 'Автокредит #2024-0888',
    amount: 1200000,
    applicant: 'Токтосунов Мирлан',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: 'pending',
  },
  {
    id: '7',
    type: 'approval',
    title: 'Заявка одобрена',
    description: 'Бизнес-кредит #2024-0887',
    amount: 3500000,
    applicant: 'ОсОО "Бишкек Строй"',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    status: 'completed',
  },
];

const getActivityIcon = (type: LoanActivity['type']) => {
  const iconProps = { className: 'h-4 w-4' };

  switch (type) {
    case 'approval':
      return <CheckCircle {...iconProps} />;
    case 'rejection':
      return <XCircle {...iconProps} />;
    case 'disbursement':
      return <CreditCard {...iconProps} />;
    case 'submission':
      return <FileText {...iconProps} />;
    case 'review':
      return <AlertCircle {...iconProps} />;
    case 'commission':
      return <Users {...iconProps} />;
    default:
      return <Clock {...iconProps} />;
  }
};

const getActivityColor = (
  type: LoanActivity['type'],
  status: LoanActivity['status']
) => {
  if (status === 'cancelled') return 'text-red-600 bg-red-50 border-red-200';

  switch (type) {
    case 'approval':
    case 'disbursement':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'rejection':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'submission':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'review':
    case 'commission':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusBadge = (status: LoanActivity['status']) => {
  switch (status) {
    case 'completed':
      return (
        <Badge variant='secondary' className='bg-green-100 text-green-800'>
          Завершено
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant='secondary' className='bg-amber-100 text-amber-800'>
          В процессе
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant='secondary' className='bg-red-100 text-red-800'>
          Отменено
        </Badge>
      );
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ч назад`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} дн назад`;
  }
};

const formatAmount = (amount?: number) => {
  if (!amount) return '';
  return `${(amount / 1000).toLocaleString()} тыс. ₽`;
};

export const RecentLoanActivitiesTimeline: React.FC = () => {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Clock className='h-5 w-5' />
          Последние действия
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <ScrollArea className='h-80'>
          <div className='space-y-0'>
            {dummyActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-4 p-4 border-b border-border/50 hover:bg-muted/30 transition-colors',
                  index === dummyActivities.length - 1 && 'border-b-0'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2',
                    getActivityColor(activity.type, activity.status)
                  )}
                >
                  {getActivityIcon(activity.type)}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-medium text-sm text-foreground'>
                          {activity.title}
                        </h4>
                        {getStatusBadge(activity.status)}
                      </div>

                      <p className='text-sm text-muted-foreground mb-1'>
                        {activity.description}
                      </p>

                      <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                        <span>{activity.applicant}</span>
                        {activity.amount && (
                          <>
                            <span>•</span>
                            <span className='font-medium'>
                              {formatAmount(activity.amount)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className='text-xs text-muted-foreground whitespace-nowrap'>
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
