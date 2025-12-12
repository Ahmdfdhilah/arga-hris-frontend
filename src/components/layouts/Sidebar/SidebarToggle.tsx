import { ChevronLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@workspace/ui/lib/utils';

interface SidebarToggleProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute -right-3 top-20 bg-background border rounded-full shadow-md h-6 w-6 flex items-center justify-center p-0"
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      <ChevronLeft
        className={cn(
          'h-4 w-4 transition-transform duration-300',
          !isSidebarOpen && 'rotate-180'
        )}
      />
    </Button>
  );
};

export default SidebarToggle;
