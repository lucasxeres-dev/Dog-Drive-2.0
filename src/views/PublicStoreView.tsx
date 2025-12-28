import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Scissors,
    Calendar, ArrowLeft, Image as ImageIcon,
    Clock, Phone, MessageCircle, ChevronRight
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useSupabase } from '../hooks/useSupabase';
import { Skeleton } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';

const PublicStoreView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const supabase = useSupabase();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [activeLocation, setActiveLocation] = useState<any>(null);

    useEffect(() => {
        if (id) fetchStoreData();
    }, [id]);

    const fetchStoreData = async () => {
        try {
            setLoading(true);
            const { data: bData } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('id', id)
                .single();

            setBusiness(bData);

            if (bData) {
                const { data: lData } = await supabase
                    .from('business_locations')
                    .select('*, location_schedules(*), location_gallery(*)')
                    .eq('business_id', bData.id);

                setLocations(lData || []);
                if (lData?.length > 0) setActiveLocation(lData[0]);
            }
        } catch (error) {
            console.error('Error fetching store data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-64 rounded-3xl" /><Skeleton className="h-32 rounded-3xl" /></div>;

    return (
        <div className="flex-1 flex flex-col bg-white min-h-screen pb-32">
            {/* Hero / Cover */}
            <div className="h-72 bg-[#102217] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#22eb7e]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-12 left-6 size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white z-10"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="absolute bottom-8 left-8 right-8 flex items-end gap-6">
                    <div className="size-24 rounded-[2rem] bg-white p-1 shadow-2xl">
                        <div className="w-full h-full bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-slate-300">
                            <Scissors size={40} />
                        </div>
                    </div>
                    <div className="flex-1 mb-2">
                        <h1 className="text-3xl font-black text-white tracking-tight">{business?.company_name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 text-[#22eb7e]">
                                <Star size={14} fill="currentColor" />
                                <span className="text-[10px] font-black uppercase tracking-widest">4.9 (127 reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="px-8 mt-12 space-y-10">
                {/* Locations Selector */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Locais de Atendimento</h2>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {locations.map(loc => (
                            <button
                                key={loc.id}
                                onClick={() => setActiveLocation(loc)}
                                className={`px-6 py-4 rounded-3xl border-2 transition-all whitespace-nowrap ${activeLocation?.id === loc.id ? 'border-[#22eb7e] bg-[#22eb7e]/5 shadow-lg shadow-[#22eb7e]/10' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin size={16} className={activeLocation?.id === loc.id ? 'text-[#2e9c60]' : 'text-slate-300'} />
                                    <span className="font-black text-[10px] uppercase tracking-widest">{loc.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Active Location Info */}
                <AnimatePresence mode="wait">
                    {activeLocation && (
                        <motion.div
                            key={activeLocation.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Address Card */}
                            <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 flex items-start gap-4">
                                <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-[#2e9c60] shadow-sm">
                                    <MapPin size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Endereço</p>
                                    <p className="text-sm font-bold text-slate-900 leading-relaxed">{activeLocation.address}</p>
                                    {activeLocation.phone && <div className="flex items-center gap-2 mt-3 text-slate-500"><Phone size={14} /><span className="text-xs font-bold">{activeLocation.phone}</span></div>}
                                </div>
                            </div>

                            {/* Gallery */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Galeria & Trabalhos</h2>
                                    <ImageIcon size={16} className="text-slate-300 mr-2" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden group cursor-pointer">
                                            <div className="w-full h-full flex items-center justify-center text-slate-200 group-hover:scale-110 transition-transform">
                                                <ImageIcon size={24} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Schedule */}
                            <section>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Horários Disponíveis</h2>
                                <div className="space-y-2">
                                    {activeLocation.location_schedules?.map((s: any) => (
                                        <div key={s.id} className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <span className="font-black text-[10px] uppercase tracking-widest text-slate-900">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][s.day_of_week]}</span>
                                            <div className="flex items-center gap-3">
                                                <Clock size={12} className="text-[#2e9c60]" />
                                                <span className="text-xs font-bold">{s.open_time.substring(0, 5)} - {s.close_time.substring(0, 5)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-8 flex items-center gap-4 z-50">
                <button className="size-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#2e9c60] transition-colors">
                    <MessageCircle size={24} />
                </button>
                <button
                    onClick={() => navigate(`/booking/${activeLocation?.id}`)}
                    className="btn-primary-premium flex-1 group"
                >
                    <span>Agendar Atendimento</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default PublicStoreView;
