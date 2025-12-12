import LogoLightMode from '@/assets/logo/logo_abi_lightmode.png';
import LogoDarkMode from '@/assets/logo/logo_abi_darkmode.png';
import MiniLogoLightMode from '@/assets/logo/logo-lightmode-kecil.png';
import MiniLogoDarkMode from '@/assets/logo/logo-darkmode-kecil.png';

interface SidebarLogoProps {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  isMobile: boolean;
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({
  isDarkMode,
  isSidebarOpen,
  isMobile,
}) => {
  return (
    <div className="flex h-16 items-center px-4">
      <div className="items-center border-b py-2 w-full gap-2">
        {!isSidebarOpen && (
          <img
            src={isDarkMode ? MiniLogoDarkMode : MiniLogoLightMode}
            alt="Company Logo"
            className="h-8"
          />
        )}

        {(isSidebarOpen || isMobile) && (
          <img
            src={isDarkMode ? LogoDarkMode : LogoLightMode}
            alt="Company Logo"
            className="h-[40px]"
          />
        )}
      </div>
    </div>
  );
};

export default SidebarLogo;
