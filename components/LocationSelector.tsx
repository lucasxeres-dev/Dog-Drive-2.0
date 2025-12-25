import React, { useState } from 'react';
import { useTranslation } from '../LanguageContext';

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
        <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 block">Selecione o Estado</label>
                <div className="grid grid-cols-2 gap-3">
                    {states.map(s => (
                        <button
                            key={s.code}
                            onClick={() => { setSelectedState(s.code); setSelectedCity(''); }}
                            className={`h-14 rounded-2xl border-2 font-black transition-all text-xs uppercase tracking-widest ${selectedState === s.code
                                    ? 'bg-primary border-primary text-[#102217] scale-105 shadow-lg shadow-primary/20'
                                    : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5 opacity-60'
                                }`}
                        >
                            {s.code}
                        </button>
                    ))}
                </div>
            </div>

            {selectedState && !isAvailable && (
                <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 animate-slideUp">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined font-bold">error</span>
                        <h4 className="font-black text-sm uppercase italic">Não Disponível</h4>
                    </div>
                    <p className="text-xs font-bold leading-relaxed opacity-80 uppercase tracking-tight">O Dog Drive ainda não chegou em {selectedState}. Estamos trabalhando para expandir em breve!</p>
                </div>
            )}

            {selectedState && isAvailable && (
                <div className="animate-slideUp">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 block">Cidades Disponíveis em {selectedState}</label>
                    <div className="space-y-2">
                        {cities[selectedState].map(city => (
                            <button
                                key={city}
                                onClick={() => { setSelectedCity(city); onSelect(`${city}, ${selectedState}`); }}
                                className={`w-full h-14 rounded-2xl border-2 px-6 flex items-center justify-between font-bold text-sm transition-all ${selectedCity === city
                                        ? 'bg-primary border-primary text-[#102217]'
                                        : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5'
                                    }`}
                            >
                                {city}
                                {selectedCity === city && <span className="material-symbols-outlined">check_circle</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationSelector;
