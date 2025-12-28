import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { X, RotateCcw, Check, Sparkles, MapPin } from 'lucide-react';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: { maxDistance: number; location: string | null }) => void;
    initialDistance?: number;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, initialDistance = 10 }) => {
    const { t } = useTranslation();
    const [distance, setDistance] = useState(initialDistance);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [neighborhoods, setNeighborhoods] = useState<string[]>(['Copacabana', 'Ipanema', 'Leblon', 'Barra', 'Tijuca', 'Botafogo']);

    React.useEffect(() => {
        if (isOpen) {
            // In a real app, you'd fetch neighborhoods based on the current city
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-12 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom-20 duration-700 border border-slate-100">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-[#22eb7e]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22eb7e]">Busca Inteligente</span>
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter text-slate-900">{t('filter_preferences') || 'Configurações'}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center active:scale-95 transition-all text-slate-300 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                <div className="space-y-12">
                    <div>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                                {t('max_distance') || 'Distância Máxima'}
                            </label>
                            <span className="px-5 py-2 rounded-full bg-[#22eb7e]/10 text-[#22eb7e] font-black text-sm border border-[#22eb7e]/20 italic">
                                {distance} km
                            </span>
                        </div>
                        <div className="relative h-4 px-2">
                            <div className="absolute top-1/2 left-2 right-2 h-2 bg-slate-100 rounded-full -translate-y-1/2"></div>
                            <div
                                className="absolute top-1/2 left-2 h-2 bg-[#22eb7e] rounded-full -translate-y-1/2"
                                style={{ width: `${(distance / 50) * 100}%` }}
                            ></div>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={distance}
                                onChange={(e) => setDistance(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full appearance-none bg-transparent accent-[#22eb7e] cursor-pointer"
                            />
                        </div>
                        <div className="flex justify-between mt-6 px-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                            <span>1 km</span>
                            <span className="text-slate-400">Raio de Cobertura</span>
                            <span>50 km</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-6 ml-2">
                            <MapPin size={14} className="text-[#22eb7e]" />
                            <label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                                {t('location_filter') || 'Bairros Próximos'}
                            </label>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {neighborhoods.map(loc => (
                                <button
                                    key={loc}
                                    onClick={() => setSelectedLocation(selectedLocation === loc ? null : loc)}
                                    className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95 ${selectedLocation === loc
                                        ? 'bg-[#22eb7e] text-[#102217] border-[#22eb7e] shadow-xl shadow-[#22eb7e]/20 scale-105'
                                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            onClick={() => {
                                setDistance(10);
                                setSelectedLocation(null);
                            }}
                            className="size-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-900 active:scale-90 transition-all"
                        >
                            <RotateCcw size={24} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => onApply({ maxDistance: distance, location: selectedLocation })}
                            className="btn-primary-premium flex-1 h-16"
                        >
                            <span className="uppercase tracking-[0.2em]">{t('apply_filters') || 'Buscar Agora'}</span>
                            <Check size={20} className="group-hover:translate-y-[-1px] transition-transform" strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
