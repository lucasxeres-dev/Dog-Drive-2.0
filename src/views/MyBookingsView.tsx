import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, History, ClipboardList } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import BookingCard from '../components/BookingCard';
import { Booking } from '../types';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Skeleton } from '../components/UIComponents';

const MyBookingsView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const supabase = useSupabase();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<'scheduled' | 'history'>('scheduled');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user, activeTab]);

    const fetchBookings = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('bookings')
                .select(`
                    *,
                    location:business_locations(name, address),
                    dog:dogs(name, image_url)
                `)
                .eq('user_id', user?.id)
                .order('date', { ascending: true });

            if (activeTab === 'scheduled') {
                query = query.in('status', ['pending', 'confirmed']);
            } else {
                query = query.in('status', ['completed', 'cancelled']);
            }

            const { data, error } = await query;

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden">
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm shadow-slate-200/50 z-10">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/feed')}
                        className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all outline-none hover:bg-slate-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Minhas Atividades</h1>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('scheduled')}
                        className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'scheduled' ? 'bg-white text-[#102217] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Calendar size={14} className={activeTab === 'scheduled' ? 'text-[#22eb7e]' : ''} />
                        Agendados
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-[#102217] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <History size={14} className={activeTab === 'history' ? 'text-[#22eb7e]' : ''} />
                        Histórico
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 no-scrollbar pb-24">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <ClipboardList size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">Nenhum agendamento encontrado.</p>
                        <button
                            onClick={() => navigate('/services')}
                            className="mt-4 text-[#22eb7e] font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            Explorar Serviços
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        {bookings.map(booking => (
                            <BookingCard
                                key={booking.id}
                                booking={{
                                    ...booking,
                                    date: new Date(booking.date).toLocaleDateString(),
                                    time: new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    price: booking.amount,
                                    location: booking.location?.name || 'Local',
                                    provider: {
                                        name: booking.location?.name || 'Workshop',
                                        avatar: booking.dog?.image_url // Simplified for UI
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBookingsView;
