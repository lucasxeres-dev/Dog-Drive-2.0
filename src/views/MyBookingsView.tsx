import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, History, ClipboardList } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import BookingCard from '../components/BookingCard';
import { Booking } from '../types';
import { useSupabase } from '../hooks/useSupabase';

const MyBookingsView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const supabase = useSupabase(); // For future DB integration
    const [activeTab, setActiveTab] = useState<'scheduled' | 'history'>('scheduled');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating data fetch
        setLoading(true);
        setTimeout(() => {
            const mockBookings: Booking[] = [
                {
                    id: '1',
                    service_type: 'walk',
                    status: 'confirmed',
                    date: '05 Set',
                    time: '14:00',
                    price: 15.00,
                    provider: { id: 'p1', name: 'Pedro Santos', role: 'Walker', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200' },
                    client_id: 'u1',
                    location: 'Parque Eduardo VII',
                },
                {
                    id: '2',
                    service_type: 'boarding',
                    status: 'pending',
                    date: '12 Set',
                    time: '09:00',
                    price: 45.00,
                    provider: { id: 'p2', name: 'Ana Silva', role: 'Sitter', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
                    client_id: 'u1',
                    location: 'Casa do Anfitrião',
                },
                {
                    id: '3',
                    service_type: 'walk',
                    status: 'completed',
                    date: '28 Ago',
                    time: '10:00',
                    price: 15.00,
                    provider: { id: 'p1', name: 'Pedro Santos', role: 'Walker', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200' },
                    client_id: 'u1',
                    location: 'Jardim da Estrela',
                }
            ];
            setBookings(mockBookings);
            setLoading(false);
        }, 800);
    }, []);

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'scheduled') {
            return b.status === 'confirmed' || b.status === 'pending';
        }
        return b.status === 'completed' || b.status === 'cancelled';
    });

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
                            <div key={i} className="h-32 bg-slate-100 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : filteredBookings.length === 0 ? (
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
                        {filteredBookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBookingsView;
