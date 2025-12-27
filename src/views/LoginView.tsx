import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/authService';

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
        if (!/\S+@\S+\.\S+/.test(email)) {
            showNotification('E-mail inválido', 'error');
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const { data: { user, session }, error: authError } = await authService.signIn(email, password);
            if (authError) throw authError;

            if (user && session) {
                const profile = await authService.getProfile(user.id);
                onLogin();

                if (profile?.role === 'user') {
                    navigate('/walkers');
                } else if (profile?.role === 'provider' || profile?.role === 'business') {
                    navigate('/feed');
                } else {
                    navigate('/onboarding');
                }
                showNotification('Bem-vindo de volta!', 'success');
            }
        } catch (err: any) {
            console.error('Login error:', err);
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
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col">
                <div className="w-full flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-6">
                        <span className="material-symbols-outlined text-[#050705] text-[32px] font-black">pets</span>
                    </div>
                    <h2 className="text-[#111814] dark:text-white text-3xl font-black uppercase text-center">{t('login_title')}</h2>
                    <p className="text-gray-400 text-sm font-medium mt-2 text-center lowercase">{t('login_subtitle')}</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">{t('email_label')}</label>
                        <div className="relative group">
                            <input
                                className="w-full rounded-3xl border-2 border-transparent bg-white dark:bg-white/5 h-16 pl-6 pr-12 text-base font-bold transition-all outline-none focus:bg-white dark:focus:bg-black/20 focus:border-primary shadow-sm focus:shadow-xl focus:shadow-primary/5"
                                placeholder={t('email_placeholder')}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                                <span className="material-symbols-outlined text-gray-300 group-focus-within:text-primary transition-colors">mail</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">{t('password_label')}</label>
                        <div className="relative group">
                            <input
                                className="w-full rounded-3xl border-2 border-transparent bg-white dark:bg-white/5 h-16 pl-6 pr-12 text-base font-bold transition-all outline-none focus:bg-white dark:focus:bg-black/20 focus:border-primary shadow-sm focus:shadow-xl focus:shadow-primary/5"
                                placeholder={t('password_placeholder')}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                                <span className="material-symbols-outlined text-gray-300 group-focus-within:text-primary transition-colors">lock</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pr-2">
                        <button
                            onClick={() => setShowForgotPassword(true)}
                            className="text-primary hover:text-primary/80 text-[11px] font-black uppercase tracking-wider transition-colors underline underline-offset-2"
                        >
                            {t('forgot_pass')}
                        </button>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`w-full h-20 bg-primary hover:bg-primary/90 text-[#050705] font-black text-xl uppercase tracking-widest rounded-3xl shadow-[0_12px_40px_rgba(39,241,123,0.4)] hover:shadow-[0_16px_50px_rgba(39,241,123,0.5)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? (
                            <div className="w-8 h-8 border-4 border-[#050705] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>ENTRAR</span>
                                <span className="material-symbols-outlined text-2xl font-black">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>

                <p className="text-center mt-8 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                    {t('no_account')} <button onClick={() => navigate('/register')} className="text-primary hover:underline ml-1">{t('signup_action')}</button>
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-[#111814] rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black uppercase text-[#111814] dark:text-white">Recuperar Senha</h3>
                            <button
                                onClick={() => setShowForgotPassword(false)}
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            Digite seu e-mail e enviaremos um link para você redefinir sua senha.
                        </p>

                        <div className="space-y-4">
                            <div className="relative group">
                                <input
                                    className="w-full rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-white/5 h-14 pl-5 pr-12 text-base font-bold transition-all outline-none focus:bg-white dark:focus:bg-black/20 focus:border-primary"
                                    placeholder="seu@email.com"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-300 group-focus-within:text-primary transition-colors">mail</span>
                                </div>
                            </div>

                            <button
                                onClick={handleForgotPassword}
                                disabled={resetLoading}
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-[#050705] font-black uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                {resetLoading ? (
                                    <div className="w-6 h-6 border-3 border-[#050705] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">send</span>
                                        <span>Enviar Link</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <button
                            onClick={() => setShowForgotPassword(false)}
                            className="w-full mt-4 text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors"
                        >
                            Voltar ao login
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginView;
