import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { store } from '@/store';
import { router } from '@/router';
import { useAppSelector } from '@/hooks/redux';
import '@/i18n';

// Theme provider component
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useAppSelector((state) => state.ui.theme);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
};

// Auth listener for custom events from API client
const AuthEventListener: React.FC = () => {
  React.useEffect(() => {
    const handleAuthError = () => {
      // Force logout - auth slice will handle this
      window.location.href = '/auth/login';
    };

    const handleTokenRefresh = (event: CustomEvent) => {
      // Token was refreshed successfully - could dispatch to update store if needed
      console.log('Token refreshed:', event.detail);
    };

    window.addEventListener('auth-error', handleAuthError);
    window.addEventListener('token-refreshed', handleTokenRefresh as EventListener);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
      window.removeEventListener('token-refreshed', handleTokenRefresh as EventListener);
    };
  }, []);

  return null;
};

// Main app content
const AppContent: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background font-sans antialiased">
        <AuthEventListener />
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </div>
    </ThemeProvider>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;