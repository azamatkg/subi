import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { store } from '@/store';
import { router } from '@/router';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { PageTitleProvider } from '@/contexts/PageTitleProvider';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { PageErrorFallback } from '@/components/ui/error-fallback';
import '@/i18n';

// Global error handler for the entire application
const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
  // Log error for debugging
  console.error('Global error caught by App-level ErrorBoundary:', error, errorInfo);

  // Report to error monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }
};

// Handle unhandled promise rejections
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(new Error(event.reason));
  }
};

// Main app content
const AppContent: React.FC = () => {
  // Set up global error handlers
  React.useEffect(() => {
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorProvider>
      <ThemeProvider>
        <PageTitleProvider>
          <div className='min-h-screen bg-background font-sans antialiased'>
            <RouterProvider router={router} />
            <Toaster richColors position='top-right' />
          </div>
        </PageTitleProvider>
      </ThemeProvider>
    </ErrorProvider>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ErrorBoundary
      level='page'
      onError={handleGlobalError}
      title='Приложение временно недоступно'
      description='Произошла критическая ошибка в приложении. Попробуйте обновить страницу или обратитесь к администратору.'
      fallback={<PageErrorFallback />}
    >
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
