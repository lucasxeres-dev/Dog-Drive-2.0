
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
        <div className="relative flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[20%] -left-[20%] w-48 h-48 bg-primary/10 rounded-full blur-[60px]"></div>
            </div>

            <div className="flex-1 flex flex-col px-8 py-8 z-10 w-full overflow-y-auto">
                {/* Header */}
                <div className="flex flex-col items-center mt-6 mb-6">
                    <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-[0_10px_40px_rgba(175,255,30,0.3)] transform rotate-6 mb-5">
                        <span className="material-symbols-outlined text-[#050705] text-[32px] font-black">pets</span>
                    </div>
                    <h1 className="text-[#111814] dark:text-white text-4xl font-black mb-2">Dog Drive</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium text-center max-w-[220px] leading-tight lowercase">
                        {t('landing_subtitle')}
                    </p>
                </div>

                {/* Language Selector */}
                <div className="w-full flex-1 flex flex-col">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-center mb-4">
                        {t('select_language')}
                    </p>

                    <div className="space-y-3 flex-1">
                        {displayLanguages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => selectLanguage(lang.code)}
                                className={`group w-full bg-white dark:bg-white/5 rounded-2xl p-1 border-2 transition-all duration-300 shadow-sm hover:shadow-lg ${language === lang.code
                                        ? 'border-primary bg-primary/5'
                                        : 'border-transparent hover:border-primary/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3 px-4 min-h-[60px] justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 shrink-0 size-10 text-xl shadow-inner">
                                            {lang.flag}
                                        </div>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[#111814] dark:text-white text-base font-black group-hover:text-primary transition-colors">
                                                {lang.nativeName}
                                            </span>
                                            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-tight mt-0.5 opacity-60">
                                                {lang.name}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transform group-hover:translate-x-1 transition-all text-xl">
                                        chevron_right
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Show More / Show Less Button */}
                    <button
                        onClick={() => setShowAllLanguages(!showAllLanguages)}
                        className="w-full mt-4 py-3 text-primary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/5 rounded-xl transition-colors"
                    >
                        <span>{showAllLanguages ? 'Mostrar menos' : `+${LANGUAGES.length - 3} idiomas`}</span>
                        <span className="material-symbols-outlined text-sm">
                            {showAllLanguages ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingView;
