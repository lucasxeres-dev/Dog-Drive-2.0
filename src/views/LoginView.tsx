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
    const { t, language, setLanguage } = useTranslation();
    const { showNotification } = useNotification();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            showNotification(t('fill_email_pass') || 'Preencha e-mail e senha', 'error');
            return;
        }

        setLoading(true);
        try {
            const { data: { user, session }, error: authError } = await authService.signIn(email, password);
            if (authError) throw authError;

            if (user && session) {
                onLogin();
                navigate('/feed');
                showNotification(t('login_welcome_back') || 'Bem-vindo de volta!', 'success');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            showNotification(err.message || t('login_error') || 'Erro ao entrar', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        try {
            const { error } = await authService.signInWithOAuth(provider);
            if (error) throw error;
        } catch (err: any) {
            console.error(`${provider} login error:`, err);
            showNotification(`${t('login_error')}: ${err.message}`, 'error');
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            showNotification(t('email_required_forgot') || 'Por favor, insira seu e-mail primeiro', 'error');
            return;
        }

        try {
            const redirectTo = `${window.location.origin}/reset-password`;
            const { error } = await authService.resetPassword(email, redirectTo);
            if (error) throw error;
            showNotification(t('reset_email_sent') || 'E-mail de recuperação enviado!', 'success');
        } catch (err: any) {
            showNotification(err.message, 'error');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden">
            <div className="flex-1 flex flex-col h-full bg-white relative overflow-y-auto no-scrollbar shadow-2xl">
                <header className="px-10 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-20">
                    <div
                        onClick={() => showNotification(t('globe_info') || 'Idiomas adicionais em breve!', 'info')}
                        className="size-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#22eb7e] active:scale-95 transition-all cursor-pointer group"
                    >
                        <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <button
                            onClick={() => setLanguage('pt')}
                            className={`px-4 py-1.5 text-[10px] font-black transition-all uppercase tracking-widest rounded-xl active:scale-95 ${language === 'pt' ? 'text-[#102217] bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            PT
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-4 py-1.5 text-[10px] font-black transition-all uppercase tracking-widest rounded-xl active:scale-95 ${language === 'en' ? 'text-[#102217] bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            EN
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-10 xl:px-20 py-16 flex flex-col justify-center max-w-2xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12"
                    >
                        <div className="lg:hidden flex flex-col items-center mb-10">
                            <div className="size-24 bg-[#22eb7e] rounded-[2.5rem] flex items-center justify-center shadow-glow mb-6 animate-float">
                                <Dog size={40} className="text-[#102217]" strokeWidth={3} />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{t('app_name')}</h1>
                            <p className="text-[#22eb7e] text-[10px] font-black uppercase tracking-[0.3em] mt-3">Premium Pet Cloud</p>
                        </div>

                        <div>
                            <h1 className="text-5xl xl:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">{t('login_welcome')} <br />{t('login_welcome_back_split')} <span className="text-[#22eb7e]">{t('login_welcome_back_accent')}</span>!</h1>
                            <p className="text-slate-400 font-bold text-lg xl:text-xl">{t('login_subtitle_new')}</p>
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
                            <label className="label-premium">{t('email_label')}</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#22eb7e] transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    className="input-premium !pl-16 bg-slate-50/50 border-slate-100/50"
                                    placeholder={t('email_placeholder')}
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
                                <label className="label-premium !ml-0">{t('password_label')}</label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-[10px] font-black uppercase tracking-widest text-[#22eb7e] hover:text-[#19c765] active:scale-95 transition-all outline-none"
                                >
                                    {t('forgot_short')}
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#22eb7e] transition-colors">
                                    <div className="size-2 rounded-full bg-current" />
                                </div>
                                <input
                                    className="input-premium !pl-16 !pr-16 bg-slate-50/50 border-slate-100/50"
                                    placeholder={t('password_placeholder')}
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
                                <span>{t('enter_btn')}</span>
                                <ArrowRight size={20} />
                            </PremiumButton>
                        </div>
                    </form>

                    {/* Social Login */}
                    <div className="mt-16">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="flex-1 h-px bg-slate-50" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{t('quick_access')}</span>
                            <div className="flex-1 h-px bg-slate-50" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="h-16 rounded-2xl border-2 border-slate-50 flex items-center justify-center hover:bg-slate-50 hover:border-slate-100 transition-all active:scale-95 group shadow-sm hover:shadow-md"
                            >
                                <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="size-6 group-hover:scale-110 transition-transform" alt="Google" />
                            </button>
                            <button
                                onClick={() => handleSocialLogin('apple')}
                                className="h-16 rounded-2xl border-2 border-slate-50 flex items-center justify-center hover:bg-slate-50 hover:border-slate-100 transition-all active:scale-95 group shadow-sm hover:shadow-md"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="size-6 group-hover:scale-110 transition-transform" alt="Apple" />
                            </button>
                        </div>
                    </div>

                    <p className="mt-16 text-center text-slate-400 font-bold text-sm">
                        {t('no_account')} <button onClick={() => navigate('/register')} className="text-[#22eb7e] hover:text-[#19c765] font-black transition-colors underline-offset-4 hover:underline">{t('signup_action')}</button>
                    </p>
                </main>
            </div>
        </div>
    );
};

export default LoginView;
