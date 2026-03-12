import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import setupData from '../data/setup_mock.json';

export const useSetupStore = create(
    persist(
        (set, get) => ({
            availableProducts: setupData,
            selectedProduct: null,
            currentStepIndex: 0,
            isFinished: false,

            selectProduct: (productId) => {
                const product = setupData.find(p => p.id === productId);
                if (!product) return;

                set({
                    selectedProduct: product,
                    currentStepIndex: 0,
                    isFinished: false
                });
            },

            clearSelection: () => set({
                selectedProduct: null,
                currentStepIndex: 0,
                isFinished: false
            }),

            nextStep: () => {
                const { selectedProduct, currentStepIndex } = get();
                if (!selectedProduct) return;

                if (currentStepIndex < selectedProduct.steps.length - 1) {
                    set({ currentStepIndex: currentStepIndex + 1 });
                } else {
                    set({ isFinished: true });
                }
            },

            reset: () => set({ currentStepIndex: 0, isFinished: false })
        }),
        {
            name: 'setupmaster-storage', // unique name for localStorage key
            storage: createJSONStorage(() => localStorage),
            // Only persist specific fields (optional, but good practice)
            partialize: (state) => ({
                selectedProduct: state.selectedProduct,
                currentStepIndex: state.currentStepIndex,
                isFinished: state.isFinished
            }),
        }
    )
);
