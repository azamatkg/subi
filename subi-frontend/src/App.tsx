import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { store } from '@/store';
import { router } from '@/router';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { LayoutProvider } from '@/providers/LayoutProvider';
import { PageTitleProvider } from '@/contexts/PageTitleProvider';
import '@/i18n';

// Main app content
const AppContent: React.FC = () => {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <PageTitleProvider>
          <div className='min-h-screen bg-background font-sans antialiased'>
            <RouterProvider router={router} />
            <Toaster richColors position='top-right' />
          </div>
        </PageTitleProvider>
      </LayoutProvider>
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
