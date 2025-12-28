import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumButton } from '../components/UIComponents';
import {
    Dog, Eye, EyeOff, User,
    ArrowRight, Globe, Sparkles
} from 'lucide-react';

interface LoginViewProps {
    onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            showNotification('Preencha e-mail e senha', 'error');
            return;
        }

        setLoading(true);
        try {
            const { data: { user, session }, error: authError } = await authService.signIn(email, password);
            if (authError) throw authError;

            if (user && session) {
                onLogin();
                navigate('/feed');
                showNotification('Bem-vindo de volta!', 'success');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            showNotification(err.message || 'Erro ao entrar', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden">
            <div className="flex-1 flex flex-col lg:flex-row h-full">
                {/* Visual Left Side */}
                <div className="hidden lg:flex flex-[1.2] relative overflow-hidden bg-[#102217]">
                    <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop')] bg-cover bg-center grayscale-[0.3]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/20 to-transparent" />

                    <div className="relative z-10 p-20 flex flex-col justify-between h-full">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-4"
                        >
                            <div className="size-14 bg-[#22eb7e] rounded-2xl flex items-center justify-center shadow-glow">
                                <Dog size={28} className="text-[#102217]" strokeWidth={3} />
                            </div>
                            <span className="text-3xl font-black text-white tracking-tighter">Dog Drive</span>
                        </motion.div>

                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles size={16} className="text-[#22eb7e]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#22eb7e]">Vibe Premium</span>
                            </div>
                            <h2 className="text-7xl font-black text-white leading-none tracking-tighter max-w-lg">
                                Onde cada <span className="text-[#22eb7e]">match</span> conta uma história.
                            </h2>
                        </motion.div>
                    </div>
                </div>

                {/* Form Right Side */}
                <div className="flex-1 flex flex-col bg-white lg:rounded-l-[4rem] relative overflow-y-auto no-scrollbar shadow-[-40px_0_80px_rgba(0,0,0,0.02)]">
                    <header className="px-8 pt-10 pb-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20">
                        <div className="size-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                            <Globe size={18} />
                        </div>
                        <div className="flex gap-6">
                            <span className="text-[11px] font-black text-slate-900 border-b-2 border-[#22eb7e] pb-1 cursor-pointer">PT</span>
                            <span className="text-[11px] font-black text-slate-400 cursor-pointer hover:text-slate-600 transition-all uppercase tracking-widest">EN</span>
                        </div>
                    </header>

                    <main className="flex-1 px-8 py-12 max-w-md mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-12"
                        >
                            <div className="lg:hidden flex flex-col items-center mb-10">
                                <div className="size-24 bg-[#22eb7e] rounded-[2.5rem] flex items-center justify-center shadow-glow mb-6 animate-float">
                                    <Dog size={40} className="text-[#102217]" strokeWidth={3} />
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Dog Drive</h1>
                                <p className="text-[#22eb7e] text-[10px] font-black uppercase tracking-[0.3em] mt-3">Premium Pet Cloud</p>
                            </div>

                            <div className="hidden lg:block">
                                <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">Bem-vindo <br />de <span className="text-[#22eb7e]">volta</span>!</h1>
                                <p className="text-slate-400 font-bold text-lg">Entre na sua conta para continuar.</p>
                            </div>
                        </motion.div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleLogin();
                            }}
                            className="space-y-8"
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-3"
                            >
                                <label className="label-premium">E-mail ou Usuário</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#22eb7e] transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        className="input-premium !pl-16 bg-slate-50/50 border-slate-100/50"
                                        placeholder="ex: doglover@email.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-3"
                            >
                                <div className="flex items-center justify-between px-2">
                                    <label className="label-premium !ml-0">Senha</label>
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-[#22eb7e] hover:text-[#19c765] transition-colors">Esqueceu?</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#22eb7e] transition-colors">
                                        <div className="size-2 rounded-full bg-current" />
                                    </div>
                                    <input
                                        className="input-premium !pl-16 !pr-16 bg-slate-50/50 border-slate-100/50"
                                        placeholder="Digite sua senha"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#22eb7e] transition-all"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </motion.div>

                            <div className="pt-4">
                                <PremiumButton
                                    type="submit"
                                    loading={loading}
                                    className="w-full !h-16"
                                >
                                    <span>Entrar</span>
                                    <ArrowRight size={20} />
                                </PremiumButton>
                            </div>
                        </form>

                        {/* Social Login */}
                        <div className="mt-16">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="flex-1 h-px bg-slate-50" />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Acesso Rápido</span>
                                <div className="flex-1 h-px bg-slate-50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="h-16 rounded-2xl border-2 border-slate-50 flex items-center justify-center hover:bg-slate-50 hover:border-slate-100 transition-all active:scale-95 group">
                                    <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="size-6 group-hover:scale-110 transition-transform" alt="Google" />
                                </button>
                                <button className="h-16 rounded-2xl border-2 border-slate-50 flex items-center justify-center hover:bg-slate-50 hover:border-slate-100 transition-all active:scale-95 group">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="size-6 group-hover:scale-110 transition-transform" alt="Apple" />
                                </button>
                            </div>
                        </div>

                        <p className="mt-16 text-center text-slate-400 font-bold text-sm">
                            Novo por aqui? <button onClick={() => navigate('/register')} className="text-[#22eb7e] hover:text-[#19c765] font-black transition-colors underline-offset-4 hover:underline">Cadastre-se grátis</button>
                        </p>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
