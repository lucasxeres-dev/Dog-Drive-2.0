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
            image: 'https://images.unsplash.com/photo-1534133070785-5c2721444518?q=80&w=400&auto=format&fit=crop',
            path: '/marketplace',
            color: 'bg-green-500'
        },
        {
            id: 'walking',
            title: 'Passeios',
            subtitle: 'Exercício e diversão',
            icon: Footprints,
            image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?q=80&w=400&auto=format&fit=crop',
            path: '/walkers?service=walking',
            color: 'bg-blue-500'
        },
        {
            id: 'boarding',
            title: 'Hospedagem',
            subtitle: 'Conforto e segurança',
            icon: Home,
            image: 'https://images.unsplash.com/photo-1541599540903-21b33e46796c?q=80&w=400&auto=format&fit=crop',
            path: '/walkers?service=boarding',
            color: 'bg-purple-500'
        },
        {
            id: 'grooming',
            title: 'Banho e Tosa',
            subtitle: 'Beleza e higiene',
            icon: Scissors,
            image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=400&auto=format&fit=crop',
            path: '/walkers?service=grooming',
            color: 'bg-pink-500'
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
            <header className="px-6 pt-8 pb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter">Serviços</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">O melhor para seu pet</p>
                </div>
                <button
                    onClick={() => navigate('/settings')}
                    className="size-12 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 flex items-center justify-center shadow-sm active:scale-90 transition-transform text-slate-400"
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

                            <div className="absolute inset-0 p-8 flex flex-col justify-center">
                                <div className={`size-12 rounded-2xl ${service.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
                                    <service.icon size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-white">{service.title}</h2>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-wider">{service.subtitle}</p>
                            </div>

                            <div className="absolute right-8 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight size={20} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="mt-8 mb-4 premium-card !bg-primary !border-none text-white flex items-center justify-between overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black mb-1">Assinatura Plus</h3>
                        <p className="text-xs font-bold text-white/80">Descontos fixos em todos os serviços</p>
                        <button className="mt-4 px-6 py-2 bg-white text-primary rounded-xl font-black text-[10px] uppercase">Saber Mais</button>
                    </div>
                    < Sparkles className="size-20 text-white/20 -mr-6 -mb-6" />
                </div>
            </main>
        </div>
    );
};

export default ServicesView;
