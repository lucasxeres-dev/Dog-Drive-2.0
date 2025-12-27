import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';

const EmergencyView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [realAddress, setRealAddress] = useState<string>('Localizando...');
    const [realCity, setRealCity] = useState<string>('');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
                    const data = await res.json();
                    const road = data.address.road || data.address.suburb || 'Local Desconhecido';
                    const houseNumber = data.address.house_number ? `, ${data.address.house_number}` : '';
                    const city = data.address.city || data.address.town || data.address.village || 'Rio de Janeiro';
                    const state = data.address.state || 'RJ';

                    setRealAddress(`${road}${houseNumber}`);
                    setRealCity(`${city}, ${state}`);
                } catch (e) {
                    setRealAddress('Rio de Janeiro, RJ');
                }
            });
        }
    }, []);

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display h-screen overflow-hidden">
            <header className="sticky top-0 z-50 flex items-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-5 py-4">
                <button onClick={() => navigate(-1)} className="flex size-9 items-center justify-center rounded-full bg-gray-200/60 dark:bg-white/10 text-gray-600 dark:text-white border border-gray-300 dark:border-white/20 mr-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold leading-none tracking-tight">{t('help_tab')}</h2>
                </div>
            </header>

            <div className="px-5 pt-4 pb-2">
                <h1 className="tracking-tight text-3xl font-extrabold leading-tight text-green-700 dark:text-primary">
                    {t('need_help')}
                </h1>
            </div>

            <main className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 no-scrollbar">
                <div className="flex items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm">
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center gap-1.5 text-green-600 mb-1">
                            <span className="material-symbols-outlined text-[18px] fill-1">my_location</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('location_label')}</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold leading-tight">{realAddress}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{realCity}</p>
                        </div>
                    </div>
                </div>

                {[
                    { title: t('call_police'), icon: 'local_police', color: 'bg-green-700', bg: 'bg-green-600/10' },
                    { title: t('report_accident'), icon: 'car_crash', color: 'bg-teal-600', bg: 'bg-teal-500/10' },
                    { title: t('call_owner'), icon: 'person_alert', color: 'bg-emerald-600', bg: 'bg-emerald-600/10' }
                ].map((item) => (
                    <div key={item.title} className="relative overflow-hidden bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 active:scale-[0.99] transition-all">
                        <div className="flex flex-col gap-5 relative z-10">
                            <div className="flex items-start justify-between">
                                <h3 className="text-lg font-bold">{item.title}</h3>
                                <div className="flex size-10 items-center justify-center rounded-full bg-opacity-20 bg-gray-500 text-gray-700 dark:text-white">
                                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                </div>
                            </div>
                            <button className={`flex w-full items-center justify-center rounded-xl h-12 ${item.color} text-white gap-2 text-sm font-bold shadow-sm`}>
                                <span className="material-symbols-outlined text-[20px]">call</span>
                                <span>{item.title}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </main>

            <div className="p-6 text-center">
                <p className="text-[11px] text-gray-400 leading-relaxed px-6 font-medium">
                    {t('emergency_warn')}
                </p>
            </div>
        </div>
    );
};

export default EmergencyView;
