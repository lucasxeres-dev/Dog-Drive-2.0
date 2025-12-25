
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../LanguageContext';

const ServicesView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const categories = [
        { id: '1', title: t('walking_cat'), icon: 'directions_walk', image: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?q=80&w=600&auto=format&fit=crop' },
        { id: '2', title: t('boarding_cat'), icon: 'home', image: 'https://images.unsplash.com/photo-1541591047357-9191ff29fe2b?q=80&w=600&auto=format&fit=crop' },
        { id: '3', title: t('grooming_cat'), icon: 'content_cut', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=600&auto=format&fit=crop' },
        { id: '4', title: t('vet_cat'), icon: 'medical_services', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=600&auto=format&fit=crop' },
        { id: '5', title: t('marketplace_cat'), icon: 'storefront', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=600&auto=format&fit=crop' }
    ];

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display overflow-hidden">
            <header className="flex items-center p-5 justify-between bg-background-light/90 dark:bg-background-dark/90 sticky top-0 z-10">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold tracking-tight">Dog Drive</h2>
                    <span className="text-xs font-medium text-slate-500">{t('services_top_sub')}</span>
                </div>
                <button className="flex items-center justify-center rounded-full h-10 w-10 bg-white dark:bg-surface-dark border border-slate-200">
                    <span className="material-symbols-outlined">person</span>
                </button>
            </header>

            <div className="px-5 py-2">
                <div className="flex w-full items-center rounded-2xl h-14 bg-white dark:bg-surface-dark shadow-sm border border-slate-100">
                    <span className="material-symbols-outlined pl-4 text-slate-400">search</span>
                    <input className="flex-1 bg-transparent border-none focus:ring-0 text-base font-medium px-2" placeholder={t('search_placeholder')} />
                    <span className="material-symbols-outlined pr-4 text-primary">tune</span>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-5 pt-4 no-scrollbar">
                <h1 className="text-3xl font-bold leading-tight mb-6">
                    {t('services_title').split('?')[0]} <br />
                    <span className="text-primary">{t('services_title').split('?')[1] || ''}</span>
                </h1>

                <div className="grid grid-cols-2 gap-4 pb-8">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => cat.id === '5' ? navigate('/marketplace') : navigate('/walkers')}
                            className="group relative flex flex-col items-center justify-end overflow-hidden rounded-2xl aspect-[4/5] bg-surface-dark shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${cat.image})` }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent"></div>
                            <div className="relative z-10 p-4 w-full">
                                <div className="inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-primary text-[#102217]">
                                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                                </div>
                                <h3 className="text-white text-lg font-bold leading-none">{cat.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ServicesView;
