import { ReactNode, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import Sidebar from './Sidebar/Sidebar';
import { useTheme } from '@/hooks/useTheme';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDarkMode, setDarkMode } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDarkMode={isDarkMode}
        setDarkMode={setDarkMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex flex-col flex-1 overflow-hidden md:ml-0 mt-4 lg:mt-0">
        <main
          className={cn(
            'flex-1 overflow-y-auto bg-background',
            'p-4 md:p-6 lg:p-8',
            'pt-16 md:pt-6 lg:pt-8',
            'transition-all duration-300'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
