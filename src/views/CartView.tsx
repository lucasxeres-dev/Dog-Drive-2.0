import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

interface CartItem {
    id: string; // cart_item id
    product_id: string;
    quantity: number;
    product: {
        name: string;
        brand: string;
        price: number;
        image_url: string;
    };
}

const CartView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchCartItems();
        }
    }, [user]);

    const fetchCartItems = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await (authService as any).supabase
                .from('cart_items')
                .select(`
                    id,
                    product_id,
                    quantity,
                    product:products (
                        name,
                        brand,
                        price,
                        image_url
                    )
                `)
                .eq('user_id', user.id);

            if (error) throw error;
            if (data) {
                setItems(data as any);
            }
        } catch (err: any) {
            showNotification(err.message || 'Erro ao carregar carrinho', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (id: string, delta: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const newQty = Math.max(1, item.quantity + delta);
        try {
            const { error } = await (authService as any).supabase
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('id', id);

            if (error) throw error;
            setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
        } catch (err: any) {
            showNotification(err.message || 'Erro ao atualizar quantidade', 'error');
        }
    };

    const removeItem = async (id: string) => {
        try {
            const { error } = await (authService as any).supabase
                .from('cart_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setItems(prev => prev.filter(i => i.id !== id));
            showNotification('Item removido do carrinho', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Erro ao remover item', 'error');
        }
    };

    const total = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display h-screen overflow-hidden text-gray-900 dark:text-white">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-4 border-b border-gray-100 dark:border-white/5 flex items-center">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full border border-gray-100 dark:border-white/5 flex items-center justify-center mr-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight">Shopping Cart</h1>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">shopping_cart_off</span>
                        <p className="font-bold uppercase tracking-widest text-xs">Your cart is empty</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="card !p-3 flex gap-4 animate-slideUp">
                            <div className="size-20 rounded-2xl overflow-hidden shrink-0">
                                <img src={item.product.image_url} className="w-full h-full object-cover" alt={item.product.name} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-sm truncate">{item.product.name}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{item.product.brand}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-primary font-black italic">R$ {item.product.price}</span>
                                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/5 rounded-full px-2 py-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="size-6 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 active:scale-90 transition-all">
                                            <span className="material-symbols-outlined text-lg">remove</span>
                                        </button>
                                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="size-6 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 active:scale-90 transition-all">
                                            <span className="material-symbols-outlined text-lg">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors self-start p-1">
                                <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                        </div>
                    ))
                )}
            </main>

            <div className="bg-white dark:bg-surface-dark p-6 border-t border-gray-100 dark:border-white/5 rounded-t-[3rem] shadow-2xl space-y-4">
                <div className="flex justify-between items-center text-gray-500 text-xs font-black uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-black uppercase tracking-tight">Total</span>
                    <span className="text-3xl font-black text-primary italic">R$ {total.toFixed(2)}</span>
                </div>
                <button
                    disabled={items.length === 0}
                    onClick={() => navigate('/wallet')}
                    className="btn-primary w-full disabled:opacity-50 disabled:grayscale"
                >
                    Checkout with Wallet
                </button>
            </div>
        </div>
    );
};

export default CartView;
