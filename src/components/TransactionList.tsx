import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, RotateCcw, Gift, CheckCircle, Clock, XCircle } from 'lucide-react';
import { WalletTransaction, TransactionType } from '../types';
import { motion } from 'framer-motion';

interface TransactionListProps {
    transactions: WalletTransaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    const [filter, setFilter] = useState<'all' | TransactionType>('all');

    const filteredTransactions = filter === 'all'
        ? transactions
        : transactions.filter(t => t.type === filter);

    const getIcon = (type: TransactionType) => {
        switch (type) {
            case 'deposit': return ArrowDownLeft;
            case 'withdrawal': return ArrowUpRight;
            case 'payment': return ShoppingBag;
            case 'refund': return RotateCcw;
            case 'cashback': return Gift;
        }
    };

    const getColor = (type: TransactionType) => {
        switch (type) {
            case 'deposit': return 'text-[#22eb7e] bg-[#22eb7e]/10';
            case 'withdrawal': return 'text-orange-500 bg-orange-500/10';
            case 'payment': return 'text-blue-500 bg-blue-500/10';
            case 'refund': return 'text-purple-500 bg-purple-500/10';
            case 'cashback': return 'text-amber-500 bg-amber-500/10';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle size={14} className="text-[#22eb7e]" />;
            case 'pending': return <Clock size={14} className="text-amber-500" />;
            case 'failed':
            case 'cancelled':
                return <XCircle size={14} className="text-rose-500" />;
            default: return null;
        }
    };

    const getLabel = (type: TransactionType) => {
        switch (type) {
            case 'deposit': return 'Depósito';
            case 'withdrawal': return 'Saque';
            case 'payment': return 'Pagamento';
            case 'refund': return 'Reembolso';
            case 'cashback': return 'Cashback';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {['all', 'deposit', 'withdrawal', 'payment', 'cashback'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type as any)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === type
                                ? 'bg-[#22eb7e] text-[#102217] shadow-lg shadow-[#22eb7e]/30'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                    >
                        {type === 'all' ? 'Todos' : getLabel(type as TransactionType)}
                    </button>
                ))}
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-400 text-sm font-bold">Nenhuma transação encontrada</p>
                    </div>
                ) : (
                    filteredTransactions.map((transaction) => {
                        const Icon = getIcon(transaction.type);
                        const colorClass = getColor(transaction.type);
                        const isNegative = transaction.type === 'withdrawal' || transaction.type === 'payment';

                        return (
                            <motion.div
                                key={transaction.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-100 shadow-sm"
                            >
                                <div className={`size-12 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
                                    <Icon size={20} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-slate-900 text-sm">
                                            {getLabel(transaction.type)}
                                        </h4>
                                        {getStatusIcon(transaction.status)}
                                    </div>
                                    {transaction.description && (
                                        <p className="text-xs text-slate-400 font-medium truncate">
                                            {transaction.description}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-slate-300 font-bold mt-1">
                                        {new Date(transaction.created_at).toLocaleDateString('pt-PT', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div className={`font-black text-lg ${isNegative ? 'text-rose-500' : 'text-[#22eb7e]'}`}>
                                    {isNegative ? '-' : '+'}€{transaction.amount.toFixed(2)}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TransactionList;
