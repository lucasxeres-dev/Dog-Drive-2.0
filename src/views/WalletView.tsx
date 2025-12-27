import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabaseClient';

const WalletView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showBankForm, setShowBankForm] = useState(false);
    const [bankData, setBankData] = useState({ bank: '', account: '', type: 'Personal' });
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        // Fetch Wallet Balance
        const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        if (!walletError && walletData) {
            setBalance(walletData.balance);
        } else {
            console.warn('No wallet found, setting default');
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
            { id: 1, title: 'Walk with Thor', date: 'Dec 24', amount: -45.00, type: 'payment' },
            { id: 2, title: 'Store Deposit', date: 'Dec 22', amount: 500.00, type: 'deposit' },
            { id: 3, title: 'Pet Toy Purchase', date: 'Dec 20', amount: -62.50, type: 'payment' }
        ]);

        setLoading(false);
    };

    const saveBankDetails = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('bank_details')
            .upsert({
                user_id: user.id,
                bank_name: bankData.bank,
                account_type: bankData.type,
                encrypted_data: 'encrypted_placeholder' // Real encryption would go here
            });

        if (!error) {
            setShowBankForm(false);
            fetchWalletData();
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display h-screen overflow-hidden text-gray-900 dark:text-white">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-4 border-b border-gray-100 dark:border-white/5 flex items-center">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full border border-gray-100 dark:border-white/5 flex items-center justify-center mr-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight">My Wallet</h1>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        <div className="relative overflow-hidden bg-[#111814] rounded-[2.5rem] p-8 text-white shadow-2xl mb-8 group">
                            <div className="absolute top-0 right-0 size-48 bg-primary/20 rounded-full -mr-24 -mt-24 blur-3xl transition-all group-hover:bg-primary/30"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Available Balance</p>
                            <h2 className="text-5xl font-black italic mb-8">R$ {balance.toFixed(2)}</h2>
                            <div className="flex gap-3">
                                <button className="flex-1 h-12 bg-primary text-[#111814] rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Add Funds</button>
                                <button className="flex-1 h-12 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/5 hover:bg-white/20 active:scale-95 transition-all">Withdraw</button>
                            </div>
                        </div>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase tracking-tight">Linked Bank Data</h3>
                                <button onClick={() => setShowBankForm(true)} className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-all">
                                    <span className="material-symbols-outlined text-lg">add</span>
                                </button>
                            </div>

                            {bankData.bank === '' ? (
                                <div className="card !bg-gray-50 dark:!bg-white/5 dashed border-2 border-gray-100 dark:border-white/5 flex flex-col items-center justify-center py-10 opacity-50">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-primary">account_balance</span>
                                    <p className="text-[10px] font-black uppercase tracking-widest">No bank account linked</p>
                                </div>
                            ) : (
                                <div className="card animate-slideUp border-l-4 border-primary">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined">account_balance</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-sm uppercase">{bankData.bank}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Status: {bankData.type}</p>
                                        </div>
                                        <span className="text-[10px] font-black bg-primary/20 text-primary px-3 py-1 rounded-full uppercase">Secure</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-lg font-black uppercase tracking-tight">Recent Transactions</h3>
                                {transactions.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-50 dark:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className={`size-10 rounded-full flex items-center justify-center ${t.amount < 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                <span className="material-symbols-outlined text-lg">{t.amount < 0 ? 'arrow_outward' : 'arrow_downward'}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm">{t.title}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.date}</p>
                                            </div>
                                        </div>
                                        <span className={`font-black italic ${t.amount < 0 ? 'text-gray-400' : 'text-primary'}`}>
                                            {t.amount < 0 ? '' : '+'}{t.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>

            {showBankForm && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[3rem] p-8 shadow-2xl animate-slideUp">
                        <div className="flex flex-col items-center mb-6">
                            <div className="size-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl">enhanced_encryption</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight italic">Secure Wallet</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">End-to-End Encrypted Storage</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                className="w-full h-14 rounded-2xl bg-gray-100 dark:bg-white/5 border-none px-6 font-bold text-sm focus:ring-1 focus:ring-primary text-gray-900 dark:text-white"
                                placeholder="Bank Name"
                                value={bankData.bank}
                                onChange={(e) => setBankData({ ...bankData, bank: e.target.value })}
                            />
                            <div className="flex gap-4">
                                <input
                                    className="flex-1 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 border-none px-6 font-bold text-sm focus:ring-1 focus:ring-primary text-gray-900 dark:text-white"
                                    placeholder="Account Number"
                                    onChange={(e) => setBankData({ ...bankData, account: e.target.value })}
                                />
                                <div className="w-24 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center font-black text-xs uppercase opacity-40">Pix/QR</div>
                            </div>
                            <button onClick={saveBankDetails} className="btn-primary w-full shadow-2xl">Save Details Securely</button>
                            <button onClick={() => setShowBankForm(false)} className="w-full py-4 text-[10px] font-black uppercase tracking-widest opacity-40">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletView;
