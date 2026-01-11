import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, X, MousePointer2,
    MessageCircle, MapPin, Heart,
    ArrowRightLeft
} from 'lucide-react';
import { PremiumButton } from './UIComponents';

interface Step {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const steps: Step[] = [
    {
        title: "Navegação por Abas",
        description: "Deslize horizontalmente para alternar entre Passeadores, Hotéis e Groomers.",
        icon: <ArrowRightLeft className="size-12" />,
        color: "bg-blue-500"
    },
    {
        title: "Sistema de Swipe",
        description: "Arraste para a DIREITA se tiver interesse, ou para a ESQUERDA se quiser ver o próximo.",
        icon: <MousePointer2 className="size-12" />,
        color: "bg-[#22eb7e]"
    },
    {
        title: "Match Premiado",
        description: "Você só poderá conversar com profissionais que também demonstrarem interesse em você!",
        icon: <Heart className="size-12" strokeWidth={3} />,
        color: "bg-rose-500"
    },
    {
        title: "Conversas e Mapa",
        description: "Acesse seus matches na aba de Conversas e localize estabelecimentos físicos na aba Mapa.",
        icon: <MapPin className="size-12" />,
        color: "bg-amber-500"
    }
];

interface OnboardingTutorialProps {
    onComplete: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
        >
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onComplete}
                className="absolute top-12 right-8 p-3 bg-white/10 rounded-2xl text-white/50 hover:text-white transition-colors"
            >
                <X size={20} />
            </motion.button>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -20 }}
                    className="flex flex-col items-center max-w-sm"
                >
                    <div className={`size-24 ${steps[currentStep].color} rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-10`}>
                        {steps[currentStep].icon}
                    </div>

                    <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">
                        {steps[currentStep].title}
                    </h2>

                    <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                        {steps[currentStep].description}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="flex gap-2 mb-12">
                {steps.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentStep ? 'w-8 bg-[#22eb7e]' : 'w-2 bg-white/20'}`}
                    />
                ))}
            </div>

            <div className="w-full max-w-sm flex flex-col gap-3">
                <PremiumButton onClick={handleNext} className="h-16 !rounded-[1.5rem] !bg-[#22eb7e] !text-[#102217] font-black text-xs uppercase tracking-[0.2em]">
                    {currentStep === steps.length - 1 ? 'Começar Jornada' : 'Próximo Passo'}
                </PremiumButton>

                <button
                    onClick={onComplete}
                    className="h-10 text-slate-500 text-[10px] font-black uppercase tracking-widest"
                >
                    Pular Tutorial
                </button>
            </div>
        </motion.div>
    );
};

export default OnboardingTutorial;
