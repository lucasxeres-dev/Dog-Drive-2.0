import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import {
    Heart,
    MessageCircle,
    Settings,
    Map as MapIcon,
    LayoutGrid
} from 'lucide-react';

interface BottomNavProps {
    preferences?: any;
    role?: string | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ preferences = {}, role }) => {
    const { t } = useTranslation();

    return (
        <nav className="shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 pb-8 pt-4 px-8 z-30">
            <div className="flex items-center justify-between max-w-md mx-auto relative cursor-pointer">
                <NavLink to="/feed" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Heart size={24} fill={window.location.hash.includes('/feed') ? "currentColor" : "none"} />
                    <span className="text-[9px] font-black uppercase tracking-wider">{t('match_tab')}</span>
                </NavLink>

                <NavLink to="/services" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
                    <LayoutGrid size={24} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Serviços</span>
                </NavLink>

                <NavLink to="/map" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
                    <MapIcon size={24} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Mapa</span>
                </NavLink>

                <NavLink to="/chats" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'} relative`}>
                    <MessageCircle size={24} />
                    <span className="text-[9px] font-black uppercase tracking-wider">{t('chat_tab')}</span>
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-900">2</div>
                </NavLink>

                <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Settings size={24} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Ajustes</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default BottomNav;
