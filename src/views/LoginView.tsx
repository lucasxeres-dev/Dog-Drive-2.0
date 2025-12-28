import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/authService';
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
            {/* Split Screen Layout */}
            <div className="flex-1 flex flex-col lg:flex-row h-full">
                {/* Left Side: Dynamic Visual (Hidden on mobile small height) */}
                <div className="hidden lg:flex flex-[1.2] relative overflow-hidden bg-[#102217]">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-60 grayscale-[0.3]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/20 to-transparent" />

                    <div className="relative z-10 p-20 flex flex-col justify-between h-full">
                        <div className="flex items-center gap-4">
                            <div className="size-12 bg-[#22eb7e] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#22eb7e]/30">
                                <Dog size={24} className="text-[#102217]" strokeWidth={3} />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">Dog Drive</span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={16} className="text-[#22eb7e]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22eb7e]">Vibe Premium</span>
                            </div>
                            <h2 className="text-6xl font-black text-white leading-tight tracking-tight max-w-md">
                                Onde cada <span className="text-[#22eb7e]">match</span> conta uma história.
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form (Full width on mobile) */}
                <div className="flex-1 flex flex-col bg-white lg:rounded-l-[4rem] relative overflow-y-auto no-scrollbar">
                    {/* Header Controls */}
                    <header className="px-8 pt-10 pb-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20">
                        <div className="size-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                            <Globe size={18} />
                        </div>
                        <div className="flex gap-4">
                            <span className="text-[10px] font-black text-slate-900 border-b-2 border-[#22eb7e] pb-1 cursor-pointer">PT</span>
                            <span className="text-[10px] font-black text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">EN</span>
                        </div>
                    </header>

                    <main className="flex-1 px-8 py-10 max-w-md mx-auto w-full">
                        <div className="mb-10 lg:hidden flex flex-col items-center">
                            <div className="size-20 bg-[#22eb7e] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-[#22eb7e]/30 mb-6 group hover:scale-105 transition-transform cursor-pointer">
                                <Dog size={32} className="text-[#102217]" strokeWidth={3} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Dog Drive</h1>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">{t('welcome_back')}</p>
                        </div>

                        <div className="hidden lg:block mb-12">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Bem-vindo de volta!</h1>
                            <p className="text-slate-400 font-bold">Entre na sua conta para continuar.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="label-premium ml-4">E-mail ou Usuário</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        className="input-premium !pl-14"
                                        placeholder="ex: doglover@email.com"
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-4">
                                    <label className="label-premium">Senha</label>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-[#22eb7e] hover:text-[#19c765] transition-colors">Esqueceu?</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-focus-within:bg-[#22eb7e] transition-colors" />
                                    </div>
                                    <input
                                        className="input-premium !pl-14 !pr-14"
                                        placeholder="Digite sua senha"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#22eb7e] transition-all"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="btn-primary-premium w-full mt-6 group bg-[#102217]"
                            >
                                {loading ? (
                                    <div className="size-6 border-2 border-white/20 border-t-[#22eb7e] rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Entrar</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Social Login */}
                        <div className="mt-12">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Ou entre com</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="h-14 rounded-2xl border-2 border-slate-50 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 group">
                                    <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                                </button>
                                <button className="h-14 rounded-2xl border-2 border-slate-50 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 group">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Apple" />
                                </button>
                            </div>
                        </div>

                        <p className="mt-12 text-center text-slate-400 font-bold text-sm">
                            Primeira vez? <button onClick={() => navigate('/register')} className="text-[#22eb7e] hover:text-[#19c765] font-black transition-colors">Cadastre-se grátis</button>
                        </p>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
