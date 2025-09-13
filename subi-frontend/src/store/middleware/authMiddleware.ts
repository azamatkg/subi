import { createListenerMiddleware } from '@reduxjs/toolkit';
import { logoutAsync } from '../slices/authSlice';

// Extend window interface for custom properties
declare global {
  interface Window {
    authEventListenersAdded?: boolean;
  }
}

// Create the middleware
export const authListenerMiddleware = createListenerMiddleware();

// Listen for token refresh events from API client
authListenerMiddleware.startListening({
  predicate: () => true,
  effect: async (action, listenerApi) => {
    // Listen for custom events dispatched by API client
    if (typeof window !== 'undefined') {
      // Handle token refresh events
      const handleTokenRefresh = () => {
        // The tokens are already stored by the API client
        // Redux state will be updated by the next API call
        // Token refreshed successfully
      };

      // Handle auth errors
      const handleAuthError = () => {
        listenerApi.dispatch(logoutAsync());
      };

      // Add event listeners only once
      if (!window.authEventListenersAdded) {
        window.addEventListener(
          'token-refreshed',
          handleTokenRefresh as EventListener
        );
        window.addEventListener('auth-error', handleAuthError);
        window.authEventListenersAdded = true;
      }
    }
  },
});

// Export the middleware
export default authListenerMiddleware.middleware;
