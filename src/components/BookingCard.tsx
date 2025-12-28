import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Dog, Calendar } from 'lucide-react';

interface BookingCardProps {
    booking: any;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-[#22eb7e] text-[#102217]';
            case 'pending': return 'bg-amber-400 text-[#102217]';
            case 'completed': return 'bg-slate-200 text-slate-600';
            case 'cancelled': return 'bg-rose-100 text-rose-500';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmado';
            case 'pending': return 'Pendente';
            case 'completed': return 'Concluído';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    return (
        <div
            onClick={() => navigate(`/bookings/${booking.id}`)}
            className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 mb-4 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#22eb7e]">
                        <Dog size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{booking.provider?.name || 'Serviço'}</h3>
                        <p className="text-[10px] uppercase font-black tracking-widest text-[#22eb7e] mt-0.5">{booking.service_type}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-4 relative z-10">
                <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#22eb7e]" />
                    <span>{booking.date}</span>
                </div>
                {booking.time && (
                    <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#22eb7e]" />
                        <span>{booking.time}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-end border-t border-slate-50 pt-3 relative z-10">
                <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin size={12} />
                    <span className="text-[10px] font-bold truncate max-w-[150px]">{booking.location}</span>
                </div>
                <p className="font-black text-slate-900">€{(booking.price || 0).toFixed(2)}</p>
            </div>

            {/* Background decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#22eb7e]/5 rounded-full blur-xl pointer-events-none" />
        </div>
    );
};

export default BookingCard;
