import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/common/Sidebar';
import { Header } from '@/components/common/Header';
import { useAppSelector } from '@/hooks/redux';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ErrorFallback } from '@/components/ui/error-fallback';

// Auth listener for custom events from API client
const AuthEventListener: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleAuthError = () => {
      // Instead of forcing a full page reload, navigate using React Router
      navigate('/auth/login');
    };

    const handleTokenRefresh = (_event: CustomEvent) => {
      // Token was refreshed successfully - could dispatch to update store if needed
      // Token refreshed - logging removed for production
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

export const MainLayout: React.FC = () => {
  const sidebarOpen = useAppSelector(state => state.ui.sidebarOpen);
  const location = useLocation();

  return (
    <div className='min-h-screen bg-background'>
      {/* Auth event listener with error boundary */}
      <ErrorBoundary
        level='component'
        title='Ошибка аутентификации'
        description='Произошла ошибка в системе аутентификации.'
        fallback={<div className='hidden' />} // Hidden fallback for auth listener
      >
        <AuthEventListener />
      </ErrorBoundary>

      {/* Sidebar with error boundary */}
      <ErrorBoundary
        level='component'
        title='Ошибка навигации'
        description='Боковое меню временно недоступно.'
        fallback={
          <ErrorFallback
            type='generic'
            size='sm'
            title='Ошибка навигации'
            description='Боковое меню временно недоступно.'
            showRetry
          />
        }
      >
        <Sidebar />
      </ErrorBoundary>

      {/* Content wrapper - positions header and main content together */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-16'
        }`}
      >
        {/* Header with error boundary */}
        <ErrorBoundary
          level='component'
          title='Ошибка заголовка'
          description='Заголовок страницы временно недоступен.'
          fallback={
            <div className='h-16 bg-background border-b flex items-center justify-center'>
              <ErrorFallback
                type='generic'
                size='sm'
                title='Ошибка заголовка'
                description='Заголовок временно недоступен.'
                showRetry
                className='max-w-sm'
              />
            </div>
          }
        >
          <Header />
        </ErrorBoundary>

        {/* Main content with error boundary */}
        <main className='pt-4 pb-6 px-4 bg-muted min-h-screen'>
          <div className='w-full'>
            <ErrorBoundary
              level='section'
              title='Ошибка загрузки страницы'
              description='Содержимое страницы не может быть отображено.'
            >
              <Outlet key={location.pathname} />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};
