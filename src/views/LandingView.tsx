
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, LANGUAGES } from '../contexts/LanguageContext';

const LandingView: React.FC = () => {
    const navigate = useNavigate();
    const { language, setLanguage, t } = useTranslation();
    const [showAllLanguages, setShowAllLanguages] = useState(false);

    const selectLanguage = (lang: typeof LANGUAGES[0]['code']) => {
        setLanguage(lang);
        navigate('/login');
    };

    // Show first 3 languages by default, all when expanded
    const displayLanguages = showAllLanguages ? LANGUAGES : LANGUAGES.slice(0, 3);

    return (
        <div className="relative flex-1 flex flex-col bg-[#fdfdfd] dark:bg-[#050705] font-sans overflow-hidden">
            {/* Ambient Background Glows - Refined */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[15%] -right-[15%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse duration-[4000ms]"></div>
                <div className="absolute bottom-[10%] -left-[20%] w-72 h-72 bg-primary/10 rounded-full blur-[80px] animate-pulse duration-[6000ms]"></div>
                <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-full h-[50%] bg-gradient-to-b from-transparent via-primary/5 to-transparent blur-3xl opacity-50"></div>
            </div>

            <div className="flex-1 flex flex-col px-8 py-10 z-10 w-full max-w-lg mx-auto overflow-y-auto no-scrollbar">
                {/* Header - More Premium Logo */}
                <div className="flex flex-col items-center mt-10 mb-12 animate-in fade-in zoom-in duration-700">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/30 rounded-[2rem] blur-2xl group-hover:bg-primary/40 transition-all duration-500 scale-90 group-hover:scale-110"></div>
                        <div className="relative w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(39,241,123,0.3)] transform rotate-3 hover:rotate-6 transition-transform duration-500">
                            <span className="material-symbols-outlined text-[#050705] text-[48px] font-black drop-shadow-sm">pets</span>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <h1 className="text-[#0a0d0b] dark:text-white text-5xl font-[800] tracking-tight mb-3">
                            Dog Drive
                        </h1>
                        <p className="text-gray-500/80 dark:text-gray-400/80 text-base font-medium max-w-[280px] leading-relaxed lowercase mx-auto">
                            {t('landing_subtitle')}
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full flex-1 flex flex-col justify-center">
                    {!showAllLanguages ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="space-y-4">
                                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.25em] text-center opacity-80">
                                    {t('choose_lang')}
                                </p>

                                <button
                                    onClick={() => setShowAllLanguages(true)}
                                    className="w-full bg-white dark:bg-white/5 backdrop-blur-xl rounded-[2rem] p-1.5 border border-gray-100 dark:border-white/10 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] group overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                    <div className="flex items-center gap-4 px-5 min-h-[72px] justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 shrink-0 size-14 text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                                                {LANGUAGES.find(l => l.code === language)?.flag}
                                            </div>
                                            <div className="flex flex-col items-start leading-none">
                                                <span className="text-[#0a0d0b] dark:text-white text-lg font-bold">
                                                    {LANGUAGES.find(l => l.code === language)?.nativeName}
                                                </span>
                                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1.5 opacity-60">
                                                    {t('select_language')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="size-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                                            <span className="material-symbols-outlined text-gray-400 group-hover:text-[#050705] transition-colors text-xl">
                                                language
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-primary text-[#050705] py-6 rounded-[2rem] font-black text-base uppercase tracking-[0.15em] shadow-[0_20px_50px_rgba(39,241,123,0.3)] hover:shadow-[0_25px_60px_rgba(39,241,123,0.45)] transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 group"
                            >
                                {t('get_started')}
                                <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-500 pt-4">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-[#0a0d0b] dark:text-white text-2xl font-[800] tracking-tight">{t('select_language')}</h2>
                                    <div className="h-1 w-12 bg-primary mt-2 rounded-full"></div>
                                </div>
                                <button
                                    onClick={() => setShowAllLanguages(false)}
                                    className="size-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-all active:scale-90"
                                >
                                    <span className="material-symbols-outlined text-gray-500 text-xl">close</span>
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
                                {LANGUAGES.map((lang, index) => (
                                    <button
                                        key={lang.code}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setShowAllLanguages(false);
                                        }}
                                        className={`w-full text-left p-4 rounded-[1.5rem] transition-all flex items-center justify-between border-2 animate-in fade-in slide-in-from-left-4 ${language === lang.code
                                                ? 'bg-primary/10 border-primary shadow-sm'
                                                : 'bg-white dark:bg-white/5 border-transparent hover:border-gray-100 dark:hover:border-white/10 hover:bg-gray-50/50 dark:hover:bg-white/[0.08]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <span className="text-3xl drop-shadow-sm filter grayscale-[0.2] group-hover:grayscale-0 transition-all">{lang.flag}</span>
                                            <div>
                                                <div className="text-[#0a0d0b] dark:text-white font-bold text-base leading-tight">{lang.nativeName}</div>
                                                <div className="text-gray-400 text-[11px] font-bold uppercase tracking-wider opacity-60 mt-0.5">{lang.name}</div>
                                            </div>
                                        </div>
                                        {language === lang.code && (
                                            <div className="size-6 rounded-full bg-primary flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[#050705] text-base font-bold">check</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Copy */}
                <div className="mt-12 opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <p className="text-center text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                        © 2024 Dog Drive • Premuim Pet Cloud
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LandingView;
