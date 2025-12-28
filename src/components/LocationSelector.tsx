import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

const AVAILABLE_STATES = ['MS', 'SP', 'SC'];

const LocationSelector: React.FC<{ onSelect: (location: string) => void }> = ({ onSelect }) => {
    const { t } = useTranslation();
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const states = [
        { name: 'Mato Grosso do Sul', code: 'MS' },
        { name: 'São Paulo', code: 'SP' },
        { name: 'Santa Catarina', code: 'SC' },
        { name: 'Rio de Janeiro', code: 'RJ' },
        { name: 'Minas Gerais', code: 'MG' },
        { name: 'Paraná', code: 'PR' }
    ];

    const cities: Record<string, string[]> = {
        'MS': ['Campo Grande', 'Dourados', 'Três Lagoas'],
        'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto'],
        'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'Balneário Camboriú']
    };

    const isAvailable = AVAILABLE_STATES.includes(selectedState);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 ml-2 block">
                    Selecione o Estado
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {states.map(s => (
                        <button
                            key={s.code}
                            onClick={() => { setSelectedState(s.code); setSelectedCity(''); }}
                            className={`h-16 rounded-[1.25rem] border-2 font-black transition-all text-sm uppercase tracking-widest active:scale-95 ${selectedState === s.code
                                ? 'bg-[#22eb7e] border-[#22eb7e] text-[#102217] shadow-xl shadow-[#22eb7e]/30 scale-105'
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                        >
                            {s.code}
                        </button>
                    ))}
                </div>
            </div>

            {selectedState && !isAvailable && (
                <div className="p-8 rounded-[2rem] bg-red-50 border border-red-100 text-red-600 animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-red-500/5">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertCircle size={20} strokeWidth={2.5} />
                        <h4 className="font-black text-sm uppercase tracking-tight">Região em Breve</h4>
                    </div>
                    <p className="text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest italic">
                        O Dog Drive ainda não chegou em {selectedState}. Inscreva-se para ser o primeiro a saber quando chegarmos!
                    </p>
                </div>
            )}

            {selectedState && isAvailable && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4 ml-2">
                        <Sparkles size={14} className="text-[#22eb7e]" />
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 block">
                            Cidades Disponíveis em {selectedState}
                        </label>
                    </div>
                    <div className="space-y-3">
                        {cities[selectedState].map(city => (
                            <button
                                key={city}
                                onClick={() => { setSelectedCity(city); onSelect(`${city}, ${selectedState}`); }}
                                className={`w-full h-16 rounded-[1.5rem] border-2 px-8 flex items-center justify-between font-black text-sm transition-all active:scale-[0.98] ${selectedCity === city
                                    ? 'bg-[#22eb7e]/5 border-[#22eb7e] text-slate-900 shadow-lg shadow-[#22eb7e]/5'
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 shadow-sm'
                                    }`}
                            >
                                <span className="tracking-tight">{city}</span>
                                {selectedCity === city && <CheckCircle size={20} className="text-[#22eb7e]" strokeWidth={3} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationSelector;
