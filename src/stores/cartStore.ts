import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariant } from '../types/marketplace';

interface CartStore {
    items: CartItem[];
    addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, variant, quantity = 1) => {
                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (item) =>
                            item.product.id === product.id &&
                            item.variant?.id === variant?.id
                    );

                    if (existingIndex >= 0) {
                        // Update quantity if item exists
                        const newItems = [...state.items];
                        newItems[existingIndex].quantity += quantity;
                        return { items: newItems };
                    }

                    // Add new item
                    return {
                        items: [
                            ...state.items,
                            {
                                id: `${product.id}-${variant?.id || 'base'}-${Date.now()}`,
                                product,
                                variant,
                                quantity,
                            },
                        ],
                    };
                });
            },

            removeItem: (itemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== itemId),
                }));
            },

            updateQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotal: () => {
                return get().items.reduce((total, item) => {
                    const price = item.product.sale_price || item.product.base_price;
                    const variantPrice = item.variant?.price_modifier || 0;
                    return total + (price + variantPrice) * item.quantity;
                }, 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'dog-drive-cart',
        }
    )
);
