import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Power, MapPin, Calendar, Clock,
    TrendingUp, MessageCircle, ChevronRight,
    Star, Shield, Bell
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useNotification } from '../contexts/NotificationContext';
import { useGpsTracker } from '../hooks/useGpsTracker';
import { motion, AnimatePresence } from 'framer-motion';

const ProviderDashboard: React.FC = () => {
    const navigate = useNavigate();
    const supabase = useSupabase();
    const { showNotification } = useNotification();

    const [isOnline, setIsOnline] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        completed: 12,
        rating: 4.8,
        earnings: 124.50
    });

    const { location, error: gpsError } = useGpsTracker(isOnline);

    useEffect(() => {
        fetchProviderData();
    }, []);

    const fetchProviderData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            setProfile(data);
            setIsOnline(data.is_online);
        }
    };

    const toggleOnline = async () => {
        const newStatus = !isOnline;
        setIsOnline(newStatus);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('business_profiles')
            .update({ is_online: newStatus })
            .eq('id', user.id);

        if (error) {
            showNotification('Erro ao mudar status', 'error');
            setIsOnline(!newStatus);
        } else {
            showNotification(newStatus ? 'Você está ONLINE' : 'Você está OFFLINE', 'success');
        }
    };

    if (gpsError && isOnline) {
        showNotification(`Erro GPS: ${gpsError}`, 'error');
    }

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-24 font-sans">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white shadow-sm">
                <div>
                    <h1 className="text-xl font-black text-slate-900 leading-tight">Olá, {profile?.business_name || 'Colaborador'}</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Painel do Colaborador</p>
                </div>
                <button
                    onClick={toggleOnline}
                    className={`h-12 px-6 rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all ${isOnline ? 'bg-[#22eb7e]/10 text-[#22eb7e] border-2 border-[#22eb7e]' : 'bg-slate-100 text-slate-400 border-2 border-transparent'
                        }`}
                >
                    <Power size={14} />
                    {isOnline ? 'Online' : 'Ficar Online'}
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="size-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 mb-3">
                            <Star size={20} fill="currentColor" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avaliação</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.rating}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-3">
                            <TrendingUp size={20} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ganhos (Mês)</p>
                        <h3 className="text-2xl font-black text-slate-900">€{stats.earnings.toFixed(2)}</h3>
                    </div>
                </div>

                {/* Tracking Status Card */}
                {isOnline && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#102217] p-6 rounded-[2.5rem] text-white flex items-center gap-4 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4">
                            <div className="size-2 rounded-full bg-[#22eb7e] animate-ping" />
                        </div>
                        <div className="size-12 rounded-2xl bg-[#22eb7e]/20 flex items-center justify-center text-[#22eb7e]">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-tight">Rastreamento Ativo</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                {location ? 'Localização enviada em tempo real' : 'Aguardando sinal GPS...'}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <section>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Gestão</h2>
                    <div className="space-y-3">
                        <button className="w-full bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 group active:scale-[0.98] transition-all">
                            <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Calendar size={20} />
                            </div>
                            <div className="text-left flex-1">
                                <h4 className="font-black text-sm text-slate-900">Agendamentos</h4>
                                <p className="text-[10px] text-slate-400 font-bold">Ver todos os pedidos ativos</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-200" />
                        </button>

                        <button className="w-full bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 group active:scale-[0.98] transition-all">
                            <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                <MessageCircle size={20} />
                            </div>
                            <div className="text-left flex-1">
                                <h4 className="font-black text-sm text-slate-900">Mensagens</h4>
                                <p className="text-[10px] text-slate-400 font-bold">Responda aos seus clientes</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-200" />
                        </button>
                    </div>
                </section>

                <div className="bg-slate-100 p-6 rounded-[2rem] flex items-center gap-4">
                    <Shield size={24} className="text-slate-400" />
                    <div>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed">Você está coberto pelo **DogDrive Protect**. Sinta-se seguro em cada serviço.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProviderDashboard;
