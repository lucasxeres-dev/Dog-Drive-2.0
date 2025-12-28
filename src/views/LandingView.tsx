
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, LANGUAGES } from '../contexts/LanguageContext';
import { Dog, Globe, ArrowRight, X, Check, Sparkles } from 'lucide-react';

const LandingView: React.FC = () => {
    const navigate = useNavigate();
    const { language, setLanguage, t } = useTranslation();
    const [showAllLanguages, setShowAllLanguages] = useState(false);

    const selectLanguage = (lang: typeof LANGUAGES[0]['code']) => {
        setLanguage(lang);
        navigate('/login');
    };

    return (
        <div className="relative flex-1 flex flex-col bg-[#fdfdfd] h-screen overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[15%] -right-[15%] w-[500px] h-[500px] bg-[#22eb7e]/10 rounded-full blur-[120px] animate-pulse duration-[4000ms]"></div>
                <div className="absolute bottom-[10%] -left-[20%] w-[400px] h-[400px] bg-[#22eb7e]/5 rounded-full blur-[100px] animate-pulse duration-[6000ms]"></div>
            </div>

            <div className="flex-1 flex flex-col px-8 py-10 z-10 w-full max-w-lg mx-auto overflow-y-auto no-scrollbar justify-between">
                {/* Header */}
                <div className="flex flex-col items-center mt-12 animate-in fade-in zoom-in duration-1000">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#22eb7e]/20 rounded-[2.5rem] blur-3xl group-hover:bg-[#22eb7e]/30 transition-all duration-700 scale-90 group-hover:scale-110"></div>
                        <div className="relative w-28 h-28 bg-[#22eb7e] rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_60px_rgba(34,235,126,0.25)] transform rotate-2 hover:rotate-6 transition-all duration-700">
                            <Dog size={56} className="text-[#102217] stroke-[2.5]" />
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Sparkles size={16} className="text-[#22eb7e]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22eb7e]">Vibe Premium</span>
                        </div>
                        <h1 className="text-slate-900 text-6xl font-[900] tracking-tighter mb-4">
                            Dog Drive
                        </h1>
                        <p className="text-slate-500 text-lg font-bold max-w-[280px] leading-relaxed lowercase mx-auto opacity-70">
                            {t('landing_subtitle')}
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full space-y-8">
                    {!showAllLanguages ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="space-y-4">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] text-center">
                                    {t('choose_lang')}
                                </p>

                                <button
                                    onClick={() => setShowAllLanguages(true)}
                                    className="w-full bg-white rounded-[2.5rem] p-2 border border-slate-100 transition-all duration-500 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 group overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22eb7e]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1500ms]"></div>
                                    <div className="flex items-center gap-5 px-6 min-h-[80px] justify-between relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="flex items-center justify-center rounded-2xl bg-slate-50 shrink-0 size-16 text-4xl shadow-inner group-hover:scale-105 transition-transform duration-500">
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
                                        <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#22eb7e] group-hover:text-[#102217] text-slate-400 transition-all duration-500">
                                            <Globe size={20} />
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="btn-primary-premium w-full !py-8 !text-lg !tracking-[0.2em]"
                            >
                                {t('get_started')}
                                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-700">
                            <div className="flex items-center justify-between mb-10 px-2">
                                <div>
                                    <h2 className="text-slate-900 text-3xl font-black tracking-tight">{t('select_language')}</h2>
                                    <div className="h-1.5 w-16 bg-[#22eb7e] mt-3 rounded-full"></div>
                                </div>
                                <button
                                    onClick={() => setShowAllLanguages(false)}
                                    className="size-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-95 text-slate-500"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                {LANGUAGES.map((lang, index) => (
                                    <button
                                        key={lang.code}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setShowAllLanguages(false);
                                        }}
                                        className={`w-full text-left p-5 rounded-[2rem] transition-all flex items-center justify-between border-2 animate-in fade-in slide-in-from-left-4 ${language === lang.code
                                            ? 'bg-[#22eb7e]/5 border-[#22eb7e] shadow-lg shadow-[#22eb7e]/5'
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
                                            <div className="size-8 rounded-full bg-[#22eb7e] flex items-center justify-center shadow-lg shadow-[#22eb7e]/30">
                                                <Check size={18} className="text-[#102217] stroke-[3]" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Copy */}
                <div className="mt-auto pt-16 pb-4">
                    <p className="text-center text-slate-300 text-[10px] font-black tracking-[0.3em] uppercase">
                        © 2024 Dog Drive • Premium Pet Cloud
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LandingView;
