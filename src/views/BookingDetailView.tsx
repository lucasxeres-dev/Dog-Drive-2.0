import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft, Clock, MapPin, Calendar, CheckCircle,
    MessageCircle, Navigation, ShieldCheck, Star, XCircle
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { Booking } from '../types';

const BookingDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch based on ID
        setLoading(true);
        setTimeout(() => {
            // Mock data - normally would fetch from Supabase
            const mockBooking: Booking = {
                id: id || '1',
                service_type: 'walk',
                status: 'confirmed',
                date: '05 Dez',
                time: '14:00',
                duration: 60,
                price: 15.00,
                provider: {
                    id: 'p1',
                    name: 'Pedro Santos',
                    role: 'Walker Premium',
                    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200'
                },
                client_id: 'u1',
                location: 'Parque Eduardo VII, Lisboa',
            };
            setBooking(mockBooking);
            setLoading(false);
        }, 600);
    }, [id]);

    if (loading || !booking) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-screen bg-[#f8fafc]">
                <div className="size-12 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-[#22eb7e] bg-[#22eb7e]/10';
            case 'pending': return 'text-amber-500 bg-amber-500/10';
            case 'completed': return 'text-slate-600 bg-slate-100';
            case 'cancelled': return 'text-rose-500 bg-rose-500/10';
            default: return 'text-slate-500 bg-slate-100';
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden font-sans">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm z-10 sticky top-0 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all outline-none"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                    {booking.status}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
                <div className="space-y-6">
                    {/* Map / Location Placeholder */}
                    <div className="aspect-video bg-slate-200 rounded-[2rem] relative overflow-hidden shadow-inner">
                        <img
                            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
                            alt="Map Location"
                            className="w-full h-full object-cover opacity-60 grayscale"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-16 bg-[#22eb7e]/20 rounded-full flex items-center justify-center animate-pulse">
                                <div className="size-4 bg-[#22eb7e] rounded-full shadow-lg shadow-[#22eb7e]/50 border-2 border-white" />
                            </div>
                        </div>
                    </div>

                    {/* Booking Info */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Detalhes do Serviço</h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#22eb7e]">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data e Hora</p>
                                    <p className="text-lg font-black text-slate-900">{booking.date} às {booking.time}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Duração: {booking.duration} min</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#22eb7e]">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local</p>
                                    <p className="text-sm font-black text-slate-900 leading-snug">{booking.location}</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 my-6" />

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">Valor Total</span>
                            <span className="text-2xl font-black text-[#102217]">€{booking.price.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Provider Info */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck size={100} />
                        </div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <img
                                src={booking.provider.avatar}
                                alt={booking.provider.name}
                                className="size-16 rounded-[1.5rem] object-cover border-2 border-white shadow-md"
                            />
                            <div>
                                <h3 className="text-lg font-black text-slate-900 leading-none">{booking.provider.name}</h3>
                                <p className="text-xs font-bold text-[#22eb7e] uppercase tracking-wider mt-1">{booking.provider.role}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-bold text-slate-600">4.9</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            <button className="h-12 rounded-xl bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                                <MessageCircle size={16} /> Chat
                            </button>
                            <button className="h-12 rounded-xl bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                                <Navigation size={16} /> Rota
                            </button>
                        </div>
                    </div>

                    {/* Cancel Button */}
                    {booking.status === 'confirmed' || booking.status === 'pending' ? (
                        <button className="w-full h-14 bg-rose-50 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors">
                            <XCircle size={18} /> Cancelar Reserva
                        </button>
                    ) : null}
                </div>
            </main>
        </div>
    );
};

export default BookingDetailView;
