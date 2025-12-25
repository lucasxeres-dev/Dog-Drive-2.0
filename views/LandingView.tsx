
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../LanguageContext';

const LandingView: React.FC = () => {
    const navigate = useNavigate();
    const { setLanguage, t } = useTranslation();

    const selectLanguage = (lang: 'pt' | 'en') => {
        setLanguage(lang);
        navigate('/login');
    };

    return (
        <div className="relative flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute top-20 -left-20 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 z-10 w-full">
                <div className="w-full flex flex-col items-center mb-10">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-xl mb-8 group">
                        <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBwvPNgVm6qDW16MAKpmWlEisE_zjrqyhGRg0eqOCBokNPyLFnx6oKM2ZMfUdttzBPp62DmPi6r_vpHtNwYd1B7SMgNhO0PI5zQTAMKv8InSpqz7ZrptFeOjewD6-3F0Ip1hBx8c0ux9U8dahvEhF21R4ICkUiAbsJK4PZZ6jrAnqI6TBroOiE6LAET389XUVXGRX62vphZQPNKZPKq_eZlV5oBJvCKPOlPVStGn5fF7BYT4JsfkUDvcTzG3A0T49DnlgKrgZsTHhaE")' }}></div>
                        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                            <span className="material-symbols-outlined text-primary text-sm">pets</span>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100">Dog Drive</span>
                        </div>
                    </div>
                    <h1 className="text-[#111814] dark:text-white tracking-tight text-4xl font-extrabold leading-tight text-center mb-3">Dog Drive</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-relaxed text-center max-w-[280px]">
                        {t('landing_subtitle')}
                    </p>
                </div>

                <div className="w-full flex flex-col gap-4">
                    <h3 className="text-[#111814] dark:text-gray-200 tracking-tight text-lg font-bold leading-tight text-center mb-2">{t('choose_lang')}</h3>
                    
                    <button onClick={() => selectLanguage('pt')} className="group w-full bg-white dark:bg-white/5 rounded-lg p-1 border border-transparent hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-4 px-4 min-h-[64px] justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 shrink-0 size-10 text-2xl">🇧🇷</div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[#111814] dark:text-white text-lg font-semibold group-hover:text-primary transition-colors">Português</span>
                                    <span className="text-gray-400 text-sm">Brasil</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-300">arrow_forward_ios</span>
                        </div>
                    </button>

                    <button onClick={() => selectLanguage('en')} className="group w-full bg-white dark:bg-white/5 rounded-lg p-1 border border-transparent hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-4 px-4 min-h-[64px] justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 shrink-0 size-10 text-2xl">🇺🇸</div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[#111814] dark:text-white text-lg font-semibold group-hover:text-primary transition-colors">English</span>
                                    <span className="text-gray-400 text-sm">United States</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-300">arrow_forward_ios</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingView;
