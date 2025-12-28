import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';
import { ArrowLeft, Plus, ArrowUpRight, Sparkles, Wallet } from 'lucide-react';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import TransactionList from '../components/TransactionList';
import { WalletTransaction } from '../types';

const WalletView: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const supabase = useSupabase();

    const [balance, setBalance] = useState(0);
    const [cashbackEarned, setCashbackEarned] = useState(0);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWalletData();
        }
    }, [user]);

    const fetchWalletData = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Fetch wallet balance from profiles
            const { data: profileData } = await supabase
                .from('profiles')
                .select('wallet_balance')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setBalance(profileData.wallet_balance || 0);
            }

            // Fetch transactions
            const { data: transactionData } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (transactionData) {
                setTransactions(transactionData);

                // Calculate cashback earned
                const totalCashback = transactionData
                    .filter(t => t.type === 'cashback' && t.status === 'completed')
                    .reduce((sum, t) => sum + t.amount, 0);
                setCashbackEarned(totalCashback);
            }
        } catch (err: any) {
            console.error('Error fetching wallet data:', err);
            showNotification('Erro ao carregar carteira', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDepositSuccess = (amount: number) => {
        setBalance(prev => prev + amount);
        fetchWalletData(); // Refresh to get latest transactions
        showNotification(`Depósito de €${amount.toFixed(2)} confirmado!`, 'success');
    };

    const handleWithdrawSuccess = (amount: number) => {
        setBalance(prev => prev - amount);
        fetchWalletData();
        showNotification(`Saque de €${amount.toFixed(2)} processado!`, 'success');
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Carteira</h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Balance Card */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gradient-to-br from-[#102217] to-[#1a3a28] rounded-[3rem] p-8 shadow-2xl shadow-[#102217]/20 border border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#22eb7e]/10 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <Wallet size={20} className="text-[#22eb7e]" />
                                        <span className="text-white/60 text-xs font-black uppercase tracking-widest">Saldo Disponível</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <Sparkles size={14} />
                                        <span className="text-xs font-black">€{cashbackEarned.toFixed(2)} Cashback</span>
                                    </div>
                                </div>

                                <div className="text-5xl font-black text-white mb-8">
                                    €{balance.toFixed(2)}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowDepositModal(true)}
                                        className="h-14 bg-[#22eb7e] text-[#102217] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1fd672] transition-colors shadow-lg shadow-[#22eb7e]/20 active:scale-95"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                        Depositar
                                    </button>
                                    <button
                                        onClick={() => setShowWithdrawModal(true)}
                                        className="h-14 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-colors border border-white/10 active:scale-95"
                                    >
                                        <ArrowUpRight size={18} />
                                        Sacar
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Transactions Section */}
                        <div>
                            <h2 className="text-xl font-black text-slate-900 mb-4 px-2">Histórico</h2>
                            <TransactionList transactions={transactions} />
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            <DepositModal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                onSuccess={handleDepositSuccess}
            />
            <WithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                currentBalance={balance}
                onSuccess={handleWithdrawSuccess}
            />
        </div>
    );
};

export default WalletView;
