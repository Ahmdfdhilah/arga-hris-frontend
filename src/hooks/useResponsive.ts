import { useState, useEffect } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Custom hook for responsive breakpoints
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: >= 1024px
 */
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia(
      '(min-width: 768px) and (max-width: 1023px)',
    );
    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const updateState = () => {
      setState({
        isMobile: mobileQuery.matches,
        isTablet: tabletQuery.matches,
        isDesktop: desktopQuery.matches,
      });
    };

    // Initial check
    updateState();

    // Add listeners
    mobileQuery.addEventListener('change', updateState);
    tabletQuery.addEventListener('change', updateState);
    desktopQuery.addEventListener('change', updateState);

    // Cleanup
    return () => {
      mobileQuery.removeEventListener('change', updateState);
      tabletQuery.removeEventListener('change', updateState);
      desktopQuery.removeEventListener('change', updateState);
    };
  }, []);

  return state;
};
