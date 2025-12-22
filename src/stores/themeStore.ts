import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeState {
    isDarkMode: boolean;
}

interface ThemeActions {
    toggleTheme: () => void;
    setTheme: (isDarkMode: boolean) => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
    persist(
        (set) => ({
            isDarkMode: false,

            toggleTheme: () => {
                set((state) => ({ isDarkMode: !state.isDarkMode }));
            },

            setTheme: (isDarkMode) => {
                set({ isDarkMode });
            },
        }),
        {
            name: 'arga-hris-theme',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
