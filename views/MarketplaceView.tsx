import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../LanguageContext';
import { supabase } from '../supabaseClient';

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    image_url: string;
    category: 'food' | 'toys';
    is_promo?: boolean;
}

const MarketplaceView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [filter, setFilter] = useState<'all' | 'food' | 'toys' | 'promo'>('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        fetchProducts();
        fetchCartCount();
        fetchFavorites();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (error) {
            console.error('Error fetching products:', error);
            // Fallback to minimal mock if error/no tables
            setProducts([
                { id: 'p1', name: 'Premium Adult Dog Food', brand: 'Pedigree', price: 45.00, image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=300&auto=format&fit=crop', category: 'food' },
                { id: 'p2', name: 'Durable Rubber Bone Toy', brand: 'Kong', price: 12.50, image_url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=300&auto=format&fit=crop', category: 'toys', is_promo: true }
            ]);
        } else if (data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const fetchCartCount = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { count, error } = await supabase
            .from('cart_items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (!error && count !== null) setCartCount(count);
    };

    const fetchFavorites = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('favorites')
            .select('product_id')
            .eq('user_id', user.id);

        if (!error && data) setFavorites(data.map(f => f.product_id));
    };

    const filteredProducts = useMemo(() => {
        if (filter === 'all') return products;
        if (filter === 'promo') return products.filter(p => !!p.is_promo);
        return products.filter(p => p.category === filter);
    }, [filter, products]);

    const toggleFavorite = async (productId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const isFav = favorites.includes(productId);
        if (isFav) {
            await supabase.from('favorites').delete().match({ user_id: user.id, product_id: productId });
            setFavorites(prev => prev.filter(id => id !== productId));
        } else {
            await supabase.from('favorites').insert({ user_id: user.id, product_id: productId });
            setFavorites(prev => [...prev, productId]);
        }
    };

    const addToCart = async (productId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const { error } = await supabase.from('cart_items').insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1
        });

        if (!error) setCartCount(prev => prev + 1);
    };

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display h-screen overflow-hidden text-gray-900 dark:text-white">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center text-[#102217] shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-2xl font-bold">shopping_bag</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight uppercase">Marketplace</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/cart')} className="relative size-12 rounded-full bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center border border-gray-100 dark:border-white/5 active:scale-90 transition-all">
                        <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-[#102217] text-[10px] font-black flex items-center justify-center border-2 border-background-light dark:border-background-dark">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
                <div className="px-4 py-6">
                    <div className="flex items-center w-full h-14 rounded-2xl bg-white dark:bg-surface-dark shadow-xl shadow-black/5 px-5 group transition-all focus-within:ring-2 focus-within:ring-primary/50">
                        <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary">search</span>
                        <input className="flex-1 bg-transparent border-none focus:ring-0 text-base font-medium px-3 text-gray-900 dark:text-white" placeholder={t('search_placeholder')} />
                        <span className="material-symbols-outlined text-gray-400">tune</span>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 mb-8">
                    {[
                        { id: 'all', label: 'All', icon: 'grid_view' },
                        { id: 'food', label: 'Food', icon: 'nutrition' },
                        { id: 'toys', label: 'Toys', icon: 'sports_baseball' },
                        { id: 'promo', label: 'Promos', icon: 'auto_awesome' }
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black whitespace-nowrap transition-all uppercase tracking-widest text-xs border ${filter === btn.id
                                ? 'bg-primary text-[#102217] border-primary shadow-lg shadow-primary/20 scale-105'
                                : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5 opacity-60'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{btn.icon}</span>
                            {btn.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {filter === 'all' && (
                            <section className="px-4 mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-black">{t('featured_destaques') || 'Promoções em Destaque'}</h3>
                                </div>
                                <div className="relative h-48 rounded-[2.5rem] overflow-hidden group shadow-2xl">
                                    <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?q=80&w=600&auto=format&fit=crop" alt="Promo" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
                                    <div className="absolute inset-0 p-8 flex flex-col justify-center items-start">
                                        <span className="px-4 py-1.5 rounded-full bg-primary text-[#102217] text-[10px] font-black mb-3 uppercase tracking-widest animate-pulse">Mega Sale 50%</span>
                                        <h4 className="text-3xl font-black text-white leading-none mb-2 italic">DOG SUMMER FEST</h4>
                                        <p className="text-gray-300 text-sm mb-5 font-bold opacity-80 uppercase tracking-tight">Melhores marcas com entrega grátis</p>
                                        <button className="btn-primary !h-12 !px-8 flex items-center justify-center">Shop Now</button>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="px-4 mb-8">
                            <h3 className="text-xl font-black mb-6 uppercase tracking-tight">
                                {filter === 'all' ? 'Popular Products' : `${filter} Collection`}
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                {filteredProducts.map((p) => (
                                    <div key={p.id} className="card !p-3 group">
                                        <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4">
                                            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={p.image_url} alt={p.name} />
                                            <button
                                                onClick={() => toggleFavorite(p.id)}
                                                className={`absolute top-3 right-3 size-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${favorites.includes(p.id) ? 'bg-primary text-[#102217]' : 'bg-black/20 text-white hover:bg-black/40'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-xl transition-transform active:scale-125">
                                                    {favorites.includes(p.id) ? 'favorite' : 'favorite'}
                                                </span>
                                            </button>
                                            {p.is_promo && (
                                                <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 dark:bg-black/90 rounded-full text-[10px] font-black text-primary uppercase">Promo</div>
                                            )}
                                        </div>
                                        <div className="px-2 pb-2">
                                            <h4 className="text-sm font-black leading-tight mb-1 line-clamp-1">{p.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest">{p.brand}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-black text-primary italic">R$ {p.price}</span>
                                                <button
                                                    onClick={() => addToCart(p.id)}
                                                    className="size-10 rounded-full bg-[#111814] dark:bg-primary text-primary dark:text-[#111814] flex items-center justify-center shadow-lg active:scale-90 transition-all"
                                                >
                                                    <span className="material-symbols-outlined font-bold">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>


        </div>
    );
};

export default MarketplaceView;
