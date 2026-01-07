import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/authService';
import { useSupabase } from '../hooks/useSupabase';
import { PremiumButton } from '../components/UIComponents';
import {
    Dog, Store, Briefcase, User, Mail, Lock,
    Check, ArrowRight, ArrowLeft, Building2,
    FileText, Phone, Sparkles
} from 'lucide-react';

const RegisterView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const supabase = useSupabase();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<'owner' | 'business' | 'provider' | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        username: '',
        phone: '',
        // Business fields
        nif: '',
        companyName: '',
        businessEmail: '',
        businessPhone: '',
        businessAddress: '',
        vatRegistered: false
    });

    const isBusinessRole = role === 'business' || role === 'provider';

    const handleRegister = async () => {
        // Validation Step 2
        if (!formData.fullName || formData.fullName.length < 3) {
            showNotification('Nome completo inválido', 'error');
            return;
        }
        if (!formData.email.includes('@')) {
            showNotification('E-mail inválido', 'error');
            return;
        }
        if (formData.password.length < 6) {
            showNotification('Senha deve ter no mínimo 6 caracteres', 'error');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            showNotification('As senhas não coincidem', 'error');
            return;
        }

        // Validation Step 3 (Business)
        if (isBusinessRole) {
            const nifRegex = /^[0-9]{9}$/;
            if (!nifRegex.test(formData.nif)) {
                showNotification('NIF deve ter 9 dígitos', 'error');
                return;
            }
            if (!formData.companyName || formData.companyName.length < 3) {
                showNotification('Nome da empresa inválido', 'error');
                return;
            }
        }

        setLoading(true);
        try {
            const cleanUsername = formData.username.trim().toLowerCase().replace('@', '');
            const { data, error } = await authService.signUp(formData.email, formData.password, {
                data: {
                    full_name: formData.fullName,
                    username: cleanUsername,
                    role: role,
                    country: 'PT'
                }
            });

            if (error) throw error;

            if (isBusinessRole && data.user) {
                const { error: businessError } = await supabase.from('business_profiles').insert({
                    user_id: data.user.id,
                    nif: formData.nif,
                    company_name: formData.companyName,
                    business_email: formData.businessEmail || formData.email,
                    business_phone: formData.businessPhone || formData.phone,
                    business_address: formData.businessAddress,
                    vat_registered: formData.vatRegistered
                });
                if (businessError) console.error('Business profile error:', businessError);
            }

            showNotification('Conta criada com sucesso!', 'success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            console.error('Registration error:', err);
            showNotification(err.message || 'Erro ao criar conta', 'error');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden">
            <div className="flex-1 flex flex-col lg:flex-row h-full">
                {/* Visual Left Side */}
                <div className="hidden lg:flex flex-[0.8] relative overflow-hidden bg-[#102217]">
                    <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&auto=format&fit=crop')] bg-cover bg-center grayscale-[0.3]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#102217]/90 via-[#102217]/40 to-transparent" />

                    <div className="relative z-10 p-16 xl:p-24 flex flex-col justify-between h-full">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-4"
                        >
                            <div className="size-14 xl:size-16 bg-[#22eb7e] rounded-[1.5rem] xl:rounded-[2rem] flex items-center justify-center shadow-glow">
                                <Dog size={32} className="text-[#102217]" strokeWidth={3} />
                            </div>
                            <span className="text-3xl xl:text-4xl font-black text-white tracking-tighter">Dog Drive</span>
                        </motion.div>

                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-px w-8 bg-[#22eb7e]/30" />
                                <Sparkles size={16} className="text-[#22eb7e]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#22eb7e]">Membro Premium</span>
                            </div>
                            <h2 className="text-5xl xl:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-4">
                                Comece sua <br /><span className="text-[#22eb7e]">jornada</span> hoje.
                            </h2>
                            <p className="text-white/40 font-bold text-lg xl:text-xl tracking-tight max-w-sm">Junte-se à maior plataforma pet plus de Portugal.</p>
                        </motion.div>
                    </div>
                </div>

                {/* Form Right Side */}
                <div className="flex-1 flex flex-col bg-white lg:rounded-l-[4rem] relative overflow-y-auto no-scrollbar shadow-[-40px_0_80px_rgba(0,0,0,0.03)]">
                    <header className="px-10 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-20">
                        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center">
                                    <div className={`size-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${step >= s ? 'bg-[#22eb7e] text-[#102217]' : 'text-slate-400'}`}>
                                        {step > s ? <Check size={12} strokeWidth={4} /> : s}
                                    </div>
                                    {s < 3 && <div className={`w-4 h-0.5 mx-1 rounded-full ${step > s ? 'bg-[#22eb7e]' : 'bg-slate-200'}`} />}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <span className="text-[11px] font-black text-[#102217] px-3 py-1.5 bg-slate-50 rounded-lg">PT</span>
                            <span className="text-[11px] font-black text-slate-400 px-3 py-1.5 hover:text-slate-600 transition-all uppercase tracking-widest cursor-pointer">EN</span>
                        </div>
                    </header>

                    <div className="px-10 py-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-[#22eb7e]" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                {step === 1 ? 'Tipo de Perfil' : step === 2 ? 'Identidade' : 'Configuração Profissional'}
                            </h2>
                        </div>
                    </div>


                    <main className="flex-1 overflow-y-auto px-8 py-12 no-scrollbar">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={containerVariants}
                                    initial="hidden" animate="visible" exit="exit"
                                    className="space-y-10 max-w-md mx-auto"
                                >
                                    <div className="text-center md:text-left">
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                                            Como você quer <span className="text-[#22eb7e] relative">começar<div className="absolute -bottom-1 left-0 w-full h-2 bg-[#22eb7e]/20 -rotate-1" /></span>?
                                        </h1>
                                        <p className="text-slate-500 font-bold leading-relaxed">Selecione seu tipo de perfil no ecossistema Dog Drive.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <RoleButton
                                            active={role === 'owner'}
                                            onClick={() => { setRole('owner'); nextStep(); }}
                                            icon={Dog}
                                            title="Sou Tutor"
                                            subtitle="Encontre o match perfeito e serviços incríveis"
                                        />
                                        <RoleButton
                                            active={role === 'business'}
                                            onClick={() => { setRole('business'); nextStep(); }}
                                            icon={Store}
                                            title="Sou Empresa"
                                            subtitle="Clínicas, PetShops e estabelecimentos"
                                        />
                                        <RoleButton
                                            active={role === 'provider'}
                                            onClick={() => { setRole('provider'); nextStep(); }}
                                            icon={Briefcase}
                                            title="Sou Colaborador"
                                            subtitle="Passeadores, Groomers e Dog Sitters"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={containerVariants}
                                    initial="hidden" animate="visible" exit="exit"
                                    className="space-y-10 max-w-md mx-auto"
                                >
                                    <div className="text-center md:text-left">
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                                            Suas <span className="text-[#22eb7e]">Credenciais</span>
                                        </h1>
                                        <p className="text-slate-500 font-bold leading-relaxed">Dados fundamentais para o seu acesso seguro.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Nome Completo</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#22eb7e] group-focus-within:bg-[#22eb7e]/10 transition-all">
                                                    <User size={20} strokeWidth={2.5} />
                                                </div>
                                                <input className="input-premium !pl-20" placeholder="João Silva" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Nome de Usuário</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#22eb7e] group-focus-within:bg-[#22eb7e]/10 transition-all">
                                                    <span className="font-black text-xl leading-none">@</span>
                                                </div>
                                                <input className="input-premium !pl-20" placeholder="joaosilva" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">E-mail</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#22eb7e] group-focus-within:bg-[#22eb7e]/10 transition-all">
                                                    <Mail size={20} strokeWidth={2.5} />
                                                </div>
                                                <input className="input-premium !pl-20" placeholder="exemplo@gmail.com" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 group">
                                                <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Senha</label>
                                                <div className="relative">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#22eb7e] group-focus-within:bg-[#22eb7e]/10 transition-all">
                                                        <Lock size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <input className="input-premium !pl-20" placeholder="••••••••" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Confirmar</label>
                                                <div className="relative">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#22eb7e] group-focus-within:bg-[#22eb7e]/10 transition-all">
                                                        <Lock size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <input className="input-premium !pl-20" placeholder="••••••••" type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex flex-col md:flex-row gap-4">
                                        <PremiumButton variant="ghost" onClick={prevStep} className="flex-1 py-6">
                                            <ArrowLeft size={18} className="mr-3" /> Voltar
                                        </PremiumButton>
                                        <PremiumButton onClick={isBusinessRole ? nextStep : handleRegister} className="flex-1 py-6">
                                            {isBusinessRole ? 'Continuar Configuração' : 'Finalizar Registro'} <ArrowRight size={18} className="ml-3" />
                                        </PremiumButton>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    variants={containerVariants}
                                    initial="hidden" animate="visible" exit="exit"
                                    className="space-y-10 max-w-md mx-auto"
                                >
                                    <div className="text-center md:text-left">
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                                            Dados do <span className="text-[#22eb7e]">Negócio</span>
                                        </h1>
                                        <p className="text-slate-500 font-bold leading-relaxed">Informações comerciais e fiscais para Portugal.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">NIF (Portugal)</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#102217] group-focus-within:bg-[#22eb7e] transition-all">
                                                    <FileText size={20} strokeWidth={2.5} />
                                                </div>
                                                <input className="input-premium !pl-20" placeholder="123 456 789" value={formData.nif} onChange={e => setFormData({ ...formData, nif: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Nome Comercial</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#102217] group-focus-within:bg-[#22eb7e] transition-all">
                                                    <Building2 size={20} strokeWidth={2.5} />
                                                </div>
                                                <input className="input-premium !pl-20" placeholder="Minha Loja Pet" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Endereço Principal</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#102217] group-focus-within:bg-[#22eb7e] transition-all">
                                                    <Phone size={20} strokeWidth={2.5} />
                                                </div>
                                                <input className="input-premium !pl-20" placeholder="Rua, Cidade, Portugal" value={formData.businessAddress} onChange={e => setFormData({ ...formData, businessAddress: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Telemóvel de Contato</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#102217] group-focus-within:bg-[#22eb7e] transition-all">
                                                    <Phone size={20} strokeWidth={2.5} />
                                                </div>
                                                <input className="input-premium !pl-20" placeholder="+351 9xx xxx xxx" value={formData.businessPhone} onChange={e => setFormData({ ...formData, businessPhone: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex flex-col md:flex-row gap-4">
                                        <PremiumButton variant="ghost" onClick={prevStep} className="flex-1 py-6">
                                            <ArrowLeft size={18} className="mr-3" /> Voltar
                                        </PremiumButton>
                                        <PremiumButton onClick={handleRegister} isLoading={loading} className="flex-1 py-6">
                                            Finalizar e Entrar <ArrowRight size={18} className="ml-3" />
                                        </PremiumButton>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-16 text-center text-slate-400 font-bold text-sm"
                        >
                            Já possui conta? <button onClick={() => navigate('/login')} className="text-[#22eb7e] hover:text-[#19c765] font-black transition-colors underline underline-offset-4 decoration-2">Entrar agora</button>
                        </motion.p>
                    </main>
                </div>
            </div>
        </div>
    );
};

const RoleButton: React.FC<{ active: boolean, onClick: () => void, icon: any, title: string, subtitle: string }> = ({ active, onClick, icon: Icon, title, subtitle }) => (
    <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full p-8 rounded-[3rem] border-4 text-left transition-all duration-500 group relative overflow-hidden ${active
            ? 'bg-[#102217] border-[#22eb7e] shadow-2xl shadow-[#22eb7e]/20'
            : 'bg-white border-white shadow-xl shadow-slate-200/40 hover:border-slate-100'
            }`}
    >
        {active && (
            <motion.div
                layoutId="active-bg-accent"
                className="absolute top-0 right-0 w-32 h-32 bg-[#22eb7e]/10 rounded-full -mr-16 -mt-16 blur-3xl"
            />
        )}
        <div className="relative z-10 flex items-center gap-8">
            <div className={`size-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${active
                ? 'bg-[#22eb7e] text-[#102217] rotate-3 shadow-glow'
                : 'bg-slate-50 text-slate-300 group-hover:bg-[#22eb7e]/10 group-hover:text-[#22eb7e]'
                }`}>
                <Icon size={36} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
                <h4 className={`text-2xl font-black transition-colors duration-500 tracking-tight ${active ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
                <p className={`text-[11px] font-bold leading-relaxed mt-1 tracking-wide uppercase ${active ? 'text-[#22eb7e]/60' : 'text-slate-400'}`}>{subtitle}</p>
            </div>
            {active && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="size-10 rounded-2xl bg-[#22eb7e] flex items-center justify-center shadow-lg"
                >
                    <Check size={22} className="text-[#102217] stroke-[4]" />
                </motion.div>
            )}
        </div>
    </motion.button>
);

export default RegisterView;
