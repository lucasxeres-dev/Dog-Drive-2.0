import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { Dog } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import VaccinationWallet from '../components/VaccinationWallet';
import {
    ShieldCheck, Info, ArrowLeft, Heart,
    X, MessageCircle, MapPin, Bone, Scale, Ruler
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileDetailView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const supabaseClient = useSupabase();
    const { id } = useParams();
    const [dog, setDog] = React.useState<Dog | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'about' | 'vaccines'>('about');

    React.useEffect(() => {
        const fetchDog = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const { data, error } = await supabaseClient
                    .from('dogs')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) setDog(data as Dog);
            } catch (err: any) {
                showNotification(err.message || 'Erro ao carregar perfil do dog', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchDog();
    }, [id, supabaseClient, showNotification]);

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafc]">
            <div className="w-12 h-12 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!dog) return (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[#f8fafc]">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <Bone size={48} className="text-slate-200" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Pet não encontrado</h1>
            <p className="text-slate-400 mb-10 font-bold max-w-[250px]">Lamentamos, mas este membro da alcateia ainda não foi registrado ou já seguiu outro caminho.</p>
            <button onClick={() => navigate(-1)} className="btn-primary-premium">Voltar</button>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto no-scrollbar pb-36 animate-fade-in">
            {/* Overlay Header */}
            <div className="fixed top-0 left-0 w-full z-30 px-6 pt-12 pb-6 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90 transition-all pointer-events-auto shadow-lg"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/20 pointer-events-auto shadow-lg">
                    <Info size={24} />
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative w-full h-[55vh] overflow-hidden">
                <img
                    src={dog.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'}
                    alt={dog.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-black/20"></div>
            </div>

            {/* Content Profile */}
            <div className="px-6 -mt-20 relative z-20">
                <div className="premium-card">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{dog.name}</h1>
                                <span className="text-2xl font-black text-[#22eb7e]">{dog.age}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-4 h-7 rounded-full bg-[#22eb7e]/10 text-[#22eb7e] text-[10px] font-black uppercase tracking-widest flex items-center">
                                    {dog.breed || 'SRD'}
                                </span>
                                {dog.is_castrated && (
                                    <span className="px-4 h-7 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-slate-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#22eb7e]"></div>
                                        Castrado
                                    </span>
                                )}
                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs ml-auto">
                                    <MapPin size={14} className="text-[#22eb7e]" />
                                    <span>{dog.location || 'Portugal'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[1.75rem] mt-8">
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'about' ? 'bg-white shadow-md text-[#102217]' : 'text-slate-400'}`}
                    >
                        <Info size={16} /> Sobre
                    </button>
                    <button
                        onClick={() => setActiveTab('vaccines')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'vaccines' ? 'bg-white shadow-md text-[#102217]' : 'text-slate-400'}`}
                    >
                        <ShieldCheck size={16} /> Vacinas
                    </button>
                </div>

                <div className="mt-8">
                    {activeTab === 'about' ? (
                        <div className="space-y-8">
                            <section>
                                <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Biografia</h2>
                                <p className="text-slate-600 leading-relaxed font-bold text-sm bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    {dog.description || dog.request_instructions || 'Este doguinho é super reservado e ainda não compartilhou sua biografia conosco!'}
                                </p>
                            </section>

                            <section className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-[#22eb7e]/5 flex items-center justify-center text-[#22eb7e]">
                                        <Scale size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1">Peso</p>
                                        <p className="font-extrabold text-slate-900 text-lg">{dog.weight || '7.5'} kg</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-[#22eb7e]/5 flex items-center justify-center text-[#22eb7e]">
                                        <Ruler size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1">Porte</p>
                                        <p className="font-extrabold text-slate-900 uppercase text-lg">{dog.size || 'Médio'}</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-black text-slate-900 mb-5 tracking-tight">Personalidade</h2>
                                <div className="flex flex-wrap gap-3">
                                    {(Array.isArray(dog.traits) ? dog.traits : (typeof dog.traits === 'string' ? dog.traits.split(',') : [])).map((trait, idx) => trait.trim() && (
                                        <span key={idx} className="px-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2.5">
                                            <div className="w-2 h-2 rounded-full bg-[#22eb7e]"></div>
                                            {trait.trim()}
                                        </span>
                                    ))}
                                    {(!dog.traits || (Array.isArray(dog.traits) && dog.traits.length === 0)) && (
                                        <p className="text-xs font-bold text-slate-300 italic px-4 uppercase tracking-widest">Nenhum traço definido.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <VaccinationWallet dogId={dog.id} />
                    )}
                </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex items-center gap-6">
                <button
                    onClick={() => navigate(-1)}
                    className="w-16 h-16 rounded-full bg-white shadow-2xl shadow-slate-200 border border-slate-100 flex items-center justify-center text-rose-500 active:scale-90 transition-all"
                >
                    <X size={32} strokeWidth={3} />
                </button>
                <button
                    onClick={() => navigate('/chats')}
                    className="w-20 h-20 rounded-full bg-[#102217] shadow-2xl shadow-[#22eb7e]/20 flex items-center justify-center text-[#22eb7e] active:scale-90 transition-all"
                >
                    <MessageCircle size={36} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => showNotification('Match!', 'success')}
                    className="w-16 h-16 rounded-full bg-[#22eb7e] shadow-2xl shadow-[#22eb7e]/30 flex items-center justify-center text-[#102217] active:scale-90 transition-all font-black"
                >
                    <Heart size={32} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};


export default ProfileDetailView;
