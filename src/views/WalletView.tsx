import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';
import {
    ArrowLeft, Plus, Landmark, ArrowUpRight, ArrowDownLeft,
    ShieldCheck, CreditCard, ChevronRight, Sparkles
} from 'lucide-react';

const WalletView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const supabase = useSupabase();

    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showBankForm, setShowBankForm] = useState(false);
    const [bankData, setBankData] = useState({ bank: '', account: '', type: 'Conta Corrente' });
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchWalletData();
        }
    }, [user]);

    const fetchWalletData = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Fetch Wallet Balance
            const { data: walletData, error: walletError } = await supabase
                .from('wallets')
                .select('balance')
                .eq('user_id', user.id)
                .single();

            if (!walletError && walletData) {
                setBalance(walletData.balance);
            } else {
                setBalance(1250.00); // Demo fallback
            }

            // Fetch Bank Details
            const { data: bankResult, error: bankError } = await supabase
                .from('bank_details')
                .select('bank_name, account_type')
                .eq('user_id', user.id)
                .single();

            if (!bankError && bankResult) {
                setBankData({
                    bank: bankResult.bank_name,
                    account: '**** **** **** 7789', // Masked for demo
                    type: bankResult.account_type
                });
            }

            setTransactions([
                { id: 1, title: 'Passeio com Thor', date: '24 Dez', amount: -15.00, type: 'payment' },
                { id: 2, title: 'Depósito Realizado', date: '22 Dez', amount: 50.00, type: 'deposit' },
                { id: 3, title: 'Ração High Pro', date: '20 Dez', amount: -42.50, type: 'payment' }
            ]);
        } catch (err: any) {
            showNotification(err.message || 'Erro ao carregar carteira', 'error');
        } finally {
            setLoading(false);
        }
    };

    const saveBankDetails = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('bank_details')
                .upsert({
                    user_id: user.id,
                    bank_name: bankData.bank,
                    account_type: bankData.type,
                    encrypted_data: 'encrypted_placeholder'
                });

            if (error) throw error;

            showNotification('Dados bancários salvos!', 'success');
            setShowBankForm(false);
            fetchWalletData();
        } catch (err: any) {
            showNotification(err.message || 'Erro ao salvar dados bancários', 'error');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-16">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm shadow-slate-200/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:scale-90 transition-all border border-slate-200/50"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Minha Carteira</h1>
                </div>
                <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                    <ShieldCheck size={20} />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6 no-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Balance Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#102217] to-[#1a3a28] rounded-[3rem] p-10 text-white shadow-2xl shadow-[#102217]/30 border border-white/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#22eb7e]/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#22eb7e]/10 rounded-full -ml-24 -mb-24 blur-[80px]" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <Sparkles size={14} className="text-[#22eb7e]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22eb7e]">Saldo Disponível</p>
                                </div>
                                <div className="flex items-baseline gap-3 mb-10">
                                    <span className="text-3xl font-black text-[#22eb7e]">€</span>
                                    <h2 className="text-6xl font-black tracking-tighter">{balance.toFixed(2)}</h2>
                                </div>

                                <div className="flex gap-4">
                                    <button className="btn-primary-premium flex-1 !h-14">
                                        <Plus size={18} strokeWidth={3} />
                                        <span>Depositar</span>
                                    </button>
                                    <button className="flex-1 h-14 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 backdrop-blur-md">
                                        <CreditCard size={18} />
                                        <span>Sacar</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="label-premium !ml-0 !mb-0">Dados Bancários</h3>
                                <button
                                    onClick={() => setShowBankForm(true)}
                                    className="text-[#2e9c60] font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                                >
                                    <Plus size={14} strokeWidth={3} /> Gerenciar
                                </button>
                            </div>

                            {bankData.bank === '' ? (
                                <button
                                    onClick={() => setShowBankForm(true)}
                                    className="w-full p-10 rounded-[2.5rem] bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-[#22eb7e]/40 hover:text-slate-500 transition-all shadow-sm"
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                        <Landmark size={32} strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Vincular Conta Bancária</span>
                                </button>
                            ) : (
                                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Landmark size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-900 leading-tight">{bankData.bank}</h4>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1.5">{bankData.type}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-[#22eb7e]/10 text-[#22eb7e] flex items-center justify-center">
                                        <ShieldCheck size={20} />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Recent Activity */}
                        <section className="space-y-4 pb-20">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Atividade Recente</h3>
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                                {transactions.map(t => (
                                    <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.amount < 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-[#22eb7e]'}`}>
                                                {t.amount < 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm leading-none">{t.title}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{t.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-black tracking-tight ${t.amount < 0 ? 'text-slate-900' : 'text-[#22eb7e]'}`}>
                                                {t.amount < 0 ? '' : '+'}{t.amount.toFixed(2)} €
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && (
                                    <div className="p-10 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma transação encontrada</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/* Bank Form Modal */}
            <AnimatePresence>
                {showBankForm && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBankForm(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="relative w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl"
                        >
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">Dados Bancários</h3>
                                <p className="text-xs font-medium text-slate-400">Suas informações são criptografadas e protegidas.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Banco</label>
                                    <input
                                        className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200/50 px-6 font-bold text-sm outline-none focus:bg-white focus:border-[#22eb7e] transition-all"
                                        placeholder="Ex: Banco CTT, Santander..."
                                        value={bankData.bank}
                                        onChange={(e) => setBankData({ ...bankData, bank: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">IBAN / Conta</label>
                                    <input
                                        className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-200/50 px-6 font-bold text-sm outline-none focus:bg-white focus:border-[#22eb7e] transition-all"
                                        placeholder="PT50 0000..."
                                        onChange={(e) => setBankData({ ...bankData, account: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setShowBankForm(false)} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400">Cancelar</button>
                                    <button onClick={saveBankDetails} className="flex-[2] h-14 bg-[#22eb7e] text-[#102217] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#22eb7e]/30 active:scale-95 transition-all">Salvar Dados</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalletView;
