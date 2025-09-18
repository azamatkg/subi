import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  description?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  color = 'blue'
}) => {
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