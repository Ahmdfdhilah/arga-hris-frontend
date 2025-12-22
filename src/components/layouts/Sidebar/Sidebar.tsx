import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout, clearAuth } from '@/redux/features/authSlice';
import { persistor } from '@/redux/store';
import { SSO_DASHBOARD_URL } from '@/config';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MenuItem, hrisMenus } from '@/lib/menus';
import { canAccessMenu, getUserInitials, truncateEmail } from '@/services/users/utils';
import SidebarToggle from './SidebarToggle';
import SidebarContent from './SidebarContent';
import MobileTopNav from './MobileTopNav';

interface SidebarProps {
  isDarkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { userData, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const currentPath = location.pathname;
    const newExpandedMenus: string[] = [];

    hrisMenus.forEach((menu) => {
      if (menu.subMenus) {
        const hasActiveSubmenu = menu.subMenus.some(
          (submenu) =>
            currentPath === submenu.path ||
            currentPath.startsWith(submenu.path + '/')
        );
        if (hasActiveSubmenu) {
          newExpandedMenus.push(menu.path);
        }
      }
    });

    setExpandedMenus(newExpandedMenus);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      window.location.href = path;
    } else {
      navigate(path);
    }
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(clearAuth());
      persistor.purge();
      window.location.href = `${SSO_DASHBOARD_URL}/login?logout=true`;
    }
    return null;
  };

  const handleMenuClick = (menu: MenuItem) => {
    if (!isSidebarOpen && menu.subMenus) {
      setIsSidebarOpen(true);
      if (!expandedMenus.includes(menu.path)) {
        setExpandedMenus((prev) => [...prev, menu.path]);
      }
    } else {
      handleNavigate(menu.path);
    }
  };

  const accessibleMenus =
    hrisMenus?.filter((menu) =>
      canAccessMenu(userData, menu.permissions, menu.requireAll, menu.roles, menu.requireAllRoles)
    ) || [];

  const isMenuActive = (menu: MenuItem): boolean => {
    if (location.pathname === menu.path) return true;

    if (menu.subMenus) {
      return menu.subMenus.some(
        (subMenu) => location.pathname === subMenu.path
      );
    }

    return false;
  };

  const isSubmenuActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const toggleAccordion = (path: string) => {
    setExpandedMenus((prev) => {
      if (prev.includes(path)) {
        return prev.filter((item) => item !== path);
      } else {
        return [...prev, path];
      }
    });
  };

  const getUserFullName = () => {
    if (!userData) return '';
    return userData.name;
  };

  const getPrimaryRole = () => {
    if (userData?.roles && userData.roles.length > 0) {
      return userData.roles[0];
    }
    return 'User';
  };

  if (!isAuthenticated || !userData) {
    return null;
  }

  return (
    <>
      {isMobile && (
        <MobileTopNav
          userData={userData}
          getUserInitials={() => {
            const parts = (userData.name || '').split(' ');
            return getUserInitials(parts[0] || '', parts.slice(1).join(' ') || '');
          }}
          getUserFullName={getUserFullName}
          handleLogout={handleLogout}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}

      {isMobile && (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 sm:max-w-sm border-r">
            <SidebarContent
              accessibleMenus={accessibleMenus}
              expandedMenus={expandedMenus}
              toggleAccordion={toggleAccordion}
              isMenuActive={isMenuActive}
              isSubmenuActive={isSubmenuActive}
              handleMenuClick={handleMenuClick}
              handleNavigate={handleNavigate}
              handleLogout={handleLogout}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              isMobile={isMobile}
              isDarkMode={isDarkMode}
              userData={userData}
              getUserInitials={() => {
                const parts = (userData.name || '').split(' ');
                return getUserInitials(parts[0] || '', parts.slice(1).join(' ') || '');
              }}
              getUserFullName={getUserFullName}
              getPrimaryRole={getPrimaryRole}
              getTruncatedEmail={(email) => truncateEmail(email)}
            />
          </SheetContent>
        </Sheet>
      )}



      {!isMobile && (
        <aside
          className={cn(
            'fixed h-screen bg-background border-r transition-all duration-300 ease-in-out z-30',
            isSidebarOpen ? 'w-64 translate-x-0' : 'w-16 translate-x-0'
          )}
        >
          <SidebarContent
            accessibleMenus={accessibleMenus}
            expandedMenus={expandedMenus}
            toggleAccordion={toggleAccordion}
            isMenuActive={isMenuActive}
            isSubmenuActive={isSubmenuActive}
            handleNavigate={handleNavigate}
            handleMenuClick={handleMenuClick}
            handleLogout={handleLogout}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isMobile={isMobile}
            isDarkMode={isDarkMode}
            userData={userData}
            getUserInitials={() => {
              const parts = (userData.name || '').split(' ');
              return getUserInitials(parts[0] || '', parts.slice(1).join(' ') || '');
            }}
            getUserFullName={getUserFullName}
            getPrimaryRole={getPrimaryRole}
            getTruncatedEmail={(email) => truncateEmail(email)}
          />

          <SidebarToggle
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </aside>
      )}

      {!isMobile && (
        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            isSidebarOpen ? 'ml-64' : 'ml-16'
          )}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
