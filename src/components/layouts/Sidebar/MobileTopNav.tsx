// import { Link } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { CurrentUser } from '@/stores/authStore';

interface MobileTopNavProps {
  userData: CurrentUser;
  getUserInitials: () => string;
  getUserFullName: () => string;
  handleLogout: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const MobileTopNav: React.FC<MobileTopNavProps> = ({
  userData,
  getUserInitials,
  getUserFullName,
  handleLogout,
  setIsSidebarOpen,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-popover border-b border-sidebar-border">
      <div className="flex items-center justify-between px-6 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 w-10 p-0 rounded-full hover:bg-sidebar-accent"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-sm font-medium bg-sidebar-primary text-sidebar-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{getUserFullName()}</p>
              <p
                className="text-xs text-muted-foreground truncate"
                title={userData.email || undefined}
              >
                {userData.email}
              </p>
            </div>

            {/* <Separator className="my-1" />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem> */}

            <Separator className="my-1" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default MobileTopNav;
