
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabaseClient';
import { Dog } from '../types';

const SettingsView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [preferences, setPreferences] = useState<any>({});
    const [showAddDog, setShowAddDog] = useState(false);

    // New dog state
    const [newDog, setNewDog] = useState({
        name: '',
        age: '',
        traits: '',
        photo: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const { data: dogsData } = await supabase.from('dogs').select('*').eq('owner_id', user.id);

        setProfile(profileData);
        setPreferences(profileData?.preferences || {});
        setDogs(dogsData || []);
        setLoading(false);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        const { error } = await supabase.from('profiles').update({
            full_name: profile.full_name,
            address: profile.address,
            phone: profile.phone
        }).eq('id', profile.id);

        if (!error) alert('Perfil atualizado!');
        setSaving(false);
    };

    const handleTogglePreference = async (key: string) => {
        const newPreferences = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPreferences);

        await supabase.from('profiles').update({
            preferences: newPreferences
        }).eq('id', profile.id);
    };

    // ... (rest of upload/profile logic same) ...

    const handleUploadDogPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${profile.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('pet-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('pet-photos').getPublicUrl(filePath);
            setNewDog({ ...newDog, photo: data.publicUrl });
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    const handleAddDog = async () => {
        if (!newDog.name || !newDog.age) return;

        const { error } = await supabase.from('dogs').insert({
            owner_id: profile.id,
            name: newDog.name,
            age: newDog.age,
            traits: newDog.traits,
            image_url: newDog.photo,
            location: profile.address?.split(',').pop()?.trim() || 'Brasil'
        });

        if (!error) {
            setShowAddDog(false);
            setNewDog({ name: '', age: '', traits: '', photo: '' });
            fetchData();
        } else {
            if (error.code === '23505') {
                alert('Você já possui um cão cadastrado!');
            }
        }
    };

    if (loading) return <div className="flex-1 flex items-center justify-center dark:text-white">Carregando...</div>;

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark p-6 overflow-y-auto pb-32">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black">{t('settings_title')}</h1>
            </header>

            <section className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm mb-6">
                {/* ... Profile Section ... */}
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">{t('edit_profile')}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Nome Completo</label>
                        <input className="w-full h-14 bg-gray-50 dark:bg-background-dark/50 rounded-2xl px-5 font-bold border-2 border-transparent focus:border-primary/20 transition-all" value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Endereço</label>
                        <input className="w-full h-14 bg-gray-50 dark:bg-background-dark/50 rounded-2xl px-5 font-bold border-2 border-transparent focus:border-primary/20 transition-all" value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} />
                    </div>
                    <button onClick={handleSaveProfile} disabled={saving} className="w-full h-14 bg-primary text-[#102217] font-black rounded-2xl shadow-lg shadow-primary/10 active:scale-95 transition-all">{saving ? 'Salvando...' : t('save_changes')}</button>
                </div>
            </section>

            {/* PREFERENCES SECTION */}
            <section className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm mb-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">Preferências de Exibição</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-background-dark/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">pets</span>
                            <span className="font-bold">Serviços Pet / Veterinária</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={preferences.show_services || false} onChange={() => handleTogglePreference('show_services')} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </section>

            <section className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-primary">{t('my_dogs')}</h2>
                    {dogs.length === 0 && (
                        <button onClick={() => setShowAddDog(!showAddDog)} className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">{showAddDog ? 'close' : 'add'}</span>
                        </button>
                    )}
                </div>

                {showAddDog ? (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-4">
                            <label className="size-20 bg-gray-100 dark:bg-white/5 rounded-2xl cursor-pointer flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30">
                                {newDog.photo ? (
                                    <img src={newDog.photo} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-primary">{uploading ? 'sync' : 'add_a_photo'}</span>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleUploadDogPhoto} />
                            </label>
                            <div className="flex-1 space-y-2">
                                <input placeholder="Nome" className="w-full h-12 bg-gray-50 dark:bg-background-dark/50 rounded-xl px-4 font-bold border-2 border-transparent focus:border-primary/20 transition-all" value={newDog.name} onChange={e => setNewDog({ ...newDog, name: e.target.value })} />
                                <input placeholder="Idade (ex: 3 anos)" className="w-full h-12 bg-gray-50 dark:bg-background-dark/50 rounded-xl px-4 font-bold border-2 border-transparent focus:border-primary/20 transition-all" value={newDog.age} onChange={e => setNewDog({ ...newDog, age: e.target.value })} />
                            </div>
                        </div>
                        <textarea placeholder="Traços/Temperamento" className="w-full h-24 bg-gray-50 dark:bg-background-dark/50 rounded-xl p-4 font-bold border-2 border-transparent focus:border-primary/20 transition-all resize-none" value={newDog.traits} onChange={e => setNewDog({ ...newDog, traits: e.target.value })} />
                        <button onClick={handleAddDog} className="w-full h-12 bg-primary/20 text-primary font-black rounded-xl border border-primary/20 active:scale-95 transition-all">
                            {t('add_another_dog')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {dogs.map(dog => (
                            <div key={dog.id} className="relative aspect-square rounded-3xl overflow-hidden group">
                                <img src={dog.image_url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                                    <span className="text-white font-black text-sm">{dog.name}</span>
                                    <span className="text-white/60 text-[10px] font-bold uppercase">{dog.age}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default SettingsView;
