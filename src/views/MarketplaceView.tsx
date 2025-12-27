import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/authService';
import {
    ShoppingBag,
    ShoppingCart,
    Search,
    Settings2,
    Grid,
    Bone,
    Utensils,
    Sparkles,
    Heart,
    Plus,
    MapPin,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { showNotification } = useNotification();
    const [filter, setFilter] = useState<'all' | 'food' | 'toys' | 'promo'>('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data, error } = await (authService as any).supabase
                    .from('products')
                    .select('*');

                if (error) throw error;
                if (data) setProducts(data);
            } catch (err) {
                setProducts([
                    { id: 'p1', name: 'Ração Premium Adulto', brand: 'Royal Canin', price: 189.90, image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=300&auto=format&fit=crop', category: 'food' },
                    { id: 'p2', name: 'Osso de Borracha Resistente', brand: 'Kong', price: 45.50, image_url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=300&auto=format&fit=crop', category: 'toys', is_promo: true },
                    { id: 'p3', name: 'Cama Ortopédica G', brand: 'PetLovers', price: 299.00, image_url: 'https://images.unsplash.com/photo-1591946614421-1d4fca9e339a?q=80&w=300&auto=format&fit=crop', category: 'toys' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        if (filter === 'all') return products;
        if (filter === 'promo') return products.filter(p => !!p.is_promo);
        return products.filter(p => p.category === filter);
    }, [filter, products]);

    const items = [
        { id: 'all', label: 'Todos', icon: Grid },
        { id: 'food', label: 'Ração', icon: Utensils },
        { id: 'toys', label: 'Brinquedos', icon: Bone },
        { id: 'promo', label: 'Promos', icon: Sparkles }
    ];

    const shops = [
        { id: 1, name: 'Paws & Claws', distance: '0.5 miles', image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=200&auto=format&fit=crop' },
        { id: 2, name: 'The Dog Bakery', distance: '1.2 miles', image: 'https://images.unsplash.com/photo-1524510166700-47867fa4220c?q=80&w=200&auto=format&fit=crop' }
    ];

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark h-screen overflow-hidden">
            <header className="px-6 pt-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Marketplace</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Produtos Premium</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/cart')}
                    className="relative size-12 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                >
                    <ShoppingCart size={22} className="text-slate-600 dark:text-slate-300" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center border-2 border-background-light dark:border-background-dark">
                            {cartCount}
                        </span>
                    )}
                </button>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
                <div className="px-6 py-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            placeholder="Buscar ração, brinquedos..."
                            className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-sm"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Settings2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 mb-8">
                    {items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setFilter(item.id as any)}
                            className={`flex flex-col items-center gap-3 min-w-[80px] p-4 rounded-3xl transition-all ${filter === item.id
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                                    : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5'
                                }`}
                        >
                            <item.icon size={24} />
                            <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Nearby Shops Section */}
                <section className="mb-10">
                    <div className="px-6 flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black tracking-tight uppercase">Lojas Próximas</h2>
                        <button className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-wider">
                            Ver todas <ArrowRight size={12} />
                        </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar px-6">
                        {shops.map(shop => (
                            <div key={shop.id} className="min-w-[200px] bg-white dark:bg-slate-900 rounded-[2rem] p-3 border border-gray-100 dark:border-white/5 shadow-sm">
                                <div className="relative h-28 rounded-2xl overflow-hidden mb-3">
                                    <img src={shop.image} className="w-full h-full object-cover" alt={shop.name} />
                                    <div className="absolute top-2 right-2 size-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <MapPin size={14} className="text-white" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-black px-1">{shop.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-widest">{shop.distance}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="px-6 mb-8">
                    <h2 className="text-lg font-black tracking-tight uppercase mb-6">Produtos Populares</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {filteredProducts.map((p) => (
                            <motion.div
                                layout
                                key={p.id}
                                className="bg-white dark:bg-slate-900 p-3 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm relative group"
                            >
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <button className="absolute top-2 right-2 size-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                        <Heart size={14} />
                                    </button>
                                    {p.is_promo && (
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded-full uppercase">Oferta</div>
                                    )}
                                </div>
                                <div className="px-1">
                                    <h4 className="text-[11px] font-black line-clamp-1 mb-0.5">{p.name}</h4>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-3">{p.brand}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black text-primary italic">R$ {p.price}</span>
                                        <button className="size-8 rounded-xl bg-slate-900 dark:bg-primary text-primary dark:text-white flex items-center justify-center active:scale-90 transition-transform shadow-lg">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MarketplaceView;
