import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  level?: 'page' | 'component' | 'section';
  title?: string;
  description?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  showDetails: boolean;
  lastResetKeys?: Array<string | number>;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false,
      lastResetKeys: props.resetKeys,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report to error monitoring service (like Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError, lastResetKeys } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && resetKeys.length > 0) {
      if (
        !lastResetKeys ||
        resetKeys.some((key, idx) => key !== lastResetKeys[idx])
      ) {
        this.resetErrorBoundary();
      }
    }

    // Reset error boundary when any prop changes (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      lastResetKeys: this.props.resetKeys,
    });
  };

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;

    this.setState({ retryCount: newRetryCount });

    // Add a small delay before retry to prevent rapid retries
    this.retryTimeoutId = setTimeout(() => {
      this.resetErrorBoundary();
    }, 300);
  };

  handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const errorText = `Error: ${error?.message}\n\nStack: ${error?.stack}\n\nComponent Stack: ${errorInfo?.componentStack}`;

    navigator.clipboard.writeText(errorText).then(() => {
      // Could add a toast notification here
      console.log('Error details copied to clipboard');
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  getErrorLevel() {
    return this.props.level || 'component';
  }

  renderErrorUI() {
    const { error, errorInfo, retryCount, showDetails } = this.state;
    const { title, description } = this.props;
    const level = this.getErrorLevel();

    const defaultTitles = {
      page: 'Страница временно недоступна',
      component: 'Компонент не может быть загружен',
      section: 'Раздел временно недоступен',
    };

    const defaultDescriptions = {
      page: 'Произошла ошибка при загрузке страницы. Попробуйте обновить страницу или вернуться позже.',
      component:
        'Этот компонент столкнулся с ошибкой и не может быть отображен.',
      section: 'Данный раздел временно недоступен из-за технической ошибки.',
    };

    return (
      <Card
        className={cn(
          'w-full border-destructive/20 bg-destructive/5',
          level === 'page' && 'min-h-[400px] flex items-center justify-center',
          level === 'component' && 'min-h-[200px]'
        )}
      >
        <CardContent className='p-6 sm:p-8 text-center space-y-6'>
          {/* Error Icon and Title */}
          <div className='space-y-4'>
            <div className='mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center'>
              <AlertTriangle className='w-8 h-8 text-destructive' />
            </div>

            <div className='space-y-2'>
              <h3 className='text-xl font-semibold text-destructive'>
                {title || defaultTitles[level]}
              </h3>
              <p className='text-muted-foreground max-w-md mx-auto'>
                {description || defaultDescriptions[level]}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
            <Button
              onClick={this.handleRetry}
              className='gap-2 min-w-[120px]'
              disabled={retryCount >= 3}
            >
              <RefreshCw className='w-4 h-4' />
              {retryCount >= 3 ? 'Попытки исчерпаны' : 'Попробовать снова'}
            </Button>

            {level === 'page' && (
              <Button
                variant='outline'
                onClick={() => (window.location.href = '/dashboard')}
                className='gap-2'
              >
                <Home className='w-4 h-4' />
                На главную
              </Button>
            )}

            <Button
              variant='outline'
              onClick={() => window.location.reload()}
              className='gap-2'
            >
              <RefreshCw className='w-4 h-4' />
              Обновить страницу
            </Button>
          </div>

          {/* Retry Counter */}
          {retryCount > 0 && (
            <div className='flex items-center justify-center gap-2'>
              <Badge variant='outline' className='text-xs'>
                Попытка {retryCount}/3
              </Badge>
            </div>
          )}

          {/* Error Details (Development/Debug) */}
          {(process.env.NODE_ENV === 'development' || showDetails) && error && (
            <div className='text-left space-y-3'>
              <Button
                variant='ghost'
                size='sm'
                onClick={this.toggleDetails}
                className='gap-2 text-muted-foreground hover:text-foreground'
              >
                <Bug className='w-4 h-4' />
                Детали ошибки
                {showDetails ? (
                  <ChevronUp className='w-4 h-4' />
                ) : (
                  <ChevronDown className='w-4 h-4' />
                )}
              </Button>

              {showDetails && (
                <Alert className='text-left'>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertDescription className='space-y-3'>
                    <div>
                      <p className='font-medium text-sm'>
                        Сообщение об ошибке:
                      </p>
                      <code className='text-xs bg-muted p-2 rounded block mt-1 whitespace-pre-wrap'>
                        {error.message}
                      </code>
                    </div>

                    {error.stack && (
                      <div>
                        <p className='font-medium text-sm'>Stack trace:</p>
                        <code className='text-xs bg-muted p-2 rounded block mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto'>
                          {error.stack}
                        </code>
                      </div>
                    )}

                    {errorInfo?.componentStack && (
                      <div>
                        <p className='font-medium text-sm'>Component stack:</p>
                        <code className='text-xs bg-muted p-2 rounded block mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto'>
                          {errorInfo.componentStack}
                        </code>
                      </div>
                    )}

                    <div className='flex gap-2 pt-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={this.handleCopyError}
                        className='gap-2 text-xs'
                      >
                        <Copy className='w-3 h-3' />
                        Копировать
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          const bugReportUrl = `https://github.com/your-repo/issues/new?title=${encodeURIComponent(`Error: ${error.message}`)}&body=${encodeURIComponent(`Error Details:\n${error.stack}`)}`;
                          window.open(bugReportUrl, '_blank');
                        }}
                        className='gap-2 text-xs'
                      >
                        <ExternalLink className='w-3 h-3' />
                        Сообщить об ошибке
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className='text-xs text-muted-foreground space-y-1'>
            <p>
              Если проблема повторяется, обратитесь к администратору системы.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className='text-amber-600'>
                Режим разработки: проверьте консоль браузера для дополнительной
                информации.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);

    // Log error
    console.error('Error captured by useErrorHandler:', error);

    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Async error boundary for handling promises
 */
export function useAsyncError() {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}
