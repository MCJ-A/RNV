import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useHistoryStore = create(
    persist(
        (set, get) => ({
            historyLogs: [],

            /**
             * @param {Object} entry 
             * @param {string} entry.status 'COMPLETED' | 'CANCELLED'
             * @param {string} entry.productId
             * @param {string} entry.operatorId
             */
            addLog: (entry) => {
                const newLog = {
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    ...entry
                };

                set({
                    // Keep only the last 50 logs to prevent localStorage bloat
                    historyLogs: [newLog, ...get().historyLogs].slice(0, 50)
                });
            },

            clearHistory: () => {
                set({ historyLogs: [] });
            }
        }),
        {
            name: 'setupmaster-history-storage',
        }
    )
);
