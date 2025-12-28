import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useSupabase } from '../hooks/useSupabase';
import { useCartStore } from '../stores/cartStore';
import { Product, Category } from '../types/marketplace';
import {
    ShoppingBag, ShoppingCart, Search, Heart, Star,
    Filter, Plus, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MarketplaceView: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const supabaseClient = useSupabase();
    const cartStore = useCartStore();

    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

    // Load categories and products
    useEffect(() => {
        loadCategories();
        loadProducts();
    }, []);

    const loadCategories = async () => {
        try {
            const { data, error } = await supabaseClient
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .is('parent_id', null)
                .order('display_order');

            if (error) throw error;
            setCategories(data || []);
        } catch (err: any) {
            console.error('Error loading categories:', err);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            let query = supabaseClient
                .from('products')
                .select('*')
                .eq('is_active', true);

            if (selectedCategory) {
                query = query.eq('category_id', selectedCategory);
            }

            query = query.gte('base_price', priceRange[0]).lte('base_price', priceRange[1]);

            if (sortBy === 'featured') {
                query = query.order('is_featured', { ascending: false }).order('sales_count', { ascending: false });
            } else if (sortBy === 'price_asc') {
                query = query.order('base_price', { ascending: true });
            } else if (sortBy === 'price_desc') {
                query = query.order('base_price', { ascending: false });
            } else if (sortBy === 'rating') {
                query = query.order('avg_rating', { ascending: false });
            }

            query = query.limit(50);
            const { data, error } = await query;

            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            console.error('Error loading products:', err);
            showNotification('Erro ao carregar produtos', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [selectedCategory, sortBy, priceRange]);

    const filteredProducts = products.filter(p =>
        searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

    const handleAddToCart = (product: Product) => {
        cartStore.addItem(product);
        showNotification(`${product.name} no carrinho!`, 'success');
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-16 animate-fade-in">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm shadow-slate-200/30">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[1.5rem] bg-[#22eb7e] flex items-center justify-center shadow-2xl shadow-[#22eb7e]/30">
                            <ShoppingBag size={28} className="text-[#102217]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Marketplace</h1>
                            <p className="text-[10px] font-black text-[#22eb7e] uppercase tracking-widest mt-1.5 opacity-80">Premium Care & Food</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/cart')}
                        className="relative w-12 h-12 rounded-full bg-slate-50 border border-slate-200/50 flex items-center justify-center active:scale-90 transition-all shadow-sm"
                    >
                        <ShoppingCart size={22} className="text-slate-600" />
                        {cartStore.getItemCount() > 0 && (
                            <span className="absolute -top-1 -right-1 size-6 bg-[#22eb7e] text-[#102217] rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-lg">
                                {cartStore.getItemCount()}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Pesquisar rações, acessórios..."
                        className="input-premium pl-14"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2.5 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`h-11 px-8 rounded-full font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${!selectedCategory ? 'bg-[#102217] text-[#22eb7e] shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-400 border border-slate-200/50 hover:bg-slate-100'}`}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`h-11 px-8 rounded-full font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-[#102217] text-[#22eb7e] shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-400 border border-slate-200/50 hover:bg-slate-100'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </header>

            {/* Sorting */}
            <div className="px-6 py-5 flex items-center gap-3">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-10 px-5 rounded-full bg-white border border-slate-100 text-slate-600 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"
                >
                    <Filter size={14} /> Filtros
                </button>
                <div className="flex-1" />
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="h-10 pl-6 pr-10 rounded-full bg-white border border-slate-100 text-slate-600 font-extrabold text-[10px] uppercase tracking-widest outline-none shadow-sm appearance-none"
                    >
                        <option value="featured">Destaques</option>
                        <option value="price_asc">Menor Preço</option>
                        <option value="price_desc">Maior Preço</option>
                        <option value="rating">Avaliação</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Plus size={12} className="rotate-45" />
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto px-6 pt-2 pb-28 no-scrollbar">
                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[3/4.5] rounded-[3rem] bg-slate-50 animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                            <ShoppingBag size={48} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Nada por aqui...</h3>
                        <p className="text-sm font-bold text-slate-400 mb-10 max-w-[200px]">Infelizmente não encontramos nenhum produto nestas condições.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                            className="bg-[#22eb7e] text-[#102217] h-12 px-8 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#22eb7e]/20"
                        >
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-5">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Refined Product Card
const ProductCard: React.FC<{ product: Product, onAddToCart: (p: Product) => void }> = ({ product, onAddToCart }) => {
    const navigate = useNavigate();
    const [isFav, setIsFav] = useState(false);
    const price = product.sale_price || product.base_price;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-500"
        >
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onClick={() => navigate(`/product/${product.slug}`)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <button
                    onClick={() => setIsFav(!isFav)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg active:scale-90 transition-all z-10"
                >
                    <Heart size={18} className={isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
                </button>

                {product.is_featured && (
                    <div className="absolute top-4 left-4 h-8 px-3 rounded-full bg-[#22eb7e] text-[#102217] flex items-center gap-1.5 shadow-lg z-10">
                        <Sparkles size={12} fill="currentColor" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Destaque</span>
                    </div>
                )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <p className="text-[10px] font-black text-[#22eb7e] uppercase tracking-widest mb-1.5">{product.brand || 'BioPet Premium'}</p>
                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 mb-4 leading-snug cursor-pointer group-hover:text-[#22eb7e] transition-colors" onClick={() => navigate(`/product/${product.slug}`)}>
                    {product.name}
                </h3>

                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        {product.sale_price && (
                            <span className="text-[10px] text-slate-300 line-through font-bold mb-0.5">€{product.base_price.toFixed(2)}</span>
                        )}
                        <span className="text-xl font-black text-[#102217]">€{price.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="w-12 h-12 rounded-2xl bg-[#102217] text-white flex items-center justify-center active:scale-90 transition-all hover:bg-[#22eb7e] hover:text-[#102217] shadow-lg shadow-slate-200"
                    >
                        <Plus size={24} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};


export default MarketplaceView;
