import React, { useState } from 'react';
import { X, CreditCard, Smartphone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';
import { useSupabase } from '../hooks/useSupabase';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (amount: number) => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { showNotification } = useNotification();
    const supabase = useSupabase();
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'mbway'>('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const presetAmounts = [10, 20, 50, 100];

    const handleDeposit = async () => {
        const depositAmount = parseFloat(amount);

        if (!depositAmount || depositAmount < 5) {
            showNotification('O valor mínimo é €5', 'error');
            return;
        }

        if (depositAmount > 500) {
            showNotification('O valor máximo por transação é €500', 'error');
            return;
        }

        setIsProcessing(true);

        try {
            const { data, error } = await supabase.functions.invoke('create-payment-intent', {
                body: { amount: depositAmount, method: paymentMethod }
            });

            if (error) throw error;

            if (data?.clientSecret) {
                showNotification(`Pronto! Use o Stripe para completar o pagamento.`, 'success');
                onSuccess(depositAmount);
                // Here you would normally initialize Stripe Elements with data.clientSecret
                setAmount('');
                onClose();
            }
        } catch (err: any) {
            console.error('Erro no depósito:', err);
            showNotification(err.message || 'Erro ao processar depósito', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 top-[15%] md:inset-x-auto md:w-full md:max-w-md md:left-1/2 md:-translate-x-1/2 bg-white rounded-[2.5rem] p-8 z-50 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Depositar Fundos</h3>
                            <p className="text-sm text-slate-500 font-bold">Adicione crédito à sua carteira</p>
                        </div>

                        {/* Amount Input */}
                        <div className="mb-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 block mb-2">
                                Valor
                            </label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-900">€</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-16 pl-12 pr-6 text-2xl font-black bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#22eb7e]/20 transition-all"
                                    min="5"
                                    max="500"
                                    step="0.01"
                                />
                            </div>
                            <div className="flex gap-2 mt-3">
                                {presetAmounts.map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => setAmount(preset.toString())}
                                        className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-600 font-black text-sm hover:bg-[#22eb7e] hover:text-[#102217] transition-colors"
                                    >
                                        €{preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-8">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 block mb-3">
                                Método de Pagamento
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`h-14 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-sm transition-all ${paymentMethod === 'card'
                                        ? 'border-[#22eb7e] bg-[#22eb7e]/10 text-[#22eb7e]'
                                        : 'border-slate-200 bg-white text-slate-600'
                                        }`}
                                >
                                    <CreditCard size={18} />
                                    Cartão
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('mbway')}
                                    className={`h-14 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-sm transition-all ${paymentMethod === 'mbway'
                                        ? 'border-[#22eb7e] bg-[#22eb7e]/10 text-[#22eb7e]'
                                        : 'border-slate-200 bg-white text-slate-600'
                                        }`}
                                >
                                    <Smartphone size={18} />
                                    MB Way
                                </button>
                            </div>
                        </div>

                        {/* Deposit Button */}
                        <button
                            onClick={handleDeposit}
                            disabled={isProcessing || !amount}
                            className="btn-primary-premium w-full !h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-[#102217] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Continuar
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <p className="text-xs text-slate-400 text-center mt-4 font-bold">
                            Processado de forma segura via Stripe
                        </p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DepositModal;
