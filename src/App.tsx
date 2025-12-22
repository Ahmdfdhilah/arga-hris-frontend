import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from '@/routes/AppRoutes';
import AuthProvider from '@/providers/auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { queryClient } from './providers/tanstack';
import { Toaster } from 'sonner';


const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
