import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`shimmer rounded-xl ${className}`} />
);

export const PremiumSkeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-100 ${className}`}>
        <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
    </div>
);

export const PremiumButton: React.FC<{
    onClick?: () => void;
    variant?: 'primary' | 'dark' | 'ghost';
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
}> = ({ onClick, variant = 'primary', children, className = '', disabled, loading, type = 'button' }) => {
    const variantClass = variant === 'primary' ? 'btn-primary-premium' : variant === 'dark' ? 'btn-dark-premium' : 'btn-ghost-premium';

    return (
        <motion.button
            type={type}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${variantClass} ${className} relative overflow-hidden group`}
        >
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center"
                    >
                        <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
        </motion.button>
    );
};

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
        <div className="size-28 bg-[#22eb7e]/5 rounded-[3.5rem] flex items-center justify-center text-[#22eb7e] mb-8 shadow-inner border border-[#22eb7e]/10">
            {icon}
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-3">{title}</h3>
        <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed mb-10">{description}</p>
        {action && (
            <PremiumButton onClick={action.onClick} variant="dark" className="!w-auto px-10">
                {action.label}
            </PremiumButton>
        )}
    </motion.div>
);

export const LoadingOverlay: React.FC = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-white/80 backdrop-blur-2xl flex flex-col items-center justify-center"
    >
        <div className="relative">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="size-16 border-4 border-[#22eb7e]/10 border-t-[#22eb7e] rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-8 bg-[#22eb7e] rounded-xl animate-pulse" />
            </div>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Dog Drive</p>
    </motion.div>
);

export const GlassCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}> = ({ children, className = '', onClick, hover = true }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5, scale: 1.02, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={onClick}
            className={`
                relative bg-white/70 backdrop-blur-xl border border-white/40 
                rounded-[2.5rem] p-6 shadow-sm shadow-slate-200/50 
                overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}
            `}
        >
            {/* Glossy Reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};
