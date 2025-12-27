import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../LanguageContext';

const ServicesView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Mapping icons to service types
    const services = [
        { id: 'walking', title: 'Passeio', icon: 'directions_walk', color: 'bg-[#4ADE80]' },
        { id: 'boarding', title: 'Hospedagem', icon: 'home', color: 'bg-[#4ADE80]' },
        { id: 'grooming', title: 'Banho e Tosa', icon: 'content_cut', color: 'bg-[#4ADE80]' },
        { id: 'clinic', title: 'Veterinário', icon: 'medical_services', color: 'bg-[#4ADE80]' },
        { id: 'marketplace', title: 'Mercado', icon: 'storefront', color: 'bg-[#4ADE80]' }
    ];

    return (
        <div className="flex-1 flex flex-col font-display h-screen overflow-hidden relative bg-[#050705]">
            {/* Full Screen Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2000&auto=format&fit=crop")', // French bulldog similar to mock
                    filter: 'brightness(0.85)'
                }}
            ></div>

            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-0"></div>

            {/* Header - Transparent */}
            <header className="relative z-10 flex items-center justify-between p-6 pt-8">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Dog Drive</h1>
                    <span className="text-xs font-bold text-gray-200 tracking-wider opacity-90 drop-shadow-md">Serviços • Atendimento</span>
                </div>
                <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center justify-center rounded-full h-10 w-10 bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all"
                >
                    <span className="material-symbols-outlined">person</span>
                </button>
            </header>

            {/* Main Content - Floating Buttons */}
            <main className="relative z-10 flex-1 px-6 flex flex-col justify-center pb-20">
                <div className="grid grid-cols-2 gap-x-8 gap-y-12 max-w-xs mx-auto w-full">
                    {/* Render services in a staggered or grid layout */}
                    {services.map((service, index) => (
                        <div
                            key={service.id}
                            onClick={() => {
                                if (service.id === 'marketplace') navigate('/marketplace');
                                else navigate(`/walkers?service=${service.id}`);
                            }}
                            className={`flex flex-col items-center gap-3 group cursor-pointer ${index === 4 ? 'col-span-2' : ''}`}
                        >
                            <button className={`${service.color} w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-black/20 group-active:scale-95 transition-transform duration-200`}>
                                <span className="material-symbols-outlined text-[#102217] text-3xl">{service.icon}</span>
                            </button>
                            <span className="text-white font-black text-lg tracking-wide drop-shadow-lg text-center leading-none">{service.title}</span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ServicesView;
