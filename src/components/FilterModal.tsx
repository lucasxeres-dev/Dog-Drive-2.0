import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

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
            // For now, we'll keep the Rio defaults but ideally this is dynamic
        }
    }, [isOpen]);

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10 bg-black/60 backdrop-blur-md animate-fadeIn transition-all">
            <div className="w-full max-w-md bg-white dark:bg-[#111814] rounded-[3.5rem] p-8 shadow-2xl animate-slideUp border border-white/10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-black tracking-tight text-[#111814] dark:text-white uppercase transition-colors">{t('filter_preferences') || 'Configurações'}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Personalize sua busca</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center active:scale-95 transition-all text-gray-500 hover:text-primary"
                    >
                        <span className="material-symbols-outlined font-black">close</span>
                    </button>
                </div>

                <div className="space-y-10">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">{t('max_distance') || 'Distância Máxima'}</label>
                            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-black text-sm border border-primary/20 italic">
                                {distance} km
                            </span>
                        </div>
                        <div className="relative h-12 flex items-center">
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={distance}
                                onChange={(e) => setDistance(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full appearance-none accent-primary cursor-pointer transition-all"
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-[9px] font-black uppercase tracking-widest text-gray-400 opacity-50">
                            <span>1 km</span>
                            <span>50 km</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 block">{t('location_filter') || 'Bairros Próximos'}</label>
                        <div className="grid grid-cols-3 gap-3">
                            {neighborhoods.map(loc => (
                                <button
                                    key={loc}
                                    onClick={() => setSelectedLocation(selectedLocation === loc ? null : loc)}
                                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedLocation === loc
                                        ? 'bg-primary text-[#111814] border-primary shadow-lg shadow-primary/20 scale-105'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 border-transparent hover:border-primary/30'
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
                            className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-gray-400 hover:text-primary active:scale-90 transition-all border border-transparent hover:border-primary/20"
                        >
                            <span className="material-symbols-outlined font-black">restart_alt</span>
                        </button>
                        <button
                            onClick={() => onApply({ maxDistance: distance, location: selectedLocation })}
                            className="flex-1 h-16 bg-primary text-[#111814] font-black rounded-3xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 group"
                        >
                            <span>{t('apply_filters') || 'Salvar Ajustes'}</span>
                            <span className="material-symbols-outlined font-black group-hover:translate-x-1 transition-transform">check</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
