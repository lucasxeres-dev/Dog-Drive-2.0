import React, { useState, useEffect } from 'react';
import {
    MapPin, Clock, Plus, Trash2,
    Save, ChevronLeft, Calendar,
    Camera, X, Check
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useSupabase } from '../hooks/useSupabase';
import { useNotification } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkplaceManagerProps {
    businessId: string;
    onClose: () => void;
    onSave: () => void;
}

const WorkplaceManager: React.FC<WorkplaceManagerProps> = ({ businessId, onClose, onSave }) => {
    const { t } = useTranslation();
    const supabase = useSupabase();
    const { showNotification } = useNotification();

    const [step, setStep] = useState(0); // 0: List/Create, 1: Edit Details, 2: Schedule
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        is_active: true
    });

    const [schedule, setSchedule] = useState<any[]>(
        Array.from({ length: 7 }, (_, i) => ({
            day_of_week: i,
            open_time: '09:00',
            close_time: '18:00',
            is_available: true
        }))
    );

    const handleSaveBasic = async () => {
        try {
            if (!formData.name || !formData.address) {
                showNotification('Nome e endereço são obrigatórios', 'error');
                return;
            }

            const locationData = {
                business_id: businessId,
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                is_active: formData.is_active
            };

            let res;
            if (selectedLocation) {
                res = await supabase.from('business_locations').update(locationData).eq('id', selectedLocation.id).select().single();
            } else {
                res = await supabase.from('business_locations').insert(locationData).select().single();
            }

            if (res.error) throw res.error;

            setSelectedLocation(res.data);
            setStep(2); // Go to schedule
            showNotification('Informações básicas salvas!', 'success');
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    const handleSaveSchedule = async () => {
        try {
            if (!selectedLocation) return;

            // Delete existing and insert new
            await supabase.from('location_schedules').delete().eq('location_id', selectedLocation.id);

            const { error } = await supabase.from('location_schedules').insert(
                schedule.map(s => ({
                    location_id: selectedLocation.id,
                    ...s
                }))
            );

            if (error) throw error;

            showNotification('Agenda salva com sucesso!', 'success');
            onSave();
            onClose();
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col md:relative md:bg-transparent">
            <header className="px-6 pt-12 pb-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-400">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                    {step === 0 ? 'Gerenciar Locais' : step === 1 ? 'Dados do Local' : 'Configurar Horários'}
                </h2>
                <div className="w-10" />
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-8">
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#2e9c60] ml-4">Nome do Local</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="ex: Grooming Center Centro"
                                className="w-full h-14 bg-slate-50 border-2 border-transparent focus:border-[#22eb7e] rounded-2xl px-6 font-bold transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#2e9c60] ml-4">Endereço Completo</label>
                            <textarea
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Rua, Número, Bairro, Cidade"
                                className="w-full h-24 bg-slate-50 border-2 border-transparent focus:border-[#22eb7e] rounded-2xl p-6 font-bold transition-all outline-none resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#2e9c60] ml-4">Contato (Opcional)</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+351 900 000 000"
                                className="w-full h-14 bg-slate-50 border-2 border-transparent focus:border-[#22eb7e] rounded-2xl px-6 font-bold transition-all outline-none"
                            />
                        </div>

                        <button onClick={handleSaveBasic} className="btn-primary-premium w-full mt-4">
                            <span>Próximo: Horários</span>
                            <Plus size={20} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-[#102217] p-8 rounded-[2.5rem] text-white">
                            <h3 className="text-xl font-black mb-2">{formData.name}</h3>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">{formData.address}</p>
                        </div>

                        <div className="space-y-4">
                            {schedule.map((day, idx) => (
                                <div key={idx} className={`p-6 rounded-3xl border-2 transition-all ${day.is_available ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-8 rounded-lg flex items-center justify-center font-black text-[10px] uppercase ${day.is_available ? 'bg-[#22eb7e] text-[#102217]' : 'bg-slate-200 text-slate-400'}`}>
                                                {days[idx]}
                                            </div>
                                            <span className="font-bold text-slate-900">{idx === 0 ? 'Domingo' : idx === 1 ? 'Segunda' : idx === 2 ? 'Terça' : idx === 3 ? 'Quarta' : idx === 4 ? 'Quinta' : idx === 5 ? 'Sexta' : 'Sábado'}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newSched = [...schedule];
                                                newSched[idx].is_available = !newSched[idx].is_available;
                                                setSchedule(newSched);
                                            }}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${day.is_available ? 'bg-[#22eb7e]' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-0.5 size-5 bg-white rounded-full transition-all ${day.is_available ? 'left-6.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    {day.is_available && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 space-y-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Abertura</span>
                                                <input
                                                    type="time"
                                                    value={day.open_time}
                                                    onChange={e => {
                                                        const newSched = [...schedule];
                                                        newSched[idx].open_time = e.target.value;
                                                        setSchedule(newSched);
                                                    }}
                                                    className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold border-none outline-none"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Fechamento</span>
                                                <input
                                                    type="time"
                                                    value={day.close_time}
                                                    onChange={e => {
                                                        const newSched = [...schedule];
                                                        newSched[idx].close_time = e.target.value;
                                                        setSchedule(newSched);
                                                    }}
                                                    className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold border-none outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button onClick={handleSaveSchedule} className="btn-primary-premium w-full mt-4">
                            <span>Finalizar Local</span>
                            <Check size={20} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WorkplaceManager;
