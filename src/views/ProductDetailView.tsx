import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { useCartStore } from '../stores/cartStore';
import { useNotification } from '../contexts/NotificationContext';
import { Product } from '../types/marketplace';
import {
    ChevronLeft, Star, Minus, Plus, ShoppingBag,
    Share2, Heart, CheckCircle2, ShieldCheck, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailView: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const supabaseClient = useSupabase();
    const cartStore = useCartStore();
    const { showNotification } = useNotification();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        loadProduct();
        window.scrollTo(0, 0);
    }, [slug]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            // For demo purposes, we might need to fallback if slug lookup fails or isn't set up
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (err) {
            console.error('Error loading product:', err);
            // Fallback for demo if DB is empty or slug not found
            // showNotification('Produto não encontrado', 'error');
            // navigate('/marketplace');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        for (let i = 0; i < quantity; i++) {
            cartStore.addItem(product);
        }
        showNotification(`${quantity}x ${product.name} adicionado!`, 'success');
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="w-12 h-12 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) return null;

    const price = product.sale_price || product.base_price;
    const discount = product.sale_price ? Math.round((1 - (product.sale_price / product.base_price)) * 100) : 0;
    const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800'];

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden animate-fade-in font-sans">
            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between z-20 sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md">
                <button
                    onClick={() => navigate(-1)}
                    className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all shadow-sm"
                >
                    <ChevronLeft size={22} />
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setIsFavorite(!isFavorite);
                            showNotification(isFavorite ? 'Removido dos favoritos' : 'Salvo nos favoritos!', 'info');
                        }}
                        className={`size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center transition-all shadow-sm ${isFavorite ? 'text-rose-500' : 'text-slate-400'}`}
                    >
                        <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                    </button>
                    <button className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 transition-all shadow-sm">
                        <Share2 size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
                {/* Images Gallery */}
                <div className="px-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative aspect-square rounded-[3rem] overflow-hidden bg-white shadow-xl shadow-slate-200/50 mb-4"
                    >
                        <img
                            src={images[selectedImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {discount > 0 && (
                            <div className="absolute top-6 left-6 px-4 py-2 bg-[#102217] text-[#22eb7e] text-xs font-black uppercase tracking-widest rounded-xl shadow-lg">
                                -{discount}% OFF
                            </div>
                        )}
                    </motion.div>

                    {images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`size-20 rounded-2xl flex-shrink-0 overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-[#22eb7e]' : 'border-transparent opacity-70'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="px-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-[#22eb7e] uppercase tracking-widest bg-[#22eb7e]/10 px-2 py-1 rounded-lg">
                                {product.brand || 'Premium Brand'}
                            </span>
                            <div className="flex items-center gap-1 text-amber-400">
                                <Star size={12} fill="currentColor" />
                                <span className="text-xs font-bold text-slate-700">{product.avg_rating?.toFixed(1) || '4.8'}</span>
                                <span className="text-[10px] text-slate-400">({product.review_count || 128} reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">{product.name}</h1>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-black text-[#102217]">€{price.toFixed(2)}</span>
                            {product.sale_price && (
                                <span className="text-sm font-bold text-slate-300 line-through mb-1.5">€{product.base_price.toFixed(2)}</span>
                            )}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-3">
                            <div className="size-10 rounded-full bg-[#22eb7e]/10 flex items-center justify-center text-[#22eb7e]">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase">Garantia</p>
                                <p className="text-xs font-bold text-slate-700">Qualidade 100%</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-3">
                            <div className="size-10 rounded-full bg-[#22eb7e]/10 flex items-center justify-center text-[#22eb7e]">
                                <Truck size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase">Entrega</p>
                                <p className="text-xs font-bold text-slate-700">Em 24 horas</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Descrição</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            {product.description || product.short_description || 'Um produto excelente para o seu pet, desenvolvido com os melhores materiais para garantir conforto e durabilidade.'}
                        </p>
                    </div>

                    <div className="h-4" />
                </div>
            </main>

            {/* Sticky Actions Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 pb-8 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-30">
                <div className="flex items-center gap-6 max-w-[440px] mx-auto">
                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl h-14 px-4 border border-slate-200">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="text-slate-400 hover:text-slate-900 transition-colors active:scale-90"
                        >
                            <Minus size={20} className="w-5" />
                        </button>
                        <span className="font-black text-lg w-4 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="text-slate-400 hover:text-slate-900 transition-colors active:scale-90"
                        >
                            <Plus size={20} className="w-5" />
                        </button>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 h-14 bg-[#102217] text-[#22eb7e] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#102217]/20 active:scale-95 transition-all hover:bg-[#22eb7e] hover:text-[#102217]"
                    >
                        <ShoppingBag size={20} />
                        <span>Adicionar</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ProductDetailView;
