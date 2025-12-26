
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../LanguageContext';

const BottomNav: React.FC = () => {
    const { t } = useTranslation();

    return (
        <nav className="shrink-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 pb-8 pt-4 px-8 z-30">
            <div className="flex items-center justify-between max-w-md mx-auto relative">
                <NavLink to="/feed" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-gray-400'}`}>
                    <span className="material-symbols-outlined text-2xl font-bold">style</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{t('match_tab')}</span>
                </NavLink>

                <NavLink to="/services" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-gray-400'}`}>
                    <span className="material-symbols-outlined text-2xl font-bold">pets</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{t('services_tab')}</span>
                </NavLink>

                <NavLink to="/chats" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-gray-400'} relative`}>
                    <span className="material-symbols-outlined text-2xl font-bold">chat_bubble</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{t('chat_tab')}</span>
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-[#111814] ring-2 ring-white dark:ring-background-dark">2</div>
                </NavLink>

                <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-gray-400'}`}>
                    <span className="material-symbols-outlined text-2xl font-bold">settings</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{t('help_tab')}</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default BottomNav;
