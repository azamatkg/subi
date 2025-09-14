import React from 'react';
import { Navigate, useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  RefreshCw,
  Route,
} from 'lucide-react';

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
  data?: string;
}

function isRouteError(error: unknown): error is RouteError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error || 'statusText' in error || 'message' in error)
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  // Handle different types of route errors
  const getErrorInfo = () => {
    if (isRouteError(error)) {
      const status = error.status;
      const statusText = error.statusText;
      const message = error.message || error.data;

      switch (status) {
        case 404:
          return {
            title: 'Страница не найдена',
            description: 'Запрашиваемая страница не существует или была удалена.',
            type: 'not-found' as const,
          };
        case 401:
          return {
            title: 'Требуется авторизация',
            description: 'Для доступа к этой странице необходимо войти в систему.',
            type: 'unauthorized' as const,
          };
        case 403:
          return {
            title: 'Доступ запрещен',
            description: 'У вас нет прав для просмотра этой страницы.',
            type: 'forbidden' as const,
          };
        case 500:
          return {
            title: 'Ошибка сервера',
            description: 'На сервере произошла ошибка. Попробуйте позже.',
            type: 'server-error' as const,
          };
        default:
          return {
            title: statusText || 'Ошибка маршрута',
            description: message || 'Произошла ошибка при загрузке страницы.',
            type: 'route-error' as const,
          };
      }
    }

    if (error instanceof Error) {
      return {
        title: 'Ошибка загрузки страницы',
        description: error.message || 'Не удалось загрузить компонент страницы.',
        type: 'component-error' as const,
      };
    }

    return {
      title: 'Неизвестная ошибка',
      description: 'Произошла неожиданная ошибка при навигации.',
      type: 'unknown' as const,
    };
  };

  const errorInfo = getErrorInfo();

  // Handle specific error types with redirects
  if (errorInfo.type === 'unauthorized') {
    return <Navigate to='/auth/login' replace />;
  }

  const handleRetry = () => {
    window.location.reload();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-muted/20'>
      <Card className='w-full max-w-md border-destructive/20 bg-destructive/5'>
        <CardContent className='p-6 sm:p-8 text-center space-y-6'>
          {/* Error Icon */}
          <div className='mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center'>
            <Route className='w-8 h-8 text-destructive' />
          </div>

          {/* Error Message */}
          <div className='space-y-2'>
            <h1 className='text-xl font-semibold text-destructive'>
              {errorInfo.title}
            </h1>
            <p className='text-muted-foreground max-w-sm mx-auto leading-relaxed'>
              {errorInfo.description}
            </p>
          </div>

          {/* Error Details (Development) */}
          {error instanceof Error && process.env.NODE_ENV === 'development' && (
            <Alert className='text-left'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                <strong>Dev Error:</strong> {error.message}
                {error.stack && (
                  <pre className='text-xs mt-2 whitespace-pre-wrap overflow-auto max-h-32'>
                    {error.stack}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Route Error Details (Development) */}
          {isRouteError(error) && process.env.NODE_ENV === 'development' && (
            <Alert className='text-left'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                <strong>Route Error:</strong> {error.status} {error.statusText}
                {error.data && (
                  <pre className='text-xs mt-2 whitespace-pre-wrap overflow-auto max-h-32'>
                    {typeof error.data === 'string' ? error.data : JSON.stringify(error.data, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
            <Button onClick={handleRetry} className='gap-2 min-w-[120px]'>
              <RefreshCw className='w-4 h-4' />
              Попробовать снова
            </Button>

            <Button
              variant='outline'
              onClick={handleBack}
              className='gap-2'
            >
              <ArrowLeft className='w-4 h-4' />
              Назад
            </Button>

            <Button
              variant='outline'
              onClick={handleHome}
              className='gap-2'
            >
              <Home className='w-4 h-4' />
              На главную
            </Button>
          </div>

          {/* Help Text */}
          <div className='text-xs text-muted-foreground'>
            <p>
              Если проблема повторяется, обратитесь к администратору системы.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}