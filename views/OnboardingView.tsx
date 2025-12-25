
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useTranslation } from '../LanguageContext';
import { supabase } from '../supabaseClient';

interface OnboardingViewProps {
    onSelectRole: (role: string) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onSelectRole }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.OWNER);

    // Form data
    const [dogData, setDogData] = useState({
        name: '',
        age: '',
        traits: '',
        request: '',
        photo: ''
    });
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('pet-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('pet-photos')
                .getPublicUrl(filePath);

            setDogData({ ...dogData, photo: data.publicUrl });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao enviar imagem. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const handleNext = () => {
        if (step === 0) {
            setStep(1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        // Update profile role
        await supabase.from('profiles').update({
            role: selectedRole === UserRole.OWNER ? 'user' : 'provider'
        }).eq('id', user.id);

        // If owner, save dog
        if (selectedRole === UserRole.OWNER) {
            await supabase.from('dogs').insert({
                owner_id: user.id,
                name: dogData.name,
                age: dogData.age,
                image_url: dogData.photo,
                traits: dogData.traits,
                request_instructions: dogData.request,
                location: 'Rio de Janeiro' // default
            });
        }

        onSelectRole(selectedRole);
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
                {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center border border-gray-100 dark:border-white/10 mr-4">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                )}
                <div className="flex-1 text-center font-bold opacity-60">
                    {step === 0 ? 'Dog Drive' : selectedRole === UserRole.OWNER ? t('owner') : t('walker')}
                </div>
                {step === 0 && <div className="w-10" />}
            </header>

            {step === 0 ? (
                // Step 0: Role Selection
                <>
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
                                    checked={selectedRole === role.id}
                                    onChange={() => setSelectedRole(role.id as UserRole)}
                                />
                                <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-sm border-2 border-transparent peer-checked:border-primary transition-all">
                                    <div className="flex items-center justify-center rounded-2xl bg-[#f0f5f2] dark:bg-[#25382c] peer-checked:bg-primary/20 shrink-0 size-14">
                                        <span className={`material-symbols-outlined text-[28px] ${selectedRole === role.id ? 'text-primary' : 'text-gray-400'}`}>{role.icon}</span>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <h3 className="text-lg font-bold">{role.title}</h3>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedRole === role.id ? 'bg-primary border-primary' : 'border-gray-200 dark:border-white/20'}`}>
                                        {selectedRole === role.id && <span className="material-symbols-outlined text-[16px] text-[#102217] font-bold">check</span>}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </>
            ) : selectedRole === UserRole.OWNER ? (
                // Step 1: Owner (Dog Info)
                <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black mb-2 animate-slideUp">Cadastre seu Cão 🦴</h1>
                        <p className="text-gray-500 font-medium">Conte-nos um pouco sobre seu melhor amigo.</p>
                    </div>

                    <div className="space-y-5">
                        <div className="group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('pet_name')}</label>
                            <input
                                type="text"
                                value={dogData.name}
                                onChange={e => setDogData({ ...dogData, name: e.target.value })}
                                placeholder="ex: Max"
                                className="w-full h-16 bg-white dark:bg-surface-dark rounded-3xl px-6 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('pet_age')}</label>
                                <input
                                    type="text"
                                    value={dogData.age}
                                    onChange={e => setDogData({ ...dogData, age: e.target.value })}
                                    placeholder="ex: 3 anos"
                                    className="w-full h-16 bg-white dark:bg-surface-dark rounded-3xl px-6 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('pet_photo')}</label>
                            <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-surface-dark rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 transition-all hover:border-primary/50">
                                {dogData.photo ? (
                                    <div className="relative group">
                                        <img src={dogData.photo} alt="Preview" className="size-40 rounded-2xl object-cover shadow-lg" />
                                        <button
                                            onClick={() => setDogData({ ...dogData, photo: '' })}
                                            className="absolute -top-2 -right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center cursor-pointer w-full py-4">
                                        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            {uploading ? (
                                                <div className="size-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <span className="material-symbols-outlined text-3xl text-primary">add_a_photo</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-gray-500">{uploading ? 'Enviando...' : 'Clique para subir a foto'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('pet_traits')}</label>
                            <textarea
                                value={dogData.traits}
                                onChange={e => setDogData({ ...dogData, traits: e.target.value })}
                                placeholder="ex: Muito dócil, medo de fogos..."
                                className="w-full h-32 bg-white dark:bg-surface-dark rounded-3xl p-6 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-sm resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('pet_request')}</label>
                            <textarea
                                value={dogData.request}
                                onChange={e => setDogData({ ...dogData, request: e.target.value })}
                                placeholder="ex: Procuro alguém para passeio educativo"
                                className="w-full h-32 bg-white dark:bg-surface-dark rounded-3xl p-6 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-sm resize-none"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                // Step 1: Walker
                <div className="space-y-6 animate-fadeIn text-center py-10">
                    <div className="size-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-primary/10">
                        <span className="material-symbols-outlined text-6xl text-primary animate-bounce">directions_walk</span>
                    </div>
                    <h1 className="text-3xl font-black mb-4">Seja um Passeador!</h1>
                    <p className="text-gray-500 font-medium px-6">
                        Ao finalizar, você poderá configurar seu perfil de serviços, preços e disponibilidade na aba de perfil.
                    </p>
                    <div className="p-6 bg-white dark:bg-surface-dark rounded-3xl border-2 border-primary/20 shadow-xl shadow-primary/5 mx-4 mt-8">
                        <p className="text-sm font-bold text-primary italic">"Cuidar de um cão é espalhar felicidade."</p>
                    </div>
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light dark:from-background-dark pt-12">
                <button
                    onClick={handleNext}
                    className="w-full h-16 bg-primary text-[#102217] text-lg font-black rounded-3xl shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                    <span>{step === 0 ? t('continue') : t('finish_btn')}</span>
                    <span className="material-symbols-outlined font-black">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default OnboardingView;
