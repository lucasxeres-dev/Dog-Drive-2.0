import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Minus, CreditCard, ShoppingBag } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
// import { authService } from '../services/authService'; // Enabled for backend integration later

interface CartItem {
    id: string; // cart_item_id
    product_id: string;
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    brand: string;
}

const CartView: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock data load - in real implementation, fetch from 'cart_items' joining 'products'
    useEffect(() => {
        setItems([
            { id: '1', product_id: 'p1', name: 'Ração Royal Canin', brand: 'Royal Canin', price: 189.90, quantity: 1, image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=300&auto=format&fit=crop' },
            { id: '2', product_id: 'p2', name: 'Osso Kong', brand: 'Kong', price: 45.50, quantity: 2, image_url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=300&auto=format&fit=crop' }
        ]);
    }, []);

    const updateQuantity = (id: string, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
        showNotification('Item removido', 'info');
    };

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark h-screen overflow-hidden">
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="size-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight">Carrinho</h1>
                <div className="size-10" /> {/* Spacer */}
            </div>

            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                        <ShoppingBag size={48} className="mb-4 text-slate-400" />
                        <p className="text-sm font-bold uppercase">Seu carrinho está vazio</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                                <div className="h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-black text-sm line-clamp-1">{item.name}</h3>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">{item.brand}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="font-black text-primary">R$ {item.price.toFixed(2)}</p>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="size-6 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold active:scale-90 transition-transform"><Minus size={12} /></button>
                                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="size-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold active:scale-90 transition-transform"><Plus size={12} /></button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="self-start p-2 text-red-500 bg-red-500/10 rounded-xl"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Checkout Footer */}
            {items.length > 0 && (
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/5 pb-10">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm font-bold opacity-60">
                            <span>Subtotal</span>
                            <span>R$ {total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold opacity-60">
                            <span>Entrega</span>
                            <span>R$ 15,00</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-black">
                            <span>Total</span>
                            <span className="text-primary">R$ {(total + 15).toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full h-14 bg-[#050705] dark:bg-white text-white dark:text-[#050705] rounded-[2rem] flex items-center justify-between px-6 font-black uppercase tracking-wider active:scale-[0.98] transition-all shadow-xl"
                    >
                        <span>Confirmar Pedido</span>
                        <div className="size-8 bg-white/20 rounded-full flex items-center justify-center">
                            <CreditCard size={16} />
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartView;
