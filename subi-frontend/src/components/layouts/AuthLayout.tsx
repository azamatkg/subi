import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ErrorFallback } from '@/components/ui/error-fallback';

// Auth listener for custom events from API client
const AuthEventListener: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleAuthError = () => {
      // Already on auth page, but we still need to clear state
      
    };

    const handleTokenRefresh = (_event: CustomEvent) => {
      // Token was refreshed successfully - could dispatch to update store if needed

    };

    window.addEventListener('auth-error', handleAuthError);
    window.addEventListener(
      'token-refreshed',
      handleTokenRefresh as EventListener
    );

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
      window.removeEventListener(
        'token-refreshed',
        handleTokenRefresh as EventListener
      );
    };
  }, [navigate]);

  return null;
};

export const AuthLayout: React.FC = () => {
  return (
    <div className='min-h-screen bg-background'>
      {/* Auth event listener with error boundary */}
      <ErrorBoundary
        level='component'
        title='Ошибка системы аутентификации'
        description='Произошла ошибка в обработке аутентификации.'
        fallback={<div className='hidden' />} // Hidden fallback for auth listener
      >
        <AuthEventListener />
      </ErrorBoundary>

      {/* Auth form outlet with error boundary */}
      <ErrorBoundary
        level='section'
        title='Ошибка формы входа'
        description='Форма входа в систему временно недоступна.'
        fallback={
          <div className='min-h-screen flex items-center justify-center p-4'>
            <ErrorFallback
              type='generic'
              size='lg'
              title='Ошибка системы входа'
              description='Форма входа временно недоступна. Попробуйте обновить страницу.'
              showRetry
              showHome={false}
            />
          </div>
        }
      >
        <Outlet />
      </ErrorBoundary>
    </div>
  );
};
