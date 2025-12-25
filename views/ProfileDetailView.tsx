
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Dog } from '../types';

const ProfileDetailView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { id } = useParams();
    const [dog, setDog] = React.useState<Dog | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDog = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from('dogs')
                .select('*')
                .eq('id', id)
                .single();

            if (data) setDog(data as Dog);
            setLoading(false);
        };
        fetchDog();
    }, [id]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!dog) return (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <h1 className="text-2xl font-bold mb-4">Pet não encontrado</h1>
            <button onClick={() => navigate(-1)} className="px-6 py-3 bg-primary rounded-full font-bold">Voltar</button>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-10">
            <div className="fixed top-0 left-0 w-full z-30 p-4 pt-6 flex items-center bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </div>

            <div className="relative w-full h-[50vh] overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${dog.image_url})` }}></div>
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
                        <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm font-medium">{dog.description || dog.request_instructions || 'Nenhuma descrição fornecida.'}</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold mb-3">{t('traits')}</h2>
                        <div className="flex flex-wrap gap-2">
                            {(Array.isArray(dog.traits) ? dog.traits : (dog.traits?.split(',') || [])).map(trait => (
                                <span key={trait} className="px-4 py-2 rounded-full bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 text-slate-700 dark:text-gray-200 text-xs font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                    {trait.trim()}
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
