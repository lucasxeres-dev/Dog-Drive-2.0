import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';
import { authService } from '../services/authService';
import { dogService } from '../services/dogService';
import { Dog } from '../types';
import {
    ArrowLeft, Camera, Shield, LogOut, Plus,
    User, MapPin, Phone, Bell, Heart, Store,
    ChevronRight, Save, X, Sparkles, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ... (keep PasswordChangeSection as is, it's defined before SettingsView) ...

// I need to skip to where SettingsView text starts to insert the button inside main
// Since replace_file_content works on line ranges, I'll do two replaces or one big one?
// I can just replace the imports first.


// Password Change Component
const PasswordChangeSection: React.FC = () => {
    const { showNotification } = useNotification();
    const supabase = useSupabase();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            showNotification('As senhas não coincidem', 'error');
            return;
        }

        // Level 5 Security: Stricter password requirements
        if (newPassword.length < 8) {
            showNotification('A senha deve ter pelo menos 8 caracteres', 'error');
            return;
        }

        const hasNumber = /\d/.test(newPassword);
        const hasUpper = /[A-Z]/.test(newPassword);
        if (!hasNumber || !hasUpper) {
            showNotification('A senha deve conter pelo menos um número e uma letra maiúscula', 'error');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            showNotification('Senha alterada com sucesso!', 'success');
            setNewPassword('');
            setConfirmPassword('');
            setIsExpanded(false);
        } catch (err: any) {
            showNotification(err.message || 'Erro ao alterar senha', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                        <Shield size={20} />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Segurança</h2>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"
                >
                    <ChevronRight size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
            </div>

            <AnimatePresence>
                {!isExpanded ? (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="w-full h-14 bg-slate-50 rounded-2xl flex items-center justify-between px-6 hover:bg-slate-100 transition-colors"
                    >
                        <span className="font-bold text-slate-600 text-sm">Alterar Senha</span>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300">
                            <Plus size={16} />
                        </div>
                    </button>
                ) : (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 overflow-hidden"
                    >
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nova Senha</label>
                            <input
                                type="password"
                                className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold border-2 border-transparent focus:border-[#22eb7e]/20 transition-all outline-none"
                                placeholder="Digite a nova senha"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold border-2 border-transparent focus:border-[#22eb7e]/20 transition-all outline-none"
                                placeholder="Confirme a nova senha"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="flex-1 h-14 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={loading || !newPassword || !confirmPassword}
                                className="flex-2 h-14 bg-[#22eb7e] text-[#102217] font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-[#22eb7e]/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Salvando...' : 'Salvar Senha'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};


const SettingsView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { user, profile: authProfile } = useAuth();
    const supabaseClient = useSupabase();

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
        if (authProfile) {
            setProfile(authProfile);
            setPreferences(authProfile.preferences || {});
            fetchDogs();
            setLoading(false);
        }
    }, [authProfile]);

    const fetchDogs = async () => {
        if (!user) return;
        try {
            const { data } = await supabaseClient.from('dogs').select('*').eq('owner_id', user.id);
            if (data) setDogs(data);
        } catch (e) {
            console.error('Error fetching dogs', e);
        }
    };

    const sanitize = (text: string) => {
        if (!text) return '';
        return text.replace(/<[^>]*>?/gm, '').trim().substring(0, 500); // Basic XSS prevention and length limit
    };

    const handleSaveProfile = async () => {
        if (!profile) return;

        const sanitizedFullName = sanitize(profile.full_name);
        if (sanitizedFullName.length < 3) {
            showNotification('O nome deve ter pelo menos 3 caracteres', 'error');
            return;
        }

        if (profile.phone && !/^[0-9+ ]{9,16}$/.test(profile.phone)) {
            showNotification('Telefone inválido', 'error');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabaseClient.from('profiles').update({
                full_name: sanitizedFullName,
                address: sanitize(profile.address),
                phone: profile.phone?.replace(/[^\d+]/g, '') // Sanitize phone to only digits and +
            }).eq('id', profile.id);

            if (error) throw error;
            showNotification('Perfil atualizado!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Erro ao atualizar perfil', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePreference = async (key: string) => {
        const newPreferences = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPreferences);

        try {
            await supabaseClient.from('profiles').update({
                preferences: newPreferences
            }).eq('id', profile.id);
        } catch (e) {
            showNotification('Erro ao salvar preferência', 'error');
        }
    };

    const handleUploadDogPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${profile.id}/${fileName}`;

            const { error: uploadError } = await supabaseClient.storage
                .from('pet-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabaseClient.storage.from('pet-photos').getPublicUrl(filePath);
            setNewDog({ ...newDog, photo: data.publicUrl });
        } catch (e: any) {
            console.error(e);
            showNotification('Erro ao fazer upload da foto', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleAddDog = async () => {
        const sanitizedName = sanitize(newDog.name);
        const sanitizedAge = sanitize(newDog.age);
        const sanitizedTraits = sanitize(newDog.traits);

        if (!sanitizedName || !sanitizedAge) {
            showNotification('Preencha os dados básicos do pet', 'error');
            return;
        }

        if (sanitizedName.length > 50) {
            showNotification('Nome muito longo', 'error');
            return;
        }

        try {
            const { error } = await supabaseClient.from('dogs').insert({
                owner_id: profile.id,
                name: sanitizedName,
                age: sanitizedAge,
                traits: sanitizedTraits,
                image_url: newDog.photo,
                location: profile.address?.split(',').pop()?.trim() || 'Portugal'
            });

            if (error) {
                if (error.code === '23505') {
                    showNotification('Você já possui um cão cadastrado!', 'error');
                } else {
                    throw error;
                }
                return;
            }

            setShowAddDog(false);
            setNewDog({ name: '', age: '', traits: '', photo: '' });
            fetchDogs();
            showNotification('Cão cadastrado com sucesso!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Erro ao cadastrar cão', 'error');
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
            <div className="w-12 h-12 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-16 animate-fade-in">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm shadow-slate-200/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:scale-90 transition-all border border-slate-200/50"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Definições</h1>
                </div>
                <button
                    onClick={() => { authService.signOut(); navigate('/login'); }}
                    className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 active:scale-90 transition-all"
                >
                    <LogOut size={20} />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
                {/* Dashboard / Activities Link */}
                <section
                    onClick={() => navigate('/bookings')}
                    className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 mb-8 flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#22eb7e] text-[#102217] flex items-center justify-center shadow-lg shadow-[#22eb7e]/30">
                            <Calendar size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Minhas Atividades</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Ver agendamentos e histórico</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <ChevronRight size={20} />
                    </div>
                </section>

                {/* Profile Section */}
                <section className="premium-card mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-[#22eb7e]/10 text-[#22eb7e] flex items-center justify-center">
                            <User size={24} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">O Meu Perfil</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className="label-premium">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    className="input-premium pl-14"
                                    value={profile.full_name || ''}
                                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="label-premium">Morada</label>
                            <div className="relative">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    className="input-premium pl-14"
                                    value={profile.address || ''}
                                    onChange={e => setProfile({ ...profile, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="label-premium">Telemóvel</label>
                            <div className="relative">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    className="input-premium pl-14"
                                    value={profile.phone || ''}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="btn-dark-premium w-full mt-4"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={18} className="text-[#22eb7e]" />
                                    <span>Guardar Alterações</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* Seller Mode */}
                {['petshop', 'boarding', 'grooming', 'walker'].includes(profile?.role) && (
                    <section className="bg-gradient-to-br from-[#102217] to-[#1a3a28] rounded-[3rem] p-8 shadow-xl shadow-[#102217]/10 mb-8 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#22eb7e]/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={16} className="text-[#22eb7e]" />
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-[#22eb7e]">Vendedor Pro</h2>
                                </div>
                                <h3 className="text-xl font-black text-white tracking-tight">Painel de Controlo</h3>
                                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-1">Gerir Produtos & Serviços</p>
                            </div>
                            <button
                                onClick={() => showNotification("Painel em desenvolvimento", "info")}
                                className="w-14 h-14 bg-[#22eb7e] text-[#102217] rounded-2xl flex items-center justify-center shadow-lg shadow-[#22eb7e]/20 active:scale-90 transition-all font-black"
                            >
                                <Store size={24} />
                            </button>
                        </div>
                    </section>
                )}

                {/* Preferences */}
                <section className="premium-card mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                            <Bell size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Preferências</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-rose-500">
                                    <Heart size={20} />
                                </div>
                                <div>
                                    <p className="font-extrabold text-[#102217] text-sm">Modo Comunitário</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Alertas de Pets Perdidos</p>
                                </div>
                            </div>
                            <label className="switch-premium">
                                <input type="checkbox" className="sr-only peer" checked={preferences.show_services || false} onChange={() => handleTogglePreference('show_services')} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22eb7e]"></div>
                            </label>
                        </div>
                    </div>
                </section>

                <PasswordChangeSection />

                {/* My Pets */}
                <section className="premium-card">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <Heart size={22} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Os Meus Dogs</h2>
                        </div>
                        <button
                            onClick={() => setShowAddDog(!showAddDog)}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${showAddDog ? 'bg-slate-100 text-slate-400' : 'bg-[#22eb7e] text-[#102217] shadow-lg shadow-[#22eb7e]/20'}`}
                        >
                            {showAddDog ? <X size={20} /> : <Plus size={20} strokeWidth={3} />}
                        </button>
                    </div>

                    <AnimatePresence>
                        {showAddDog && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 mb-8 overflow-hidden"
                            >
                                <div className="flex items-center gap-5">
                                    <label className="w-24 h-24 bg-white rounded-3xl cursor-pointer flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 hover:border-[#22eb7e]/50 transition-all shadow-sm shrink-0">
                                        {newDog.photo ? (
                                            <img src={newDog.photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <Camera size={24} className="text-slate-300" />
                                                <span className="text-[9px] font-black uppercase text-slate-300">Foto</span>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadDogPhoto} />
                                    </label>
                                    <div className="flex-1 space-y-3">
                                        <input
                                            placeholder="Nome do Dog"
                                            className="w-full h-12 bg-white rounded-xl px-4 font-bold border-2 border-transparent focus:border-[#22eb7e]/30 transition-all outline-none text-sm"
                                            value={newDog.name}
                                            onChange={e => setNewDog({ ...newDog, name: e.target.value })}
                                        />
                                        <input
                                            placeholder="Idade (ex: 3 anos)"
                                            className="w-full h-12 bg-white rounded-xl px-4 font-bold border-2 border-transparent focus:border-[#22eb7e]/30 transition-all outline-none text-sm"
                                            value={newDog.age}
                                            onChange={e => setNewDog({ ...newDog, age: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Traços de personalidade (ex: Calmo, brincalhão...)"
                                    className="w-full h-24 bg-white rounded-xl p-4 font-bold border-2 border-transparent focus:border-[#22eb7e]/30 transition-all outline-none resize-none text-sm"
                                    value={newDog.traits}
                                    onChange={e => setNewDog({ ...newDog, traits: e.target.value })}
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowAddDog(false)}
                                        className="btn-ghost-premium flex-1 !h-12"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleAddDog}
                                        disabled={uploading}
                                        className="btn-primary-premium flex-1 !h-12 !px-0"
                                    >
                                        {uploading ? 'A enviar...' : 'Confirmar Pet'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-4">
                        {dogs.map(dog => (
                            <div key={dog.id} className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden group shadow-md border border-white">
                                <img src={dog.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                    <p className="text-white font-black text-lg leading-tight">{dog.name}</p>
                                    <p className="text-[#22eb7e] text-[10px] font-black uppercase tracking-widest mt-1 opacity-90">{dog.age}</p>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => setShowAddDog(true)}
                            className="aspect-[4/5] rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-[#22eb7e]/50 hover:text-slate-600 transition-all"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Plus size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Pet</span>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};


export default SettingsView;
