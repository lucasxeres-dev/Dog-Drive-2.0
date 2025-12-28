
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import {
    ChevronLeft, Dog, Calendar as CalendarIcon,
    Clock, CreditCard, Sparkles, ChevronRight
} from 'lucide-react';

const BookingView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState<number>(5);

    return (
        <div className="flex-1 flex flex-col bg-[#fdfdfd] h-screen overflow-hidden">
            <header className="px-6 pt-12 pb-6 flex items-center bg-white border-b border-slate-100 sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="size-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 active:scale-95 transition-all mr-6 hover:bg-slate-100"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <CalendarIcon size={14} className="text-[#22eb7e]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22eb7e]">Agendamento</span>
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">{t('book')}</h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8">
                <div className="space-y-8">
                    {/* Provider Profile Card */}
                    <div className="premium-card bg-white p-6 shadow-xl shadow-slate-200/40 border-slate-50 flex items-center gap-6">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-[#22eb7e]/30 rounded-3xl blur-xl animate-pulse"></div>
                            <img className="size-20 rounded-[2rem] object-cover relative z-10 border-2 border-white shadow-xl" src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300" alt="Walker" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-black text-xl text-slate-900 leading-tight">Pedro Santos</h3>
                            <p className="text-sm font-bold text-slate-400 mt-1">Lisboa, Portugal</p>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="bg-[#22eb7e]/10 text-[#22eb7e] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                    Top Rated
                                </span>
                                <span className="text-slate-300 text-[10px] font-black uppercase tracking-wider">
                                    Walker & Sitter
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Section */}
                    <section>
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('date')}</h3>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                <Sparkles size={14} className="text-[#22eb7e]" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('september_2025')}</span>
                            </div>
                        </div>
                        <div className="premium-card bg-white p-6 shadow-xl shadow-slate-200/40 border-slate-50">
                            <div className="grid grid-cols-7 gap-y-3">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                                    <p key={d} className="text-slate-300 text-[10px] font-black text-center uppercase tracking-widest">{d}</p>
                                ))}
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(i + 1)}
                                        className={`size-11 mx-auto flex items-center justify-center text-sm font-black rounded-2xl transition-all ${selectedDate === i + 1 ? 'bg-[#22eb7e] text-[#102217] shadow-xl shadow-[#22eb7e]/30 scale-110' : 'text-slate-500 hover:bg-slate-50 active:scale-95'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Summary Section */}
                    <section className="pb-32">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6 px-2">{t('summary')}</h3>
                        <div className="premium-card bg-slate-900 p-8 shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 size-32 bg-[#22eb7e]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <div className="flex justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#22eb7e]">
                                        <Dog size={28} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="font-black text-lg">{t('walking_service')}</p>
                                        <div className="flex items-center gap-2 mt-1 opacity-60">
                                            <Clock size={12} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">{selectedDate < 10 ? `0${selectedDate}` : selectedDate} Set • 10:00</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="font-black text-xl text-[#22eb7e]">€ 15,00</p>
                            </div>

                            <div className="h-px bg-white/10 my-8 relative z-10"></div>

                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#22eb7e] mb-1">Valor Total</p>
                                    <p className="text-4xl font-black tracking-tighter">€ 20,00</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-bold text-white/40 uppercase mb-2">Com taxa de serviço</p>
                                    <Sparkles size={24} className="text-[#22eb7e] opacity-20" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="px-6 py-10 bg-white/80 backdrop-blur-xl border-t border-slate-100 sticky bottom-0 z-50">
                <button
                    onClick={() => {
                        // navigate('/chats'); // Old flow
                        // TODO: Create Booking implementation
                        navigate('/bookings');
                    }}
                    className="btn-primary-premium w-full group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <CreditCard size={20} className="relative z-10" />
                    <span className="relative z-10 uppercase tracking-[0.2em]">{t('pay_btn')}</span>
                    <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
            </footer>
        </div>
    );
};

export default BookingView;
