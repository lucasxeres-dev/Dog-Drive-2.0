
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../LanguageContext';

const BottomNav: React.FC = () => {
    const { t } = useTranslation();

    return (
        <nav className="shrink-0 bg-white dark:bg-[#102217] border-t border-gray-100 dark:border-white/5 pb-8 pt-3 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-30">
            <div className="flex items-center justify-between max-w-md mx-auto">
                <NavLink to="/feed" className={({ isActive }) => `flex flex-col items-center gap-1 group w-12 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <span className="material-symbols-outlined text-3xl font-bold">style</span>
                    <span className="text-[10px] font-bold uppercase">{t('match_tab')}</span>
                </NavLink>

                <NavLink to="/services" className={({ isActive }) => `flex flex-col items-center gap-1 group w-12 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <span className="material-symbols-outlined text-3xl">pets</span>
                    <span className="text-[10px] font-bold uppercase">{t('services_tab')}</span>
                </NavLink>

                <NavLink to="/chats" className={({ isActive }) => `flex flex-col items-center gap-1 group w-12 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'} relative`}>
                    <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                    <span className="text-[10px] font-bold uppercase">{t('chat_tab')}</span>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-[#111814]">2</span>
                </NavLink>

                <NavLink to="/emergency" className={({ isActive }) => `flex flex-col items-center gap-1 group w-12 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <span className="material-symbols-outlined text-3xl">warning</span>
                    <span className="text-[10px] font-bold uppercase">{t('help_tab')}</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default BottomNav;
