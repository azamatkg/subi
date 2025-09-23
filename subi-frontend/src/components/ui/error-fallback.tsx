import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Server,
  Shield,
  Clock,
  Home,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  type?: 'network' | 'server' | 'permission' | 'timeout' | 'generic';
  title?: string;
  description?: string;
  showRetry?: boolean;
  showBack?: boolean;
  showHome?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const errorConfigs = {
  network: {
    icon: WifiOff,
    title: 'Нет подключения к интернету',
    description: 'Проверьте подключение к интернету и попробуйте снова.',
    iconColor: 'text-amber-500',
    bgColor:
      'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
  },
  server: {
    icon: Server,
    title: 'Ошибка сервера',
    description: 'Сервер временно недоступен. Попробуйте позже.',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  },
  permission: {
    icon: Shield,
    title: 'Доступ запрещен',
    description: 'У вас нет прав для просмотра этого содержимого.',
    iconColor: 'text-orange-500',
    bgColor:
      'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
  },
  timeout: {
    icon: Clock,
    title: 'Время ожидания истекло',
    description: 'Запрос занял слишком много времени. Попробуйте снова.',
    iconColor: 'text-blue-500',
    bgColor:
      'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  },
  generic: {
    icon: AlertTriangle,
    title: 'Произошла ошибка',
    description: 'Что-то пошло не так. Попробуйте обновить страницу.',
    iconColor: 'text-destructive',
    bgColor: 'bg-destructive/5 border-destructive/20',
  },
};

export function ErrorFallback({
  error,
  resetError,
  type = 'generic',
  title,
  description,
  showRetry = true,
  showBack = false,
  showHome = false,
  className,
  size = 'md',
}: ErrorFallbackProps) {
  const config = errorConfigs[type];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'p-4 space-y-3',
    md: 'p-6 space-y-4',
    lg: 'p-8 space-y-6',
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <Card className={cn('w-full max-w-md mx-auto', config.bgColor, className)}>
      <CardContent className={cn('text-center', sizeClasses[size])}>
        {/* Error Icon */}
        <div className='flex justify-center'>
          <div
            className={cn(
              'rounded-full p-3',
              size === 'sm' ? 'p-2' : size === 'lg' ? 'p-4' : 'p-3'
            )}
          >
            <IconComponent className={cn(iconSizes[size], config.iconColor)} />
          </div>
        </div>

        {/* Error Message */}
        <div className='space-y-2'>
          <h3
            className={cn(
              'font-semibold text-foreground',
              size === 'sm'
                ? 'text-base'
                : size === 'lg'
                  ? 'text-xl'
                  : 'text-lg'
            )}
          >
            {title || config.title}
          </h3>
          <p
            className={cn(
              'text-muted-foreground leading-relaxed',
              size === 'sm' ? 'text-sm' : 'text-base'
            )}
          >
            {description || config.description}
          </p>
        </div>

        {/* Error Details (Development) */}
        {error && process.env.NODE_ENV === 'development' && (
          <Alert className='text-left text-xs'>
            <AlertTriangle className='h-3 w-3' />
            <AlertDescription>
              <strong>Dev Error:</strong> {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-2 justify-center'>
          {showRetry && (
            <Button
              onClick={handleRetry}
              className='gap-2'
              size={size === 'sm' ? 'sm' : 'default'}
            >
              <RefreshCw className='w-4 h-4' />
              Попробовать снова
            </Button>
          )}

          {showBack && (
            <Button
              onClick={handleBack}
              variant='outline'
              className='gap-2'
              size={size === 'sm' ? 'sm' : 'default'}
            >
              <ArrowLeft className='w-4 h-4' />
              Назад
            </Button>
          )}

          {showHome && (
            <Button
              onClick={handleHome}
              variant='outline'
              className='gap-2'
              size={size === 'sm' ? 'sm' : 'default'}
            >
              <Home className='w-4 h-4' />
              На главную
            </Button>
          )}
        </div>

        {/* Network Status Indicator */}
        {type === 'network' && (
          <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 rounded-full bg-red-400 animate-pulse' />
              <span>Нет соединения</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Specific error fallback components
 */
export function NetworkErrorFallback(props: Omit<ErrorFallbackProps, 'type'>) {
  return <ErrorFallback {...props} type='network' />;
}

export function ServerErrorFallback(props: Omit<ErrorFallbackProps, 'type'>) {
  return <ErrorFallback {...props} type='server' />;
}

export function PermissionErrorFallback(
  props: Omit<ErrorFallbackProps, 'type'>
) {
  return <ErrorFallback {...props} type='permission' showBack showHome />;
}

export function TimeoutErrorFallback(props: Omit<ErrorFallbackProps, 'type'>) {
  return <ErrorFallback {...props} type='timeout' />;
}

/**
 * Full page error fallback
 */
export function PageErrorFallback({
  error,
  resetError,
  type = 'generic',
}: {
  error?: Error;
  resetError?: () => void;
  type?: ErrorFallbackProps['type'];
}) {
  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-muted/20'>
      <ErrorFallback
        error={error}
        resetError={resetError}
        type={type}
        size='lg'
        showRetry
        showHome
        className='max-w-lg'
      />
    </div>
  );
}

/**
 * Component that shows network error when offline
 */
export function NetworkStatusGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isOnline = useNetworkStatus();

  if (!isOnline) {
    return fallback || <NetworkErrorFallback showRetry />;
  }

  return <>{children}</>;
}
