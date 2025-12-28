import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-slate-200 animate-pulse rounded-xl ${className}`} />
);

export const EmptyState: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}> = ({ icon, title, description, action }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 text-center"
    >
        <div className="size-24 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-300 mb-6 shadow-inner">
            {icon}
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 max-w-[240px] leading-relaxed mb-8">{description}</p>
        {action && (
            <button
                onClick={action.onClick}
                className="px-8 h-12 bg-[#102217] text-[#22eb7e] rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl shadow-[#102217]/10"
            >
                {action.label}
            </button>
        )}
    </motion.div>
);
