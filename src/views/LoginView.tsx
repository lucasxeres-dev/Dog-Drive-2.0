import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

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
        <div className="flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar">
            {/* Top Image Section */}
            <div className="relative h-[40vh] w-full">
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale-[0.2]"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop")' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-white"></div>
                </div>

                {/* Language Selector */}
                <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 border border-black/5 shadow-sm text-[10px] font-bold">
                    <span className="text-slate-900">PT</span>
                    <span className="text-slate-400">EN</span>
                </div>

                {/* Logo Section */}
                <div className="absolute bottom-4 left-0 w-full flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#22eb7e] rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-[#22eb7e]/30 mb-3">
                        <span className="material-symbols-outlined text-black text-3xl font-black">pets</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Dog Drive</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">O match perfeito para seu pet</p>
                </div>
            </div>

            {/* Form Section */}
            <div className="px-8 pt-8 pb-12 flex flex-col">
                <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Bem-vindo de volta!</h2>

                <div className="space-y-6">
                    <div>
                        <label className="text-slate-900 text-sm font-bold mb-2 block ml-1">E-mail ou Usuário</label>
                        <div className="relative group">
                            <input
                                className="input-premium"
                                placeholder="ex: doglover@email.com"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none text-slate-300">
                                <span className="material-symbols-outlined text-2xl">person</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-900 text-sm font-bold mb-2 block ml-1">Senha</label>
                        <div className="relative group">
                            <input
                                className="input-premium"
                                placeholder="Digite sua senha"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-6 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-2xl">
                                    {showPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                        <div className="flex justify-end mt-2">
                            <button className="text-slate-400 text-sm font-bold hover:text-slate-600">Esqueceu sua senha?</button>
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="btn-primary-premium w-full !h-16 !text-lg !font-black !rounded-full shadow-lg shadow-[#22eb7e]/20 mt-4 active:scale-95 transition-all"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Entrar</span>
                                <span className="material-symbols-outlined font-black">arrow_forward</span>
                            </div>
                        )}
                    </button>
                </div>

                <div className="mt-10 mb-8 flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OU CONTINUE COM</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                <div className="flex justify-center gap-6 mb-10">
                    <button className="w-14 h-14 rounded-full border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all">
                        <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-6 h-6" alt="Google" />
                    </button>
                    <button className="w-14 h-14 rounded-full border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-6 h-6" alt="Apple" />
                    </button>
                </div>

                <p className="text-center text-slate-500 text-sm font-bold">
                    Não tem uma conta? <button onClick={() => navigate('/register')} className="text-[#22eb7e] hover:underline font-black outline-none">Cadastre-se</button>
                </p>
            </div>
        </div>
    );
};

export default LoginView;
