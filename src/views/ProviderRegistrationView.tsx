import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import LocationSelector from '../components/LocationSelector';
import { useSupabase } from '../hooks/useSupabase';
import {
    ChevronLeft, Store, Briefcase, Check,
    ArrowRight, MapPin, Heart, Sparkles,
    Search
} from 'lucide-react';

const ProviderRegistrationView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const supabase = useSupabase();
    const [step, setStep] = useState(1);
    const [type, setType] = useState<'worker' | 'store'>('worker');
    const [formData, setFormData] = useState({ name: '', bio: '', location: '' });
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        setLoading(true);
        try {
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

            if (error) throw error;
            showNotification('Registro concluído!', 'success');
            navigate('/feed');
        } catch (err: any) {
            console.error('Registration error:', err);
            showNotification(err.message || 'Erro ao registrar', 'error');
            // Fallback for demo UX
            navigate('/feed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden">
            <header className="px-6 pt-12 pb-6 flex items-center bg-white border-b border-slate-100 sticky top-0 z-50">
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                    className="size-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 active:scale-95 transition-all mr-6 hover:bg-slate-100"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={14} className="text-[#22eb7e]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22eb7e]">Partner Program</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Torne-se Parceiro</h1>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Etapa {step} de 3</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-10">
                {step === 1 && (
                    <div className="space-y-10 animate-fade-in max-w-md mx-auto">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">Escolha o seu <span className="text-[#22eb7e]">Caminho</span></h2>
                            <p className="text-slate-500 font-bold">Como você deseja se juntar à nossa rede?</p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                { id: 'worker', title: 'Profissional Autônomo', sub: 'Passeadores, Groomers, Dog Sitters', icon: Briefcase },
                                { id: 'store', title: 'Pet Shop / Loja', sub: 'Venda produtos e suprimentos', icon: Store }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setType(item.id as any)}
                                    className={`flex items-center gap-6 p-6 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden ${type === item.id ? 'bg-[#22eb7e]/5 border-[#22eb7e] shadow-2xl shadow-[#22eb7e]/10' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                                >
                                    <div className={`size-16 rounded-3xl flex items-center justify-center transition-all ${type === item.id ? 'bg-[#22eb7e] text-[#102217]' : 'bg-slate-50 text-slate-300 group-hover:bg-[#22eb7e]/10 group-hover:text-[#22eb7e]'}`}>
                                        <item.icon size={32} strokeWidth={2.5} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h4 className={`text-lg font-black leading-none mb-1 transition-colors ${type === item.id ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>{item.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.sub}</p>
                                    </div>
                                    <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${type === item.id ? 'bg-[#22eb7e] border-[#22eb7e] scale-110' : 'border-slate-200'}`}>
                                        {type === item.id && <Check size={14} className="text-[#102217] stroke-[4]" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-10 animate-slide-up max-w-md mx-auto">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">Fale sobre <span className="text-[#22eb7e]">Você</span></h2>
                            <p className="text-slate-500 font-bold">Vamos construir o seu perfil profissional.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="label-premium ml-4">Nome Completo ou da Loja</label>
                                <input
                                    className="input-premium"
                                    placeholder="Ex: Pet Paradise"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="label-premium ml-4">Breve Biografia / Descrição</label>
                                <textarea
                                    className="input-premium !h-40 !py-6 resize-none"
                                    placeholder="Descreva seus serviços e diferenciais..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-10 animate-slide-up max-w-md mx-auto">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">Sua <span className="text-[#22eb7e]">Localização</span></h2>
                            <p className="text-slate-500 font-bold">Verifique a disponibilidade em sua região.</p>
                        </div>

                        <div className="premium-card !p-0 overflow-hidden bg-white shadow-2xl shadow-slate-200/40">
                            <div className="p-8 border-b border-slate-50">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-10 rounded-xl bg-[#22eb7e]/10 flex items-center justify-center text-[#22eb7e]">
                                        <MapPin size={20} />
                                    </div>
                                    <h4 className="font-black text-slate-900">Selecione sua Cidade</h4>
                                </div>
                                <LocationSelector onSelect={(loc) => setFormData({ ...formData, location: loc })} />
                            </div>
                            <div className="p-6 bg-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                    Expandindo para novas regiões em breve 🌍
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="px-6 py-10 bg-white/80 backdrop-blur-xl border-t border-slate-100 sticky bottom-0 z-50">
                <button
                    disabled={loading || (step === 3 && !formData.location)}
                    onClick={() => step < 3 ? setStep(step + 1) : handleComplete()}
                    className="btn-primary-premium w-full group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10">
                        {loading ? (
                            <div className="size-6 border-2 border-[#102217]/10 border-t-[#22eb7e] rounded-full animate-spin mx-auto" />
                        ) : (
                            step === 3 ? 'Finalizar Cadastro' : 'Continuar'
                        )}
                    </span>
                    {!loading && <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                </button>
            </footer>
        </div>
    );
};

export default ProviderRegistrationView;
