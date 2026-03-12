import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            isAuthenticated: false,
            operatorId: null,

            login: (pin) => {
                // Hardcoded PIN for MVP: 1234 or 4321
                if (pin === '1234' || pin === '4321') {
                    set({ isAuthenticated: true, operatorId: `OP-${pin}` });
                    return true;
                }
                return false;
            },

            logout: () => {
                set({ isAuthenticated: false, operatorId: null });
            }
        }),
        {
            name: 'setupmaster-auth-storage',
        }
    )
);
