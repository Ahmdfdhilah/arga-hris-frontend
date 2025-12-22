import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MenuItem } from '@/lib/menus';
import { canAccessMenu } from '@/services/users/utils';
import type { CurrentUser } from '@/stores/authStore';

interface SidebarMenuProps {
  accessibleMenus: MenuItem[];
  expandedMenus: string[];
  toggleAccordion: (path: string) => void;
  isMenuActive: (menu: MenuItem) => boolean;
  isSubmenuActive: (path: string) => boolean;
  handleNavigate: (path: string) => void;
  handleMenuClick: (menu: MenuItem) => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
  userData: CurrentUser;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  accessibleMenus,
  expandedMenus,
  toggleAccordion,
  isMenuActive,
  isSubmenuActive,
  handleNavigate,
  handleMenuClick,
  isSidebarOpen,
  isMobile,
  userData,
}) => {
  const isExternalUrl = (path: string) => {
    return path.startsWith('http://') || path.startsWith('https://');
  };

  return (
    <ScrollArea
      className={cn(
        'flex-1 py-4 overflow-y-auto',
        isSidebarOpen || isMobile ? 'px-2' : 'px-1'
      )}
    >
      <nav className="flex flex-col gap-1">
        {accessibleMenus.map((menu, index) =>
          menu.subMenus && (isSidebarOpen || isMobile) ? (
            <Accordion
              key={index}
              type="multiple"
              value={expandedMenus}
              onValueChange={(value) => {
                if (
                  value.includes(menu.path) &&
                  !expandedMenus.includes(menu.path)
                ) {
                  toggleAccordion(menu.path);
                } else if (
                  !value.includes(menu.path) &&
                  expandedMenus.includes(menu.path)
                ) {
                  toggleAccordion(menu.path);
                }
              }}
              className="border-none"
            >
              <AccordionItem value={menu.path} className="border-none">
                <AccordionTrigger
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm rounded-md',
                    isMenuActive(menu)
                      ? 'bg-primary text-secondary font-medium'
                      : 'hover:bg-primary hover:text-secondary',
                    'no-underline hover:no-underline'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {menu.icon && <menu.icon className="h-4 w-4" />}
                    <span>{menu.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-1 mt-1 ml-6">
                    {menu.subMenus
                      .filter((submenu) =>
                        canAccessMenu(
                          userData,
                          submenu.permissions,
                          submenu.requireAll,
                          submenu.roles,
                          submenu.requireAllRoles
                        )
                      )
                      .map((submenu, subIndex) =>
                        isExternalUrl(submenu.path) ? (
                          <a
                            key={subIndex}
                            href={submenu.path}
                            className={cn(
                              'flex items-center justify-start h-8 px-3 py-2 text-xs font-normal hover:text-secondary rounded-md transition-colors',
                              isSubmenuActive(submenu.path)
                                ? 'bg-primary hover:bg-primary text-secondary font-medium'
                                : 'hover:bg-primary'
                            )}
                          >
                            {submenu.title}
                          </a>
                        ) : (
                          <Link
                            key={subIndex}
                            to={submenu.path}
                            className={cn(
                              'flex items-center justify-start h-8 px-3 py-2 text-xs font-normal hover:text-secondary rounded-md transition-colors',
                              isSubmenuActive(submenu.path)
                                ? 'bg-primary hover:bg-primary text-secondary font-medium'
                                : 'hover:bg-primary'
                            )}
                            onClick={(e) => {
                              if (!e.ctrlKey && !e.metaKey) {
                                handleNavigate(submenu.path);
                                e.preventDefault();
                              }
                            }}
                          >
                            {submenu.title}
                          </Link>
                        )
                      )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : menu.subMenus && !isSidebarOpen && !isMobile ? (
            <div
              key={index}
              className={cn(
                'flex items-center justify-center w-10 h-10 mx-auto rounded-md mb-1 hover:text-secondary cursor-pointer transition-colors',
                isMenuActive(menu)
                  ? 'bg-primary hover:bg-primary text-secondary font-medium'
                  : 'hover:bg-primary'
              )}
              onClick={() => handleMenuClick(menu)}
              title={menu.title}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleMenuClick(menu);
                }
              }}
            >
              {menu.icon && <menu.icon className="h-4 w-4" />}
            </div>
          ) : isExternalUrl(menu.path) ? (
            <a
              key={index}
              href={menu.path}
              className={cn(
                'flex items-center rounded-md h-10 w-full hover:text-secondary transition-colors',
                isMenuActive(menu)
                  ? 'bg-primary hover:bg-primary text-secondary font-medium'
                  : 'hover:bg-primary',
                isSidebarOpen || isMobile
                  ? 'justify-start gap-2 px-3 py-2 text-sm'
                  : 'justify-center w-10 mx-auto'
              )}
              title={menu.title}
            >
              {menu.icon && <menu.icon className="h-4 w-4" />}
              {(isSidebarOpen || isMobile) && <span>{menu.title}</span>}
            </a>
          ) : (
            <Link
              key={index}
              to={menu.path}
              className={cn(
                'flex items-center rounded-md h-10 w-full hover:text-secondary transition-colors',
                isMenuActive(menu)
                  ? 'bg-primary hover:bg-primary text-secondary font-medium'
                  : 'hover:bg-primary',
                isSidebarOpen || isMobile
                  ? 'justify-start gap-2 px-3 py-2 text-sm'
                  : 'justify-center w-10 mx-auto'
              )}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey) {
                  handleNavigate(menu.path);
                  e.preventDefault();
                }
              }}
              title={menu.title}
            >
              {menu.icon && <menu.icon className="h-4 w-4" />}
              {(isSidebarOpen || isMobile) && <span>{menu.title}</span>}
            </Link>
          )
        )}
      </nav>
    </ScrollArea>
  );
};

export default SidebarMenu;
