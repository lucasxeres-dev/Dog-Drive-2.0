import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, MapPin, Truck, Check, Lock, Smartphone, HelpCircle } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useNotification } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutView: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const cartStore = useCartStore();

    const [step, setStep] = useState<'address' | 'payment' | 'confirm'>('address');
    const [processing, setProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'mbway' | 'card' | 'apple'>('mbway');

    // Calculations
    const total = cartStore.getTotal();
    const shipping = total > 50 ? 0 : 5.90;
    const finalTotal = total + shipping;

    const handlePayment = async () => {
        setProcessing(true);
        // Simulate API call
        setTimeout(() => {
            setProcessing(false);
            setStep('confirm');
            cartStore.clearCart();
            showNotification('Pedido confirmado com sucesso!', 'success');
        }, 2000);
    };

    if (step === 'confirm') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white h-screen p-6 animate-fade-in text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="size-32 bg-[#22eb7e] rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-[#22eb7e]/40"
                >
                    <Check size={64} className="text-[#102217]" strokeWidth={3} />
                </motion.div>
                <h1 className="text-3xl font-black text-[#102217] mb-2">Pedido Confirmado!</h1>
                <p className="text-slate-500 font-medium mb-8 max-w-[250px]">Obrigado pela sua compra. Enviamos a confirmação para o seu email.</p>

                <button
                    onClick={() => navigate('/feed')}
                    className="w-full max-w-[300px] h-14 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                    Voltar ao Feed
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden font-sans">
            {/* Header */}
            <div className="px-6 py-6 pt-12 flex items-center gap-4 bg-white shadow-sm z-10 sticky top-0">
                <button
                    onClick={() => step === 'address' ? navigate(-1) : setStep('address')}
                    className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all outline-none"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-lg font-black uppercase tracking-tight text-slate-900">Checkout</h1>
            </div>

            <main className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Progress Status */}
                <div className="flex items-center gap-2 mb-4">
                    <div className={`h-1 flex-1 rounded-full ${step === 'address' || step === 'payment' ? 'bg-[#22eb7e]' : 'bg-slate-200'}`} />
                    <div className={`h-1 flex-1 rounded-full ${step === 'payment' ? 'bg-[#22eb7e]' : 'bg-slate-200'}`} />
                </div>

                {step === 'address' && (
                    <div className="space-y-6 animate-fade-in">
                        <section>
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Endereço de Entrega</h2>
                            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-4">
                                <div className="size-10 rounded-full bg-[#22eb7e]/10 flex items-center justify-center text-[#22eb7e] flex-shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-900">Casa</h3>
                                        <button className="text-[#22eb7e] text-xs font-bold uppercase">Alterar</button>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                        Rua das Flores, 123<br />
                                        1200-001 Lisboa, Portugal
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Método de Envio</h2>
                            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 border-[#22eb7e] relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-[#22eb7e] text-[#102217] text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                    Recomendado
                                </div>
                                <div className="size-10 rounded-full bg-[#102217] flex items-center justify-center text-white flex-shrink-0">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Expresso DogDrive</h3>
                                    <p className="text-xs text-slate-400">Entrega em 24 horas</p>
                                </div>
                                <div className="ml-auto font-black text-[#102217]">
                                    {shipping === 0 ? 'Grátis' : `€${shipping.toFixed(2)}`}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {step === 'payment' && (
                    <div className="space-y-6 animate-fade-in">
                        <section>
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Pagamento Seguro</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setSelectedMethod('mbway')}
                                    className={`w-full bg-white p-4 rounded-[1.5rem] shadow-sm border flex items-center gap-4 transition-all ${selectedMethod === 'mbway' ? 'border-[#22eb7e] ring-1 ring-[#22eb7e]' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-rose-500">
                                        <Smartphone size={24} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-bold text-slate-900">MB Way</h3>
                                        <p className="text-[10px] text-slate-400">Pague com seu telemóvel</p>
                                    </div>
                                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'mbway' ? 'border-[#22eb7e]' : 'border-slate-200'}`}>
                                        {selectedMethod === 'mbway' && <div className="size-2.5 bg-[#22eb7e] rounded-full" />}
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedMethod('card')}
                                    className={`w-full bg-white p-4 rounded-[1.5rem] shadow-sm border flex items-center gap-4 transition-all ${selectedMethod === 'card' ? 'border-[#22eb7e] ring-1 ring-[#22eb7e]' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900">
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-bold text-slate-900">Cartão de Crédito</h3>
                                        <p className="text-[10px] text-slate-400">Visa, Mastercard</p>
                                    </div>
                                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'card' ? 'border-[#22eb7e]' : 'border-slate-200'}`}>
                                        {selectedMethod === 'card' && <div className="size-2.5 bg-[#22eb7e] rounded-full" />}
                                    </div>
                                </button>
                            </div>
                        </section>

                        <div className="bg-slate-100 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-500">
                            <Lock size={16} className="text-slate-400" />
                            <p>Pagamento 100% seguro e criptografado.</p>
                        </div>
                    </div>
                )}

                {/* Summary (Always Visible) */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Resumo</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-500 font-bold">
                            <span>Subtotal</span>
                            <span>€{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-bold">
                            <span>Envio</span>
                            <span className={shipping === 0 ? 'text-[#22eb7e]' : ''}>
                                {shipping === 0 ? 'GRÁTIS' : `€${shipping.toFixed(2)}`}
                            </span>
                        </div>
                        <div className="h-px bg-slate-100 my-2" />
                        <div className="flex justify-between text-lg font-black text-[#102217]">
                            <span>Total</span>
                            <span>€{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </main>

            {/* Action Button */}
            <div className="p-6 bg-white border-t border-slate-100 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
                <button
                    onClick={() => step === 'address' ? setStep('payment') : handlePayment()}
                    disabled={processing}
                    className="w-full h-14 bg-[#102217] text-[#22eb7e] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-[#102217]/20 hover:bg-[#22eb7e] hover:text-[#102217] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {processing ? (
                        <div className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        step === 'address' ? 'Continuar para Pagamento' : `Pagar €${finalTotal.toFixed(2)}`
                    )}
                </button>
            </div>
        </div>
    );
};

export default CheckoutView;
