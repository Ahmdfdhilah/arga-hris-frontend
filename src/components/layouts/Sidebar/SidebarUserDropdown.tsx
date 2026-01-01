import { LogOut, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { CurrentUser } from '@/stores/authStore';

interface SidebarUserDropdownProps {
  userData: CurrentUser;
  getUserInitials: () => string;
  getUserFullName: () => string;
  getTruncatedEmail: (email: string, maxLength?: number) => string;
  handleLogout: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
}

const SidebarUserDropdown: React.FC<SidebarUserDropdownProps> = ({
  userData,
  getUserInitials,
  getUserFullName,
  getTruncatedEmail,
  handleLogout,
  isSidebarOpen,
  isMobile,
}) => {
  return (
    <div
      className={cn(
        'mt-auto',
        isSidebarOpen || isMobile ? 'p-4' : 'py-4 px-1'
      )}
    >
      {isSidebarOpen || isMobile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full h-12 px-3 hover:bg-popover rounded-md"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData.avatar_url || undefined} alt={getUserFullName()} />
                  <AvatarFallback className="text-sm font-medium bg-primary text-secondary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium text-primary">{getUserFullName()}</span>
                  <span
                    className="text-xs text-muted-foreground"
                    title={userData.email || undefined}
                  >
                    {getTruncatedEmail(userData.email || '')}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-primary">{getUserFullName()}</p>
              <p
                className="text-xs text-muted-foreground truncate"
                title={userData.email || undefined}
              >
                {userData.email}
              </p>
            </div>

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
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-center p-0 w-10 h-10 mx-auto rounded-full hover:bg-muted relative"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData.avatar_url || undefined} alt={getUserFullName()} />
                <AvatarFallback className="text-sm font-medium bg-primary text-secondary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{getUserFullName()}</p>
              <p
                className="text-xs text-muted-foreground truncate"
                title={userData.email || undefined}
              >
                {userData.email}
              </p>
            </div>

            <Separator className="my-1" />
            {/* <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem> */}

            {/* <Separator className="my-1" /> */}

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default SidebarUserDropdown;
