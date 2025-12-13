import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import {  QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from '@/redux/store';
import AppRoutes from '@/routes/AppRoutes';
import AuthProvider from '@/providers/auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { queryClient } from './providers/tanstack';
import { Toaster } from 'sonner';


const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
              <AuthProvider>
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </AuthProvider>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
          </PersistGate>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
