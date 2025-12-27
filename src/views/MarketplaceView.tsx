import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useSupabase } from '../hooks/useSupabase';
import { useCartStore } from '../stores/cartStore';
import { Product, Category } from '../types/marketplace';
import {
    ShoppingBag, ShoppingCart, Search, Heart, Star,
    ChevronDown, Filter, X, Plus, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MarketplaceView: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const supabase = useSupabase();
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
            const { data, error } = await supabase
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
            let query = supabase
                .from('products')
                .select('*')
                .eq('is_active', true);

            // Category filter
            if (selectedCategory) {
                query = query.eq('category_id', selectedCategory);
            }

            // Price range filter
            query = query.gte('base_price', priceRange[0]).lte('base_price', priceRange[1]);

            // Sorting
            if (sortBy === 'featured') {
                query = query.order('is_featured', { ascending: false }).order('sales_count', { ascending: false });
            } else if (sortBy === 'price_asc') {
                query = query.order('base_price', { ascending: true });
            } else if (sortBy === 'price_desc') {
                query = query.order('base_price', { ascending: false });
            } else if (sortBy === 'rating') {
                query = query.order('avg_rating', { ascending: false });
            }

            // Limit for performance
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

    // Reload when filters change
    useEffect(() => {
        loadProducts();
    }, [selectedCategory, sortBy, priceRange]);

    // Search filter (client-side for now)
    const filteredProducts = products.filter(p =>
        searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

    const handleAddToCart = (product: Product) => {
        cartStore.addItem(product);
        showNotification(`${product.name} adicionado ao carrinho!`, 'success');
    };

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark h-screen overflow-hidden">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                            <ShoppingBag size={24} className="text-[#050705]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">Pet Shop Premium</h1>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{products.length} Produtos</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/cart')}
                        className="relative size-12 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 flex items-center justify-center active:scale-90 transition-all"
                    >
                        <ShoppingCart size={22} />
                        {cartStore.getItemCount() > 0 && (
                            <span className="absolute -top-1 -right-1 size-6 bg-primary text-[#050705] rounded-full text-xs font-black flex items-center justify-center">
                                {cartStore.getItemCount()}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar produtos, marcas..."
                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 font-bold focus:border-primary/50 transition-all"
                    />
                </div>

                {/* Categories Scroll */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-6 h-10 rounded-full font-bold text-sm whitespace-nowrap transition-all ${!selectedCategory ? 'bg-primary text-[#050705]' : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5'}`}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 h-10 rounded-full font-bold text-sm whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-primary text-[#050705]' : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </header>

            {/* Filters & Sort */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-white/5">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 h-10 rounded-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 font-bold text-sm"
                >
                    <Filter size={16} />
                    Filtros
                </button>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 h-10 rounded-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 font-bold text-sm"
                >
                    <option value="featured">Destaques</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                    <option value="rating">Melhor Avaliados</option>
                </select>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <ShoppingBag size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="font-bold text-gray-500">Nenhum produto encontrado</p>
                        <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} className="mt-4 text-primary font-bold text-sm">Limpar filtros</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 pb-24">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Product Card Component
interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const hasDiscount = product.sale_price && product.sale_price < product.base_price;
    const displayPrice = product.sale_price || product.base_price;
    const discountPercent = hasDiscount ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm"
        >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-slate-800">
                <img
                    src={product.images[0] || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onClick={() => navigate(`/product/${product.slug}`)}
                />
                {hasDiscount && (
                    <div className="absolute top-2 left-2 px-3 py-1 bg-red-500 text-white text-xs font-black rounded-full">
                        -{discountPercent}%
                    </div>
                )}
                {product.is_featured && (
                    <div className="absolute top-2 right-2 size-8 bg-primary rounded-full flex items-center justify-center">
                        <Sparkles size={16} className="text-[#050705]" />
                    </div>
                )}
                <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="absolute bottom-2 right-2 size-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-full flex items-center justify-center active:scale-90 transition-all"
                >
                    <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
                </button>
            </div>

            {/* Info */}
            <div className="p-4">
                {product.brand && (
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{product.brand}</p>
                )}
                <h3 className="font-bold text-sm line-clamp-2 mb-2 min-h-[40px]" onClick={() => navigate(`/product/${product.slug}`)}>
                    {product.name}
                </h3>

                {/* Rating */}
                {product.avg_rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold">{product.avg_rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({product.review_count})</span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">R$ {product.base_price.toFixed(2)}</span>
                    )}
                    <span className="text-lg font-black text-primary">R$ {displayPrice.toFixed(2)}</span>
                </div>

                {/* Add to Cart */}
                <button
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className="w-full h-10 bg-primary text-[#050705] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={16} />
                    {product.stock_quantity === 0 ? 'Esgotado' : 'Adicionar'}
                </button>
            </div>
        </motion.div>
    );
};

export default MarketplaceView;
