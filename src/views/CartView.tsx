import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useNotification } from '../contexts/NotificationContext';

const CartView: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const cartStore = useCartStore();
    const items = cartStore.items;

    const total = cartStore.getTotal();
    const shipping = total > 50 ? 0 : 5.90; // Free shipping over €50
    const finalTotal = total + shipping;

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden animate-fade-in font-sans">
            {/* Header */}
            <div className="px-6 py-6 pt-12 flex items-center justify-between bg-white shadow-sm z-10 sticky top-0">
                <button
                    onClick={() => navigate(-1)}
                    className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all outline-none"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-black uppercase tracking-tight text-slate-900">Seu Carrinho</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cartStore.getItemCount()} itens</p>
                </div>
                <div className="size-10" />
            </div>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-60">
                        <div className="size-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                            <ShoppingBag size={48} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Carrinho Vazio</h3>
                        <p className="text-sm font-bold text-slate-400 max-w-[200px] mb-8">Parece que você ainda não escolheu nada para o seu pet.</p>
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="bg-[#22eb7e] text-[#102217] px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#22eb7e]/30 active:scale-95 transition-all"
                        >
                            Ir para Loja
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden">
                                <div className="h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50">
                                    <img
                                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200'}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start gap-2 pr-8">
                                            <h3 className="font-black text-sm text-slate-900 line-clamp-2 leading-tight">{item.product.name}</h3>
                                        </div>
                                        <p className="text-[10px] items-center gap-1 font-bold text-slate-400 uppercase tracking-wide mt-1">
                                            {item.product.brand || 'Premium'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="font-black text-lg text-[#102217]">€{(item.product.sale_price || item.product.base_price).toFixed(2)}</p>

                                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 px-2 border border-slate-100">
                                            <button
                                                onClick={() => cartStore.updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="size-6 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-all"
                                            >
                                                <Minus size={12} strokeWidth={3} />
                                            </button>
                                            <span className="text-xs font-black">{item.quantity}</span>
                                            <button
                                                onClick={() => cartStore.updateQuantity(item.id, item.quantity + 1)}
                                                className="size-6 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-all"
                                            >
                                                <Plus size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        cartStore.removeItem(item.id);
                                        showNotification('Item removido', 'info');
                                    }}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors p-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Checkout Footer */}
            {items.length > 0 && (
                <div className="p-6 bg-white border-t border-slate-100 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                            <span>Subtotal</span>
                            <span>€{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                            <span>Entrega</span>
                            <span className={shipping === 0 ? 'text-[#22eb7e]' : ''}>
                                {shipping === 0 ? 'GRÁTIS' : `€${shipping.toFixed(2)}`}
                            </span>
                        </div>
                        <div className="h-px bg-slate-100 my-2" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-slate-900 uppercase">Total</span>
                            <span className="text-2xl font-black text-[#102217]">€{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full h-14 bg-[#102217] text-[#22eb7e] rounded-2xl flex items-center justify-between px-6 font-black uppercase tracking-widest active:scale-[0.98] transition-all shadow-xl shadow-[#102217]/20 group hover:bg-[#22eb7e] hover:text-[#102217]"
                    >
                        <span>Confirmar Pedido</span>
                        <div className="size-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-[#102217]/10 transition-colors">
                            <ArrowRight size={16} />
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartView;
