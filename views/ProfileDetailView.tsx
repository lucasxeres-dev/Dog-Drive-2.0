
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_DOGS } from '../constants';
import { useTranslation } from '../LanguageContext';

const ProfileDetailView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { id } = useParams();
    const dog = MOCK_DOGS.find(d => d.id === id) || MOCK_DOGS[0];

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-10">
            <div className="fixed top-0 left-0 w-full z-30 p-4 pt-6 flex items-center bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </div>

            <div className="relative w-full h-[50vh] overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${dog.imageUrl})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent"></div>
            </div>

            <div className="px-5 -mt-12 relative z-20">
                <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-xl border border-white/50 dark:border-white/5">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h1 className="text-3xl font-extrabold">{dog.name}, {dog.age}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">{dog.breed}</span>
                                {dog.is_castrated && (
                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider ml-2">Castrated</span>
                                )}
                                <div className="flex items-center gap-1 text-slate-500 text-sm">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                    <span>{dog.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    <section>
                        <h2 className="text-lg font-bold mb-2">{t('about')} {dog.name}</h2>
                        <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm font-medium">{dog.bio}</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3">{t('traits')}</h2>
                        <div className="flex flex-wrap gap-2">
                            {dog.traits.map(trait => (
                                <span key={trait} className="px-4 py-2 rounded-full bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 text-slate-700 dark:text-gray-200 text-xs font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                    {trait}
                                </span>
                            ))}
                        </div>
                    </section>

                    <div className="pt-4 flex items-center justify-center gap-6">
                        <button onClick={() => navigate(-1)} className="size-16 rounded-full bg-white dark:bg-surface-dark shadow-lg flex items-center justify-center text-red-500 border border-red-50 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                        <button onClick={() => navigate('/chats')} className="size-20 rounded-full bg-primary shadow-xl flex items-center justify-center text-black active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-4xl fill-1">favorite</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetailView;
