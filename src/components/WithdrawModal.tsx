import React, { useState } from 'react';
import { X, Banknote, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    onSuccess: (amount: number) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, currentBalance, onSuccess }) => {
    const { showNotification } = useNotification();
    const [amount, setAmount] = useState('');
    const [iban, setIban] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleWithdraw = async () => {
        const withdrawAmount = parseFloat(amount);

        if (!withdrawAmount || withdrawAmount < 10) {
            showNotification('O valor mínimo de saque é €10', 'error');
            return;
        }

        if (withdrawAmount > currentBalance) {
            showNotification('Saldo insuficiente', 'error');
            return;
        }

        if (!iban || iban.length < 20) {
            showNotification('IBAN inválido', 'error');
            return;
        }

        setIsProcessing(true);

        // TODO: Call Supabase Edge Function
        // const { data } = await supabase.functions.invoke('create-payout', {
        //   body: { amount: withdrawAmount, iban }
        // });

        setTimeout(() => {
            setIsProcessing(false);
            showNotification(`Saque de €${withdrawAmount.toFixed(2)} processado. Chegará em 2-3 dias úteis.`, 'success');
            onSuccess(withdrawAmount);
            setAmount('');
            setIban('');
            onClose();
        }, 2000);
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
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Sacar Fundos</h3>
                            <p className="text-sm text-slate-500 font-bold">Transfira para sua conta bancária</p>
                        </div>

                        {/* Balance Info */}
                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Saldo Disponível</span>
                            <span className="text-xl font-black text-slate-900">€{currentBalance.toFixed(2)}</span>
                        </div>

                        {/* Amount Input */}
                        <div className="mb-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 block mb-2">
                                Valor a Sacar
                            </label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-900">€</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-16 pl-12 pr-6 text-2xl font-black bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#22eb7e]/20 transition-all"
                                    min="10"
                                    max={currentBalance}
                                    step="0.01"
                                />
                            </div>
                            <button
                                onClick={() => setAmount(currentBalance.toString())}
                                className="mt-2 ml-4 text-xs font-black text-[#22eb7e] uppercase tracking-widest hover:underline"
                            >
                                Sacar Tudo
                            </button>
                        </div>

                        {/* IBAN Input */}
                        <div className="mb-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 block mb-2">
                                IBAN
                            </label>
                            <input
                                type="text"
                                value={iban}
                                onChange={(e) => setIban(e.target.value.toUpperCase())}
                                placeholder="PT50 0000 0000 0000 0000 0000 0"
                                className="w-full h-14 px-6 font-mono text-sm font-bold bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#22eb7e]/20 transition-all"
                                maxLength={34}
                            />
                        </div>

                        {/* Warning */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
                            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-amber-900 mb-1">Prazo de Processamento</p>
                                <p className="text-xs text-amber-700 font-medium">O valor chegará em 2-3 dias úteis</p>
                            </div>
                        </div>

                        {/* Withdraw Button */}
                        <button
                            onClick={handleWithdraw}
                            disabled={isProcessing || !amount || !iban}
                            className="w-full h-14 bg-[#102217] text-[#22eb7e] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1a3328] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-[#22eb7e] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Banknote size={18} />
                                    Confirmar Saque
                                </>
                            )}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WithdrawModal;
