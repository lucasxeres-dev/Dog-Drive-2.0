import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import {
    ChevronLeft, Dog, Calendar as CalendarIcon,
    Clock, CreditCard, Sparkles, ChevronRight,
    MapPin, Scissors, Plus
} from 'lucide-react';
import { Skeleton } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';

const BookingView: React.FC = () => {
    const { id: locationId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const supabase = useSupabase();
    const { user } = useAuth();
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [myDogs, setMyDogs] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDog, setSelectedDog] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string>('10:00');
    const [step, setStep] = useState(1); // 1: Service/Dog, 2: Date/Time, 3: Summary

    useEffect(() => {
        if (locationId && user) {
            fetchInitialData();
        }
    }, [locationId, user]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            // Fetch Location & Business
            const { data: locData } = await supabase
                .from('business_locations')
                .select('*, business_profiles(*)')
                .eq('id', locationId)
                .single();

            setLocation(locData);

            // Fetch Services
            const { data: servData } = await supabase
                .from('location_services')
                .select('*')
                .eq('location_id', locationId);

            setServices(servData || []);
            if (servData?.length > 0) setSelectedService(servData[0]);

            // Fetch My Dogs
            const { data: dogData } = await supabase
                .from('dogs')
                .select('*')
                .eq('owner_id', user?.id);

            setMyDogs(dogData || []);
            if (dogData?.length > 0) setSelectedDog(dogData[0]);

        } catch (error) {
            console.error('Error fetching booking data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        try {
            if (!selectedService || !selectedDog) {
                showNotification('Selecione um serviço e um pet', 'warning');
                return;
            }

            const bookingDate = new Date(`${selectedDate}T${selectedTime}`);

            const { error: bookingError } = await supabase.from('bookings').insert({
                user_id: user?.id,
                location_id: locationId,
                service_id: selectedService.id,
                dog_id: selectedDog.id,
                service_type: selectedService.name,
                date: bookingDate.toISOString(),
                status: 'pending',
                amount: selectedService.price,
                duration_minutes: selectedService.duration || 60
            });

            if (bookingError) throw bookingError;

            showNotification('Agendamento realizado com sucesso!', 'success');
            navigate('/bookings');
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    if (loading) return (
        <div className="p-6 space-y-6">
            <header className="flex items-center gap-4"><Skeleton className="size-11 rounded-2xl" /><Skeleton className="h-8 w-40" /></header>
            <Skeleton className="h-40 w-full rounded-[2.5rem]" />
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
        </div>
    );

    const totalPrice = (selectedService?.price || 0) + 5.00; // Mock service fee

    return (
        <div className="flex-1 flex flex-col bg-[#fdfdfd] h-screen overflow-hidden">
            <header className="px-6 pt-12 pb-6 flex items-center bg-white border-b border-slate-100 sticky top-0 z-50">
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                    className="size-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 active:scale-95 transition-all mr-6 hover:bg-slate-100"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <CalendarIcon size={14} className="text-[#22eb7e]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22eb7e]">
                            {step === 1 ? 'Serviço & Pet' : step === 2 ? 'Data & Horário' : 'Finalizar'}
                        </span>
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        {location?.name || 'Agendamento'}
                    </h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Service Selection */}
                            <section>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 ml-2">Escolha o Serviço</h3>
                                <div className="space-y-3">
                                    {services.length > 0 ? services.map(service => (
                                        <button
                                            key={service.id}
                                            onClick={() => setSelectedService(service)}
                                            className={`w-full p-6 rounded-[2.5rem] border-2 transition-all flex items-center justify-between ${selectedService?.id === service.id ? 'border-[#22eb7e] bg-[#22eb7e]/5 shadow-lg shadow-[#22eb7e]/10' : 'border-slate-50 bg-white'}`}
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="size-12 rounded-2xl bg-[#22eb7e]/10 flex items-center justify-center text-[#2e9c60]">
                                                    <Scissors size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900">{service.name}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{service.duration || 60} min</p>
                                                </div>
                                            </div>
                                            <span className="font-black text-lg text-slate-900">€{service.price}</span>
                                        </button>
                                    )) : (
                                        <div className="p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                            <p className="text-sm font-bold text-slate-400">Nenhum serviço disponível neste local.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Dog Selection */}
                            <section>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 ml-2">Qual Pet?</h3>
                                {myDogs.length > 0 ? (
                                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                        {myDogs.map(dog => (
                                            <button
                                                key={dog.id}
                                                onClick={() => setSelectedDog(dog)}
                                                className={`shrink-0 flex flex-col items-center gap-2 p-4 rounded-[2rem] border-2 transition-all ${selectedDog?.id === dog.id ? 'border-[#22eb7e] bg-[#22eb7e]/5' : 'border-slate-50 bg-white'}`}
                                            >
                                                <img src={dog.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200'} className="size-16 rounded-2xl object-cover shadow-md" alt={dog.name} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{dog.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => navigate('/onboarding')}
                                        className="w-full p-8 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-2 bg-slate-50 text-slate-400"
                                    >
                                        <Plus size={24} />
                                        <span className="text-sm font-bold">Adicionar Pet</span>
                                    </button>
                                )}
                            </section>

                            <button onClick={() => setStep(2)} disabled={!selectedService || !selectedDog} className="btn-primary-premium w-full mt-6 disabled:opacity-50">
                                <span>Escolher Horário</span>
                                <ChevronRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <section>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 ml-2">Selecione o Dia</h3>
                                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/40">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setSelectedDate(e.target.value)}
                                        className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold outline-none border-none"
                                    />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 ml-2">Horários Disponíveis</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTime(t)}
                                            className={`h-12 rounded-xl font-black text-[10px] tracking-widest transition-all ${selectedTime === t ? 'bg-[#22eb7e] text-[#102217] shadow-lg shadow-[#22eb7e]/30 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <button onClick={() => setStep(3)} className="btn-primary-premium w-full mt-6">
                                <span>Revisar Agendamento</span>
                                <ChevronRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8 pb-32"
                        >
                            <div className="premium-card bg-slate-900 p-8 shadow-2xl text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 size-32 bg-[#22eb7e]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#22eb7e]">
                                            <Scissors size={28} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="font-black text-lg">{selectedService?.name}</p>
                                            <div className="flex items-center gap-2 mt-1 opacity-60">
                                                <Clock size={12} />
                                                <p className="text-[10px] font-black uppercase tracking-widest">{selectedDate} • {selectedTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-black text-xl text-[#22eb7e]">€{selectedService?.price}</p>
                                </div>

                                <div className="space-y-3 relative z-10 mb-8 p-4 bg-white/5 rounded-2xl">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-white/40">
                                        <span>Pet</span>
                                        <span className="text-white uppercase tracking-widest">{selectedDog?.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-bold text-white/40">
                                        <span>Local</span>
                                        <span className="text-white uppercase tracking-widest">{location?.name}</span>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10 my-8 relative z-10"></div>

                                <div className="flex justify-between items-end relative z-10">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#22eb7e] mb-1">Valor Total</p>
                                        <p className="text-4xl font-black tracking-tighter">€{totalPrice.toFixed(2)}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] font-bold text-white/40 uppercase mb-2">Com taxa de serviço</p>
                                        <Sparkles size={24} className="text-[#22eb7e] opacity-20" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {step === 3 && (
                <footer className="px-6 py-10 bg-white/80 backdrop-blur-xl border-t border-slate-100 sticky bottom-0 z-50 animate-fade-in-up">
                    <button
                        onClick={handleConfirmBooking}
                        className="btn-primary-premium w-full group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <CreditCard size={20} className="relative z-10" />
                        <span className="relative z-10 uppercase tracking-[0.2em]">Pagar & Confirmar</span>
                        <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>
                </footer>
            )}
        </div>
    );
};

export default BookingView;
