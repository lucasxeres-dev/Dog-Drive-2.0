import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import {
    Footprints,
    Home,
    Scissors,
    Stethoscope,
    ShoppingBag,
    User,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const ServicesView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const services = [
        {
            id: 'shopps',
            title: 'Marketplace',
            subtitle: 'Produtos e acessórios',
            icon: ShoppingBag,
            image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=400&auto=format&fit=crop',
            path: '/marketplace',
            color: 'bg-[#22eb7e] text-[#102217]'
        },
        {
            id: 'walking',
            title: 'Passeios',
            subtitle: 'Exercício e diversão',
            icon: Footprints,
            image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?q=80&w=400&auto=format&fit=crop',
            path: '/walkers?service=walking',
            color: 'bg-[#102217] text-white'
        },
        {
            id: 'boarding',
            title: 'Hospedagem',
            subtitle: 'Conforto e segurança',
            icon: Home,
            image: 'https://images.unsplash.com/photo-1541599540903-21b33e46796c?q=80&w=400&auto=format&fit=crop',
            path: '/walkers?service=boarding',
            color: 'bg-white text-slate-700 border border-slate-100'
        },
        {
            id: 'grooming',
            title: 'Banho e Tosa',
            subtitle: 'Beleza e higiene',
            icon: Scissors,
            image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=400&auto=format&fit=crop',
            path: '/walkers?service=grooming',
            color: 'bg-slate-100 text-slate-600'
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark h-screen overflow-hidden">
            <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Hub de Serviços</h1>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22eb7e] animate-pulse" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Soluções para seu Pet</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/settings')}
                    className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/50 flex items-center justify-center shadow-sm active:scale-90 transition-all text-slate-400 hover:bg-slate-100"
                >
                    <User size={22} />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar pb-32 px-6 mt-4">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-6"
                >
                    {services.map((service) => (
                        <motion.div
                            key={service.id}
                            variants={item}
                            onClick={() => navigate(service.path)}
                            className="relative h-44 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl shadow-black/5"
                        >
                            <img
                                src={service.image}
                                alt={service.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                            <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                <div className={`size-12 rounded-2xl ${service.color} flex items-center justify-center mb-4 shadow-xl`}>
                                    <service.icon size={24} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight">{service.title}</h2>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2">{service.subtitle}</p>
                            </div>

                            <div className="absolute right-8 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight size={20} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="mt-12 mb-8 relative overflow-hidden bg-gradient-to-br from-[#102217] to-[#1a3a28] rounded-[3rem] p-10 text-white shadow-2xl shadow-[#102217]/20 border border-white/5">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#22eb7e]/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={14} className="text-[#22eb7e]" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22eb7e]">Assinatura Plus</h3>
                        </div>
                        <p className="text-base font-bold text-white/80 leading-relaxed mb-8">Descontos fixos de até <span className="text-[#22eb7e]">25%</span> em todos os serviços e produtos.</p>
                        <button className="btn-primary-premium !h-12 !px-10">
                            <span>Saber Mais</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ServicesView;
