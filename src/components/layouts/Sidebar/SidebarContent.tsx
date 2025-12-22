import { MenuItem } from '@/lib/menus';
import type { CurrentUser } from '@/stores/authStore';
import SidebarLogo from './SidebarLogo';
import SidebarMenu from './SidebarMenu';
import SidebarUserDropdown from './SidebarUserDropdown';

interface SidebarContentProps {
  accessibleMenus: MenuItem[];
  expandedMenus: string[];
  toggleAccordion: (path: string) => void;
  isMenuActive: (menu: MenuItem) => boolean;
  isSubmenuActive: (path: string) => boolean;
  handleNavigate: (path: string) => void;
  handleLogout: () => void;
  handleMenuClick: (menu: MenuItem) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isMobile: boolean;
  isDarkMode: boolean;
  userData: CurrentUser;
  getUserInitials: () => string;
  getUserFullName: () => string;
  getPrimaryRole: () => string;
  getTruncatedEmail: (email: string, maxLength?: number) => string;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  accessibleMenus,
  expandedMenus,
  toggleAccordion,
  isMenuActive,
  isSubmenuActive,
  handleNavigate,
  handleLogout,
  handleMenuClick,
  isSidebarOpen,
  isMobile,
  isDarkMode,
  userData,
  getUserInitials,
  getUserFullName,
  getTruncatedEmail,
}) => {
  return (
    <div className="flex h-screen flex-col">
      <SidebarLogo
        isDarkMode={isDarkMode}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />

      <SidebarMenu
        accessibleMenus={accessibleMenus}
        expandedMenus={expandedMenus}
        toggleAccordion={toggleAccordion}
        isMenuActive={isMenuActive}
        isSubmenuActive={isSubmenuActive}
        handleNavigate={handleNavigate}
        handleMenuClick={handleMenuClick}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        userData={userData}
      />

      <SidebarUserDropdown
        userData={userData}
        getUserInitials={getUserInitials}
        getUserFullName={getUserFullName}
        getTruncatedEmail={getTruncatedEmail}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
    </div>
  );
};

export default SidebarContent;
