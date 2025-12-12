import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary menangkap error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-6 max-w-md px-4">
            <div className="space-y-2">
              <div className="flex justify-center">
                <AlertTriangle className="h-24 w-24 text-primary" />
              </div>
              <h2 className="text-3xl font-semibold text-foreground">
                Ups! Terjadi Kesalahan
              </h2>
            </div>

            <p className="text-muted-foreground">
              Terjadi kesalahan yang tidak terduga. Silakan coba salah satu opsi di bawah ini untuk melanjutkan.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="rounded-md bg-muted p-3 text-sm text-left">
                <p className="font-medium text-destructive mb-2">Detail Kesalahan:</p>
                <p className="text-muted-foreground break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={this.handleRetry}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Coba Lagi
              </Button>
              <Button
                variant="outline"
                onClick={this.handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Muat Ulang
              </Button>
              <Button onClick={this.handleGoHome} className="gap-2">
                <Home className="h-4 w-4" />
                Ke Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
