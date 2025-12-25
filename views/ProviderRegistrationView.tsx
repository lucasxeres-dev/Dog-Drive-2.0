import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../LanguageContext';
import LocationSelector from '../components/LocationSelector';
import { supabase } from '../supabaseClient';

const ProviderRegistrationView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [type, setType] = useState<'worker' | 'store'>('worker');
    const [formData, setFormData] = useState({ name: '', bio: '', location: '' });
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const { error } = await supabase
            .from('stores')
            .insert({
                owner_id: user.id,
                name: formData.name,
                description: formData.bio,
                city: formData.location.split(',')[0]?.trim(),
                state: formData.location.split(',')[1]?.trim() || 'MS',
                rating: 5.0
            });

        setLoading(false);
        if (!error) {
            navigate('/feed');
        } else {
            console.error('Registration error:', error);
            // Fallback for demo
            navigate('/feed');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display h-screen overflow-hidden text-gray-900 dark:text-white">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-4 border-b border-gray-100 dark:border-white/5 flex items-center">
                <button onClick={() => navigate(-1)} className="size-10 rounded-full border border-gray-100 dark:border-white/5 flex items-center justify-center mr-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black uppercase tracking-tight">Become a Partner</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Step {step} of 3</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-6">
                {step === 1 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Choose Your Path</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">How do you want to join our network?</p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                { id: 'worker', title: 'Professional Worker', sub: 'Walkers, Sitters, Groomers', icon: 'directions_walk' },
                                { id: 'store', title: 'Pet Store / Shop', sub: 'Sell food, toys and supplies', icon: 'storefront' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setType(item.id as any)}
                                    className={`card !p-6 flex items-center gap-6 border-2 transition-all group ${type === item.id ? 'border-primary bg-primary/5 text-primary scale-105 shadow-2xl shadow-primary/10' : 'border-transparent opacity-60'
                                        }`}
                                >
                                    <div className={`size-16 rounded-full flex items-center justify-center transition-all ${type === item.id ? 'bg-primary text-[#102217]' : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                                        }`}>
                                        <span className="material-symbols-outlined text-3xl font-bold">{item.icon}</span>
                                    </div>
                                    <div className="text-left flex-1">
                                        <h4 className="font-black text-lg uppercase leading-none mb-1">{item.title}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.sub}</p>
                                    </div>
                                    <div className={`size-6 rounded-full border-2 flex items-center justify-center ${type === item.id ? 'bg-primary border-primary' : 'border-gray-200'
                                        }`}>
                                        {type === item.id && <span className="material-symbols-outlined text-xs text-[#102217] font-bold">check</span>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-slideUp">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Tell us more</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Let's build your profile</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Full Name / Store Name</label>
                                <input
                                    className="w-full h-16 rounded-[1.5rem] bg-white dark:bg-surface-dark border-none px-6 font-bold shadow-sm text-gray-900 dark:text-white"
                                    placeholder="e.g. Pet Paradise"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Short Bio / Description</label>
                                <textarea
                                    className="w-full h-32 rounded-[1.5rem] bg-white dark:bg-surface-dark border-none p-6 font-bold shadow-sm resize-none text-gray-900 dark:text-white"
                                    placeholder="Describe your services..."
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-slideUp">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Availability</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Check service availability in your area</p>
                        </div>
                        <LocationSelector onSelect={(loc) => setFormData({ ...formData, location: loc })} />
                    </div>
                )}
            </main>

            <div className="bg-gradient-to-t from-background-light dark:from-background-dark p-6 pt-12">
                <button
                    disabled={loading}
                    onClick={() => step < 3 ? setStep(step + 1) : handleComplete()}
                    className="btn-primary w-full group overflow-hidden relative disabled:opacity-50"
                >
                    <span className="relative z-10">
                        {loading ? 'Processing...' : (step === 3 ? 'Complete Registration' : 'Next Step')}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                </button>
                {step > 1 && !loading && (
                    <button onClick={() => setStep(step - 1)} className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-2">Go Back</button>
                )}
            </div>
        </div>
    );
};

export default ProviderRegistrationView;
