import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useIIoTSimulator } from './useIIoTSimulator';

export const useSetupStore = create(
    persist(
        (set, get) => ({
            availableProducts: [],
            selectedProduct: null,
            currentStepIndex: 0,
            isFinished: false,
            loading: false,
            error: null,

            fetchProducts: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await fetch('http://localhost:3001/api/fabrico');
                    if (!response.ok) throw new Error('Falha ao carregar produtos');
                    const data = await response.json();
                    
                    // Map the backend structure (Fabrico -> Secao -> Passo) 
                    // to the expected frontend structure for the MVP
                    const mappedProducts = data.map(fab => {
                        // Flatten all steps from all sections into a single array for the viewer
                        let allSteps = [];
                        fab.secoes.forEach(sec => {
                            allSteps = [...allSteps, ...sec.passos.map(p => ({
                                ...p,
                                sectionName: sec.nome
                            }))];
                        });

                        return {
                            id: fab.id,
                            name: fab.nome,
                            description: `${allSteps.length} Passos Totais`,
                            imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80',
                            steps: allSteps
                        };
                    });

                    set({ availableProducts: mappedProducts, loading: false });
                } catch (error) {
                    set({ error: error.message, loading: false });
                }
            },

            selectProduct: (productId) => {
                const state = get();
                const product = state.availableProducts.find(p => p.id === productId);
                if (!product) return;

                set({
                    selectedProduct: product,
                    currentStepIndex: 0,
                    isFinished: false
                });
                
                // Stop machine speed when setup begins
                useIIoTSimulator.getState().startSetup();
            },

            clearSelection: () => {
                set({
                    selectedProduct: null,
                    currentStepIndex: 0,
                    isFinished: false
                });
                // Resume machine normally
                useIIoTSimulator.getState().endSetup();
            },

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
