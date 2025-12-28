import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, LANGUAGES } from '../contexts/LanguageContext';
import { Dog, Globe, ArrowRight, X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumButton } from '../components/UIComponents';

const LandingView: React.FC = () => {
    const navigate = useNavigate();
    const { language, setLanguage, t } = useTranslation();
    const [showAllLanguages, setShowAllLanguages] = useState(false);

    const selectLanguage = (lang: typeof LANGUAGES[0]['code']) => {
        setLanguage(lang);
        navigate('/login');
    };

    return (
        <div className="relative flex-1 flex flex-col bg-white h-screen overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -right-20 size-[600px] bg-[#22eb7e]/5 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-40 -left-20 size-[500px] bg-[#22eb7e]/3 rounded-full blur-[100px]"
                />
            </div>

            <div className="flex-1 flex flex-col px-8 py-10 z-10 w-full max-w-lg mx-auto overflow-y-auto no-scrollbar relative">
                {/* Brand Section */}
                <div className="flex flex-col items-center mt-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 2 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-[#22eb7e]/20 rounded-[2.5rem] blur-3xl scale-90" />
                        <div className="relative size-32 bg-[#22eb7e] rounded-[2.5rem] flex items-center justify-center shadow-glow animate-float">
                            <Dog size={64} className="text-[#102217] stroke-[2.5]" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-12 text-center"
                    >
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="h-px w-8 bg-slate-100" />
                            <Sparkles size={14} className="text-[#22eb7e]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#22eb7e]">Vibe Premium</span>
                            <div className="h-px w-8 bg-slate-100" />
                        </div>
                        <h1 className="text-[#102217] text-7xl font-black tracking-tighter mb-4 leading-none">
                            Dog Drive
                        </h1>
                        <p className="text-slate-400 text-lg font-bold max-w-[280px] leading-relaxed lowercase mx-auto">
                            {t('landing_subtitle')}
                        </p>
                    </motion.div>
                </div>

                {/* Interaction Section */}
                <div className="mt-16 w-full space-y-10">
                    <AnimatePresence mode="wait">
                        {!showAllLanguages ? (
                            <motion.div
                                key="main-cta"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] text-center">
                                        {t('choose_lang')}
                                    </p>

                                    <button
                                        onClick={() => setShowAllLanguages(true)}
                                        className="w-full bg-white rounded-[2.5rem] p-3 border-2 border-slate-50 transition-all duration-500 hover:border-[#22eb7e]/20 group relative overflow-hidden active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-5 px-6 min-h-[80px] justify-between relative z-10">
                                            <div className="flex items-center gap-5">
                                                <div className="flex items-center justify-center rounded-2xl bg-slate-50 size-16 text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                    {LANGUAGES.find(l => l.code === language)?.flag}
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-slate-900 text-xl font-black tracking-tight">
                                                        {LANGUAGES.find(l => l.code === language)?.nativeName}
                                                    </span>
                                                    <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">
                                                        {t('select_language')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#22eb7e] group-hover:text-[#102217] text-slate-300 transition-all duration-500">
                                                <Globe size={18} />
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                <PremiumButton
                                    onClick={() => navigate('/login')}
                                    className="w-full !h-20 !text-xl !tracking-[0.2em]"
                                >
                                    {t('get_started')}
                                    <ArrowRight size={24} className="ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                                </PremiumButton>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="lang-selection"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, y: 40 }}
                                className="flex-1 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-slate-900 text-3xl font-black tracking-tight">{t('select_language')}</h2>
                                    <button
                                        onClick={() => setShowAllLanguages(false)}
                                        className="size-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-95 text-slate-400 border border-slate-100"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="grid gap-3 max-h-[380px] overflow-y-auto pr-2 no-scrollbar mask-fade">
                                    {LANGUAGES.map((lang, index) => (
                                        <motion.button
                                            key={lang.code}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setShowAllLanguages(false);
                                            }}
                                            className={`w-full text-left p-6 rounded-[2rem] transition-all flex items-center justify-between border-2 ${language === lang.code
                                                ? 'bg-[#22eb7e]/5 border-[#22eb7e] shadow-glow'
                                                : 'bg-white border-slate-50 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <span className="text-4xl filter drop-shadow-md">{lang.flag}</span>
                                                <div>
                                                    <div className="text-slate-900 font-black text-lg leading-tight">{lang.nativeName}</div>
                                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">{lang.name}</div>
                                                </div>
                                            </div>
                                            {language === lang.code && (
                                                <div className="size-8 rounded-full bg-[#22eb7e] flex items-center justify-center shadow-lg">
                                                    <Check size={18} className="text-[#102217] stroke-[4]" />
                                                </div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Copy */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-auto pt-16 pb-4"
                >
                    <p className="text-center text-slate-200 text-[10px] font-black tracking-[0.4em] uppercase">
                        © 2024 Dog Drive • Premium Pet Cloud
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingView;
