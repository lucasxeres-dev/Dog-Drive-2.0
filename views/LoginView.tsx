
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
        <div className="flex-1 flex flex-col lg:flex-row bg-background-light dark:bg-background-dark overflow-hidden h-screen">
            {/* Left Side - Image & Info (Hidden on mobile, visible on lg) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop")' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                <div className="relative z-10 p-12 flex flex-col justify-end h-full text-white">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-6">
                            <span className="material-symbols-outlined text-background-dark text-[40px]">pets</span>
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Dog Drive</h1>
                        <p className="text-xl font-medium text-gray-300 max-w-md">{t('login_subtitle')}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/10">
                            <span className="material-symbols-outlined text-3xl mb-2 text-primary">verified_user</span>
                            <h3 className="font-bold text-lg">Verified Walkers</h3>
                            <p className="text-sm text-gray-400 mt-1">Every walker is vetted and identity-checked.</p>
                        </div>
                        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/10">
                             <span className="material-symbols-outlined text-3xl mb-2 text-primary">location_on</span>
                            <h3 className="font-bold text-lg">Live Tracking</h3>
                            <p className="text-sm text-gray-400 mt-1">Watch your dog's walk in real-time on our map.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col relative bg-white dark:bg-background-dark">
                {/* Mobile Header (only visible on small screens) */}
                <div className="lg:hidden h-[240px] relative shrink-0">
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-background-dark z-10"></div>
                     <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop")' }}></div>
                     <div className="absolute bottom-4 left-6 z-20">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg transform rotate-3 mb-2">
                             <span className="material-symbols-outlined text-background-dark text-[28px]">pets</span>
                        </div>
                        <h1 className="text-[#111814] dark:text-white tracking-tight text-3xl font-extrabold">Dog Drive</h1>
                     </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 lg:px-24 py-8 flex flex-col justify-center">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-10">
                            <h2 className="text-[#111814] dark:text-white text-3xl font-bold mb-2">{t('login_title')}</h2>
                            <p className="text-gray-500 dark:text-gray-400">Welcome back! Please enter your details.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 flex items-center gap-3 animate-shake">
                                <span className="material-symbols-outlined text-red-500">error</span>
                                <p className="text-red-500 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[#111814] dark:text-gray-200 text-sm font-bold mb-2 ml-1">{t('email_label')}</label>
                                <div className="relative group">
                                    <input
                                        className="w-full rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-white/5 h-14 pl-4 pr-12 text-base font-medium transition-all outline-none ring-2 ring-transparent focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-primary/20"
                                        placeholder={t('email_placeholder')}
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                         <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">mail</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[#111814] dark:text-gray-200 text-sm font-bold mb-2 ml-1">{t('password_label')}</label>
                                <div className="relative group">
                                    <input
                                        className="w-full rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-white/5 h-14 pl-4 pr-12 text-base font-medium transition-all outline-none ring-2 ring-transparent focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-primary/20"
                                        placeholder={t('password_placeholder')}
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">lock</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm font-bold transition-colors">{t('forgot_pass')}</button>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className={`w-full h-14 bg-primary hover:bg-[#1ee870] active:scale-[0.98] transition-all text-background-dark text-lg font-bold rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>{t('enter_btn')}</span>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-background-dark text-gray-400 font-bold uppercase tracking-wider text-xs">{t('or_continue')}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="h-14 rounded-2xl border-2 border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center justify-center transition-all">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                                <span className="ml-2 font-bold text-sm">Google</span>
                            </button>
                            <button className="h-14 rounded-2xl border-2 border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center justify-center transition-all">
                                <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-6 h-6 dark:invert" alt="Apple" />
                                <span className="ml-2 font-bold text-sm text-[#111814] dark:text-white">Apple</span>
                            </button>
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-gray-600 dark:text-gray-400 font-medium">{t('no_account')} <button className="text-primary font-bold hover:underline">{t('sign_up')}</button></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
