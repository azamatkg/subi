import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

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
      {/* Auth event listener */}
      <AuthEventListener />

      {/* Auth form outlet - takes full width for custom layouts */}
      <Outlet />
    </div>
  );
};
