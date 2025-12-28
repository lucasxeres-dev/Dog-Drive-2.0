import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Scissors, MapPin, Calendar,
    Plus, ChevronRight, Star,
    Clock, MessageSquare, Settings,
    LayoutDashboard, Users, Camera
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Skeleton } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import WorkplaceManager from '../components/WorkplaceManager';

const GroomerDashboard: React.FC = () => {
    const { t } = useTranslation();
    const supabase = useSupabase();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [isWorkplaceManagerOpen, setIsWorkplaceManagerOpen] = useState(false);
    const [stats, setStats] = useState({
        todayCount: 0,
        earnings: '0,00',
        rating: 5.0
    });

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch business profile
            const { data: bData } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('user_id', user?.id)
                .single();

            setBusiness(bData);

            if (bData) {
                // Fetch locations
                const { data: lData } = await supabase
                    .from('business_locations')
                    .select('*')
                    .eq('business_id', bData.id);

                setLocations(lData || []);

                // Mock stats
                setStats({
                    todayCount: 3,
                    earnings: '450,00',
                    rating: 4.9
                });
            }
        } catch (error) {
            console.error('Error fetching grooming dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6 space-y-6"><Skeleton className="h-40 w-full" /><Skeleton className="h-60 w-full" /></div>;

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] min-h-screen pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-[#22eb7e]/10 flex items-center justify-center text-[#22eb7e]">
                        <Scissors size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-none">
                            {business?.company_name || 'Painel da Loja'}
                        </h1>
                        <div className="flex items-center gap-1 mt-1 text-[#2e9c60]">
                            <Star size={12} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{stats.rating} Estrelas</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/settings')}
                    className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"
                >
                    <Settings size={20} />
                </button>
            </header>

            <main className="p-6 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#102217] p-6 rounded-[2.5rem] text-white shadow-xl shadow-[#102217]/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#22eb7e]/10 rounded-full -mr-8 -mt-8 blur-xl" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22eb7e] mb-1">Hoje</p>
                        <h3 className="text-3xl font-black">{stats.todayCount}</h3>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Serviços</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2e9c60] mb-1">Receita</p>
                        <h3 className="text-3xl font-black text-slate-900">€{stats.earnings}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Estimativa</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { icon: Calendar, label: 'Agenda', color: '#22eb7e', route: '/agenda' },
                        { icon: Users, label: 'Clientes', color: '#3b82f6', route: '/clients' },
                        { icon: MapPin, label: 'Locais', color: '#f59e0b', action: () => setIsWorkplaceManagerOpen(true) },
                        { icon: Camera, label: 'Galeria', color: '#ec4899', route: '/gallery' }
                    ].map((item, idx) => (
                        <button key={idx} onClick={item.action || (() => navigate(item.route))} className="flex flex-col items-center gap-2">
                            <div className="size-14 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:scale-105 transition-transform active:scale-95">
                                <item.icon size={22} style={{ color: item.color }} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Next Appointment Section */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Próximos Atendimentos</h2>
                        <button className="text-[10px] font-black text-[#2e9c60] uppercase tracking-widest">Ver Todos</button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 h-full w-1.5 bg-[#22eb7e]" />
                            <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&auto=format" alt="Dog" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-slate-900 leading-none">Bento</h3>
                                <p className="text-[10px] font-black text-[#2e9c60] uppercase tracking-widest mt-1">Banho & Tosa Completa</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Clock size={12} strokeWidth={3} />
                                        <span className="text-[10px] font-black">14:00</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <MapPin size={12} strokeWidth={3} />
                                        <span className="text-[10px] font-black">Local Principal</span>
                                    </div>
                                </div>
                            </div>
                            <button className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-[#22eb7e]/10 hover:text-[#2e9c60] transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Locations Section */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Meus Locais</h2>
                        <button
                            onClick={() => setIsWorkplaceManagerOpen(true)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-[#2e9c60] uppercase tracking-widest bg-[#22eb7e]/10 px-4 py-2 rounded-full"
                        >
                            <Plus size={14} strokeWidth={3} /> Adicionar
                        </button>
                    </div>

                    <div className="space-y-4">
                        {locations.length > 0 ? (
                            locations.map((loc) => (
                                <button
                                    key={loc.id}
                                    onClick={() => {
                                        // Later: handle edit
                                        setIsWorkplaceManagerOpen(true);
                                    }}
                                    className="w-full text-left bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex items-start gap-4 hover:border-[#22eb7e] transition-all"
                                >
                                    <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-slate-900 leading-none">{loc.name}</h3>
                                        <p className="text-[11px] font-medium text-slate-400 mt-2 leading-relaxed">{loc.address}</p>
                                        <div className="flex items-center gap-2 mt-4">
                                            <span className="px-3 py-1 bg-[#2e9c60]/10 text-[#2e9c60] text-[9px] font-black uppercase tracking-widest rounded-lg">Ativo</span>
                                            <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg">Horário Configurado</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center text-center">
                                <MapPin size={32} className="text-slate-300 mb-4" />
                                <p className="text-sm font-bold text-slate-500">Nenhum local cadastrado.<br />Cadastre seus pontos de atendimento.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Workplace Manager Modal */}
            <AnimatePresence>
                {isWorkplaceManagerOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-0 z-[100] bg-white overflow-y-auto"
                    >
                        <WorkplaceManager
                            businessId={business?.id}
                            onClose={() => setIsWorkplaceManagerOpen(false)}
                            onSave={fetchDashboardData}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-8 py-4 flex items-center justify-between z-50">
                {[
                    { icon: LayoutDashboard, active: true },
                    { icon: Calendar, active: false },
                    { icon: MessageSquare, active: false },
                    { icon: Settings, active: false }
                ].map((item, idx) => (
                    <button key={idx} className={`p-2 transition-all ${item.active ? 'text-[#2e9c60] scale-110' : 'text-slate-300'}`}>
                        <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} />
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default GroomerDashboard;
