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

    // Forgot password modal state
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const validateForm = () => {
        if (!email || !password) {
            showNotification('Por favor, preencha todos os campos', 'error');
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        if (!isSupabaseConfigured) {
            showNotification('Supabase não configurado. Verifique seu arquivo .env', 'error');
            return;
        }

        setLoading(true);
        try {
            const { data: { user, session }, error: authError } = await authService.signIn(email, password);

            if (authError) {
                console.error('Supabase Auth Error:', authError);
                if (authError.message === 'Invalid login credentials') {
                    showNotification('E-mail ou senha incorretos. Tente novamente.', 'error');
                } else {
                    showNotification(`Erro: ${authError.message}`, 'error');
                }
                return;
            }

            if (user && session) {
                const profile = await authService.getProfile(user.id);
                onLogin();

                // Optimized routing based on onboarding status
                const hasCompletedOnboarding = !!(profile as any)?.latitude;

                if (!hasCompletedOnboarding) {
                    navigate('/onboarding');
                } else {
                    navigate('/feed');
                }
                showNotification('Bem-vindo de volta!', 'success');
            }
        } catch (err: any) {
            console.error('Unexpected Login Error:', err);
            showNotification('Ops, algo deu errado. Poderia tentar novamente?', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!resetEmail) {
            showNotification('Por favor, insira seu e-mail', 'error');
            return;
        }

        setResetLoading(true);
        try {
            const { error } = await authService.resetPassword(resetEmail, `${window.location.origin}/#/settings?tab=password`);

            if (error) throw error;

            showNotification('E-mail de recuperação enviado!', 'success');
            setShowForgotPassword(false);
            setResetEmail('');
        } catch (err: any) {
            console.error('Reset password error:', err);
            showNotification('Ops, não conseguimos enviar o e-mail. Tente novamente mais tarde.', 'error');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#050705] overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto px-10 py-16 flex flex-col">
                <div className="w-full flex flex-col items-center mb-16">
                    <div className="w-20 h-20 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-[0_15px_40px_rgba(34,197,94,0.4)] transform rotate-6 mb-8">
                        <span className="material-symbols-outlined text-[#050705] text-[40px] font-black">pets</span>
                    </div>
                    <h2 className="text-white text-4xl font-black uppercase text-center tracking-tighter leading-none mb-3">DOG DRIVE</h2>
                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] text-center">Your Premium Dog Network</p>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="label-premium">Endereço de E-mail</label>
                        <div className="relative group">
                            <input
                                className="input-premium"
                                placeholder="seu@email.com"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none opacity-20 group-focus-within:opacity-100 group-focus-within:text-primary transition-all">
                                <span className="material-symbols-outlined text-2xl font-black">mail</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="label-premium">Sua Senha</label>
                        <div className="relative group">
                            <input
                                className="input-premium"
                                placeholder="••••••••"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none opacity-20 group-focus-within:opacity-100 group-focus-within:text-primary transition-all">
                                <span className="material-symbols-outlined text-2xl font-black">lock</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pr-2">
                        <button
                            onClick={() => setShowForgotPassword(true)}
                            className="text-primary hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Esqueceu a senha?
                        </button>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="btn-primary-premium w-full !h-20 !text-2xl"
                    >
                        {loading ? (
                            <div className="w-8 h-8 border-4 border-[#050705] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>ENTRAR</span>
                                <span className="material-symbols-outlined text-3xl font-black">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>

                <p className="text-center mt-auto pt-10 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    Não tem conta? <button onClick={() => navigate('/register')} className="text-primary hover:underline ml-1">CRIAR AGORA</button>
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-8">
                    <div className="premium-card p-10 w-full max-w-md animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black uppercase text-white tracking-tight">Recuperar Senha</h3>
                            <button
                                onClick={() => setShowForgotPassword(false)}
                                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined font-black">close</span>
                            </button>
                        </div>

                        <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">
                            Digite seu e-mail e enviaremos um link exclusivo para a redefinição de segurança.
                        </p>

                        <div className="space-y-6">
                            <div className="relative group">
                                <input
                                    className="input-premium"
                                    placeholder="seu@email.com"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleForgotPassword}
                                disabled={resetLoading}
                                className="btn-primary-premium w-full"
                            >
                                {resetLoading ? (
                                    <div className="w-7 h-7 border-4 border-[#050705] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-black">send</span>
                                        <span>Enviar Link</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginView;
