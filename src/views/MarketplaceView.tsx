import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useSupabase } from '../hooks/useSupabase';
import { useCartStore } from '../stores/cartStore';
import { Product, Category } from '../types/marketplace';
import {
    ShoppingBag, ShoppingCart, Search, Heart, Star,
    Filter, Plus, Sparkles, X, ChevronRight, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hardcoded categories as requested for the UI flow
const UI_CATEGORIES = [
    { id: 'all', name: 'Todos' },
    { id: 'racao', name: 'Ração' },
    { id: 'brinquedos', name: 'Brinquedos' },
    { id: 'higiene', name: 'Higiene' },
    { id: 'acessorios', name: 'Acessórios' },
    { id: 'saude', name: 'Saúde' },
    { id: 'promocoes', name: 'Promoções' }
];

const MarketplaceView: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const supabaseClient = useSupabase();
    const cartStore = useCartStore();

    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'home' | 'favorites'>('home');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Search & Filter State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Advanced Filters
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedPetType, setSelectedPetType] = useState<string>('');

    // Load data
    useEffect(() => {
        loadProducts();
        // Load favorites from local storage for demo persistence
        const savedFavs = localStorage.getItem('dogdrive_favorites');
        if (savedFavs) {
            setFavorites(new Set(JSON.parse(savedFavs)));
        }
    }, []);

    // Persist favorites
    useEffect(() => {
        localStorage.setItem('dogdrive_favorites', JSON.stringify(Array.from(favorites)));
    }, [favorites]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            // In a real app, we would query Supabase with all filters.
            // For this demo, we'll fetch active products and filter client-side for smoother interaction with the "mock" categories.
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('is_active', true)
                .limit(100);

            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            console.error('Error loading products:', err);
            showNotification('Erro ao carregar produtos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = (productId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newFavs = new Set(favorites);
        if (newFavs.has(productId)) {
            newFavs.delete(productId);
            showNotification('Removido dos favoritos', 'info');
        } else {
            newFavs.add(productId);
            showNotification('Adicionado aos favoritos! ❤️', 'success');
        }
        setFavorites(newFavs);
    };

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();
        cartStore.addItem(product);
        showNotification(`${product.name} no carrinho!`, 'success');
    };

    // Filter Logic
    const filteredProducts = products.filter(p => {
        // Tab Filter
        if (activeTab === 'favorites' && !favorites.has(p.id)) return false;

        // Search
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !p.brand?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Category (Mock logic since DB might not match exact UI categories)
        if (selectedCategory !== 'all') {
            if (selectedCategory === 'promocoes') {
                if (!p.sale_price) return false;
            } else {
                // Fuzzy match for demo purposes if category_id isn't strictly set match
                // In production: p.category_id === selectedCategory
                // Here we simulate category filtering if tags or name include the category
                const catMatch = p.tags?.some(tag => tag.includes(selectedCategory)) ||
                    p.description?.toLowerCase().includes(selectedCategory);
                if (!catMatch) return false;
            }
        }

        // Advanced Filters
        if (p.base_price < priceRange[0] || p.base_price > priceRange[1]) return false;
        if (selectedBrand && p.brand !== selectedBrand) return false;
        // if (selectedPetType && !p.tags.includes(selectedPetType)) return false;

        return true;
    });

    const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden animate-fade-in font-sans">
            {/* Header */}
            <header className="px-6 pt-12 pb-4 bg-white shadow-sm shadow-slate-200/50 z-20 relative">
                <div className="flex items-center justify-between mb-6">
                    {activeTab === 'favorites' ? (
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Favoritos</h1>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Seus itens amados ❤️</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {isSearchOpen ? (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: '100%' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex items-center gap-2 flex-1 mr-4"
                                >
                                    <div className="relative flex-1">
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            autoFocus
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Buscar..."
                                            className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#22eb7e]"
                                        />
                                    </div>
                                    <button
                                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                        className="size-12 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-500"
                                    >
                                        <X size={20} />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="size-12 rounded-2xl bg-[#22eb7e] flex items-center justify-center shadow-lg shadow-[#22eb7e]/30">
                                        <ShoppingBag size={24} className="text-[#102217]" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Marketplace</h1>
                                        <p className="text-[10px] font-black text-[#22eb7e] uppercase tracking-widest mt-0.5 opacity-90">Premium Store</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}

                    {!isSearchOpen && activeTab !== 'favorites' && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#22eb7e] hover:border-[#22eb7e] transition-all"
                            >
                                <Search size={20} />
                            </button>
                            <button
                                onClick={() => navigate('/cart')}
                                className="relative size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-all"
                            >
                                <ShoppingCart size={20} />
                                {cartStore.getItemCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 size-5 bg-[#22eb7e] text-[#102217] rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white">
                                        {cartStore.getItemCount()}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Categories / Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`h-10 px-6 rounded-full font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border ${activeTab === 'favorites' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                        <Heart size={12} className={`inline mr-2 ${activeTab === 'favorites' ? 'fill-white' : ''}`} />
                        Favoritos
                    </button>
                    <div className="w-px h-6 bg-slate-200 my-auto mx-1" />
                    {UI_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setSelectedCategory(cat.id);
                                setActiveTab('home');
                            }}
                            className={`h-10 px-6 rounded-full font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat.id && activeTab === 'home' ? 'bg-[#102217] text-[#22eb7e] border-[#102217] shadow-lg shadow-slate-300' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Filters Toggle Bar */}
                {activeTab === 'home' && (
                    <div className="flex items-center justify-between mt-4 pb-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${showFilters ? 'text-[#22eb7e]' : 'text-slate-400'}`}
                        >
                            <Filter size={12} />
                            {showFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
                        </button>
                        <span className="text-[10px] font-bold text-slate-300">
                            {filteredProducts.length} produtos
                        </span>
                    </div>
                )}

                {/* Advanced Filters Panel */}
                <AnimatePresence>
                    {showFilters && activeTab === 'home' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="py-4 space-y-4 border-t border-slate-100">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2 block">Preço Máximo: €{priceRange[1]}</label>
                                    <input
                                        type="range"
                                        min="0" max="1000" step="10"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#22eb7e] [&::-webkit-slider-thumb]:rounded-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2 block">Marca</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedBrand('')}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${!selectedBrand ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-400'}`}
                                        >
                                            Todas
                                        </button>
                                        {uniqueBrands.slice(0, 5).map(brand => (
                                            <button
                                                key={brand}
                                                onClick={() => setSelectedBrand(brand === selectedBrand ? '' : brand!)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${brand === selectedBrand ? 'bg-[#22eb7e] text-[#102217] border-[#22eb7e]' : 'border-slate-200 text-slate-400'}`}
                                            >
                                                {brand}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-32 no-scrollbar bg-[#f8fafc]">
                {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[3.5/5] rounded-[2rem] bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                        <ShoppingBag size={48} className="text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-400">Nenhum produto encontrado.</p>
                        <button
                            onClick={() => {
                                setSelectedCategory('all');
                                setSearchQuery('');
                                setPriceRange([0, 1000]);
                                setSelectedBrand('');
                            }}
                            className="mt-4 text-[#22eb7e] font-black text-xs uppercase tracking-widest"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isFavorite={favorites.has(product.id)}
                                toggleFavorite={toggleFavorite}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Compact Product Card for 2-column grid
const ProductCard: React.FC<{
    product: Product,
    isFavorite: boolean,
    toggleFavorite: (id: string, e: React.MouseEvent) => void,
    onAddToCart: (p: Product, e: React.MouseEvent) => void
}> = ({ product, isFavorite, toggleFavorite, onAddToCart }) => {
    const navigate = useNavigate();
    const price = product.sale_price || product.base_price;
    const hasDiscount = !!product.sale_price;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col bg-white rounded-[2rem] p-3 shadow-sm border border-slate-100 hover:shadow-lg hover:border-[#22eb7e]/30 transition-all duration-300 relative"
            onClick={() => navigate(`/product/${product.slug || product.id}`)}
        >
            {/* Image Area */}
            <div className="relative aspect-square rounded-[1.5rem] bg-slate-50 mb-3 overflow-hidden">
                <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Badges */}
                {hasDiscount && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#102217] text-[#22eb7e] text-[8px] font-black uppercase tracking-wider rounded-lg shadow-md z-10">
                        Promo
                    </div>
                )}
                {product.stock_quantity > 0 && product.stock_quantity < 5 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-500 text-white text-[8px] font-black uppercase tracking-wider rounded-lg shadow-md z-10">
                        Restam {product.stock_quantity}
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className="absolute top-2 right-2 size-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-90 transition-all z-20"
                >
                    <Heart size={14} className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'} />
                </button>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">
                    {product.brand || 'DOG DRIVE'}
                </p>
                <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 mb-2 h-8">
                    {product.name}
                </h3>

                {/* Rating - Visual */}
                <div className="flex items-center gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={8} className={`${star <= (product.avg_rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                    <span className="text-[8px] text-slate-400 ml-1">({product.review_count || 12})</span>
                </div>

                {/* Price & Add */}
                <div className="mt-auto flex items-end justify-between">
                    <div>
                        {hasDiscount && (
                            <p className="text-[9px] text-slate-400 line-through font-bold">€{product.base_price.toFixed(2)}</p>
                        )}
                        <p className="text-sm font-black text-[#102217]">€{price.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={(e) => onAddToCart(product, e)}
                        className="size-9 rounded-xl bg-[#102217] text-white flex items-center justify-center active:scale-90 transition-all hover:bg-[#22eb7e] hover:text-[#102217] shadow-lg shadow-[#102217]/20"
                    >
                        <Plus size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default MarketplaceView;
