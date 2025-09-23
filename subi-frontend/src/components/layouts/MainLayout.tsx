import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/common/Sidebar';
import { Header } from '@/components/common/Header';
import { useAppSelector } from '@/hooks/redux';

// Auth listener for custom events from API client
const AuthEventListener: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleAuthError = () => {
      // Instead of forcing a full page reload, navigate using React Router
      navigate('/auth/login');
    };

    const handleTokenRefresh = (event: CustomEvent) => {
      // Token was refreshed successfully - could dispatch to update store if needed
      console.log('Token refreshed:', event.detail);
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
      {/* Auth event listener */}
      <AuthEventListener />

      {/* Sidebar */}
      <Sidebar />

      {/* Content wrapper - positions header and main content together */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-16'
        }`}
      >
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className='pt-4 pb-6 px-6 bg-muted min-h-screen'>
          <div className='w-full'>
            <Outlet key={location.pathname} />
          </div>
        </main>
      </div>
    </div>
  );
};
