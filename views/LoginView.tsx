
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../LanguageContext';
import { supabase } from '../supabaseClient';

interface LoginViewProps {
    onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            onLogin();
            navigate('/onboarding');
        } catch (err: any) {
            setError(err.message || 'Error signing in');
        } finally {
            setLoading(false);
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

                {error && (
                    <div className="mb-6 p-4 rounded-3xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-center gap-3 animate-shake">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-tight">{error}</p>
                    </div>
                )}

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
                        <button className="text-gray-400 hover:text-primary text-[10px] font-black uppercase tracking-wider transition-colors">{t('forgot_pass')}</button>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`btn-primary w-full h-16 text-lg uppercase tracking-widest ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-[#050705] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>{t('enter_btn')}</span>
                                <span className="material-symbols-outlined font-black">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100 dark:border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px]">
                        <span className="px-6 bg-background-light dark:bg-background-dark text-gray-400 font-black uppercase tracking-[0.2em]">{t('or_continue')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="h-16 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/30 flex items-center justify-center transition-all shadow-sm hover:shadow-md">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                        <span className="ml-2 font-black text-[10px] uppercase tracking-wider">Google</span>
                    </button>
                    <button className="h-16 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/30 flex items-center justify-center transition-all shadow-sm hover:shadow-md">
                        <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-6 h-6 dark:invert" alt="Apple" />
                        <span className="ml-2 font-black text-[10px] uppercase tracking-wider">Apple</span>
                    </button>
                </div>

                <p className="text-center mt-8 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                    {t('no_account')} <button onClick={() => navigate('/register')} className="text-primary hover:underline ml-1">{t('signup_action')}</button>
                </p>
            </div>
        </div>
    );
};

export default LoginView;
