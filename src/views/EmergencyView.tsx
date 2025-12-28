import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import {
    ChevronLeft, Navigation, Shield, Car,
    User, Phone, AlertCircle, MapPin
} from 'lucide-react';

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
                    const city = data.address.city || data.address.town || data.address.village || 'Lisboa';
                    const state = data.address.state || 'Lisboa';

                    setRealAddress(`${road}${houseNumber}`);
                    setRealCity(`${city}, ${state}`);
                } catch (e) {
                    setRealAddress('Lisboa, Portugal');
                }
            });
        }
    }, []);

    return (
        <div className="flex-1 flex flex-col bg-[#fdfdfd] h-screen overflow-hidden">
            <header className="px-6 pt-12 pb-6 flex items-center bg-white border-b border-slate-100 sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="size-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 active:scale-95 transition-all mr-6"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <AlertCircle size={14} className="text-red-500 fill-red-500/10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Centro de Ajuda</span>
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">{t('help_tab')}</h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8">
                <div className="mb-10">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
                        Precisando de <span className="text-[#22eb7e]">Ajuda?</span>
                    </h2>
                    <p className="text-slate-500 font-bold">Estamos aqui para apoiar você e seu pet.</p>
                </div>

                <div className="space-y-6">
                    {/* Current Location Card */}
                    <div className="premium-card bg-white p-6 shadow-xl shadow-slate-200/40 border-slate-50">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-2xl bg-[#22eb7e]/10 flex items-center justify-center text-[#22eb7e] shrink-0">
                                <Navigation size={24} fill="currentColor" fillOpacity={0.2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#22eb7e] block mb-1">
                                    {t('location_label')}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 leading-tight truncate">
                                    {realAddress}
                                </h3>
                                <p className="text-slate-400 text-sm font-bold mt-1">
                                    {realCity}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid gap-4">
                        {[
                            { title: t('call_police'), icon: Shield, color: 'bg-slate-900', textColor: 'text-white' },
                            { title: t('report_accident'), icon: Car, color: 'bg-[#22eb7e]', textColor: 'text-[#102217]' },
                            { title: t('call_owner'), icon: User, color: 'bg-white', textColor: 'text-slate-900', border: 'border-2 border-slate-100' }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className={`p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group active:scale-95 transition-all ${item.color} ${item.border || ''}`}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className={`text-xl font-black tracking-tight ${item.textColor}`}>{item.title}</h3>
                                    <div className={`size-12 rounded-2xl flex items-center justify-center ${item.textColor} opacity-20`}>
                                        <item.icon size={32} />
                                    </div>
                                </div>
                                <button className={`flex w-full items-center justify-center h-16 rounded-[1.5rem] font-black uppercase tracking-widest gap-3 shadow-lg shadow-black/5 ${item.textColor === 'text-white' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>
                                    <Phone size={20} fill="currentColor" fillOpacity={0.3} />
                                    {item.title}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 mb-8 bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                    <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider text-center italic">
                        "{t('emergency_warn')}"
                    </p>
                </div>
            </main>
        </div>
    );
};

export default EmergencyView;
