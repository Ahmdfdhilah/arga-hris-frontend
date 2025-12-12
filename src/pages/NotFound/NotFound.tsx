import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold text-foreground">
            Halaman Tidak Ditemukan
          </h2>
        </div>

        <p className="text-muted-foreground">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Halaman mungkin
          telah dipindahkan atau dihapus.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <Button onClick={() => navigate('/dashboard')} className="gap-2">
            <Home className="h-4 w-4" />
            Ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
