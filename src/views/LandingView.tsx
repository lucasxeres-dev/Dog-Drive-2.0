
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';

const LandingView: React.FC = () => {
    const navigate = useNavigate();
    const { setLanguage, t } = useTranslation();

    const selectLanguage = (lang: 'pt' | 'en') => {
        setLanguage(lang);
        navigate('/login');
    };

    return (
        <div className="relative flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[20%] -left-[20%] w-48 h-48 bg-primary/10 rounded-full blur-[60px]"></div>
            </div>

            <div className="flex-1 flex flex-col justify-between px-8 py-12 z-10 w-full">
                <div className="flex flex-col items-center mt-12">
                    <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_10px_40px_rgba(175,255,30,0.3)] transform rotate-6 mb-8">
                        <span className="material-symbols-outlined text-[#050705] text-[40px] font-black">pets</span>
                    </div>
                    <h1 className="text-[#111814] dark:text-white text-5xl font-black mb-4">Dog Drive</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium text-center max-w-[240px] leading-tight lowercase">
                        {t('landing_subtitle')}
                    </p>
                </div>

                <div className="w-full space-y-4">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-center mb-4">{t('choose_lang')}</p>

                    <button
                        onClick={() => selectLanguage('pt')}
                        className="group w-full bg-white dark:bg-white/5 rounded-3xl p-1 border border-transparent hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl"
                    >
                        <div className="flex items-center gap-4 px-5 min-h-[72px] justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 shrink-0 size-12 text-2xl shadow-inner">🇧🇷</div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[#111814] dark:text-white text-lg font-black uppercase group-hover:text-primary transition-colors">Português</span>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tight mt-1 opacity-60">Brasil</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transform group-hover:translate-x-1 transition-all">chevron_right</span>
                        </div>
                    </button>

                    <button
                        onClick={() => selectLanguage('en')}
                        className="group w-full bg-white dark:bg-white/5 rounded-3xl p-1 border border-transparent hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl"
                    >
                        <div className="flex items-center gap-4 px-5 min-h-[72px] justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 shrink-0 size-12 text-2xl shadow-inner">🇺🇸</div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[#111814] dark:text-white text-lg font-black uppercase group-hover:text-primary transition-colors">English</span>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tight mt-1 opacity-60">United States</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transform group-hover:translate-x-1 transition-all">chevron_right</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingView;
