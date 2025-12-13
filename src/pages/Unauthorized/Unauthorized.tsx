import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-6">
              <ShieldAlert className="h-16 w-16 text-destructive" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-destructive">403</h1>
          <h2 className="text-3xl font-semibold text-foreground">
            Akses Ditolak
          </h2>
        </div>

        <p className="text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi
          administrator jika Anda yakin ini adalah kesalahan.
        </p>

        <Button onClick={() => navigate('/dashboard')} className="gap-2">
          <Home className="h-4 w-4" />
          Kembali ke Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
