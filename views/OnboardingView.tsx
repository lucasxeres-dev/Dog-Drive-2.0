
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useTranslation } from '../LanguageContext';

interface OnboardingViewProps {
    onSelectRole: (role: string) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onSelectRole }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [selected, setSelected] = useState<UserRole>(UserRole.OWNER);

    const handleContinue = () => {
        onSelectRole(selected);
        navigate('/feed');
    };

    const roles = [
        { id: UserRole.OWNER, title: t('owner'), icon: 'pets' },
        { id: UserRole.WALKER, title: t('walker'), icon: 'directions_walk' },
        { id: UserRole.BUSINESS, title: t('business'), icon: 'storefront' }
    ];

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display p-6 overflow-y-auto pb-32">
            <header className="flex items-center mb-8">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center border border-gray-100 dark:border-white/10">
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <div className="flex-1 text-center pr-10 font-bold opacity-60">Dog Drive</div>
            </header>

            <div className="mb-8">
                <h1 className="text-[32px] font-extrabold leading-tight mb-3">{t('onboarding_title')}</h1>
                <p className="text-[#608a72] dark:text-[#a1b8aa] text-base font-medium">{t('onboarding_sub')}</p>
            </div>

            <div className="flex flex-col gap-4">
                {roles.map((role) => (
                    <label key={role.id} className="cursor-pointer group">
                        <input 
                            type="radio" 
                            className="sr-only peer" 
                            name="role" 
                            checked={selected === role.id} 
                            onChange={() => setSelected(role.id)} 
                        />
                        <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border-2 border-transparent peer-checked:border-primary transition-all">
                            <div className="flex items-center justify-center rounded-full bg-[#f0f5f2] dark:bg-[#25382c] peer-checked:bg-primary/20 shrink-0 size-14">
                                <span className={`material-symbols-outlined text-[28px] ${selected === role.id ? 'text-primary' : 'text-gray-400'}`}>{role.icon}</span>
                            </div>
                            <div className="flex flex-col flex-1">
                                <h3 className="text-lg font-bold">{role.title}</h3>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected === role.id ? 'bg-primary border-primary' : 'border-gray-200 dark:border-white/20'}`}>
                                {selected === role.id && <span className="material-symbols-outlined text-[16px] text-[#102217] font-bold">check</span>}
                            </div>
                        </div>
                    </label>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light dark:from-background-dark pt-12">
                <button onClick={handleContinue} className="w-full h-14 bg-primary text-[#102217] text-lg font-bold rounded-full shadow-lg active:scale-95 transition-all">
                    {t('continue')}
                </button>
            </div>
        </div>
    );
};

export default OnboardingView;
