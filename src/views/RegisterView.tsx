import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/authService';
import { useSupabase } from '../hooks/useSupabase';
import {
    Dog, Store, Briefcase, User, Mail, Lock,
    Check, ArrowRight, ArrowLeft, Building2,
    FileText, Phone
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
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden h-screen">
            {/* Header / Progress */}
            <header className="pt-12 pb-6 px-8 flex flex-col items-center bg-white border-b border-slate-100">
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-700 ${step >= s ? 'w-8 bg-[#22eb7e]' : 'w-4 bg-slate-100'}`}
                        />
                    ))}
                </div>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                    {step === 1 ? 'Perfil' : step === 2 ? 'Identidade' : 'Negócio'}
                </h2>
            </header>

            <main className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={containerVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="space-y-6 max-w-md mx-auto"
                        >
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Como você quer <span className="text-[#22eb7e]">começar</span>?</h1>
                                <p className="text-slate-500 font-bold">Selecione seu tipo de perfil no Dog Drive.</p>
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
                                    title="Sou Provedor"
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
                            className="space-y-6 max-w-md mx-auto"
                        >
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Suas <span className="text-[#22eb7e]">Credenciais</span></h1>
                                <p className="text-slate-500 font-bold">Dados básicos para seu acesso seguro.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="label-premium ml-4">Nome Completo</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input className="input-premium !pl-14" placeholder="João Silva" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="label-premium ml-4">Nome de Usuário</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">@</span>
                                        <input className="input-premium !pl-12" placeholder="joaosilva" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="label-premium ml-4">E-mail</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input className="input-premium !pl-14" placeholder="exemplo@gmail.com" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="label-premium ml-4">Senha</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input className="input-premium !pl-14" placeholder="••••••••" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-premium ml-4">Confirmar Senha</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input className="input-premium !pl-14" placeholder="••••••••" type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button onClick={prevStep} className="btn-ghost-premium flex-1">
                                    <ArrowLeft size={18} className="mr-2" /> Voltar
                                </button>
                                <button onClick={isBusinessRole ? nextStep : handleRegister} className="btn-primary-premium flex-1">
                                    {isBusinessRole ? 'Próximo' : 'Finalizar'} <ArrowRight size={18} className="ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            variants={containerVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="space-y-6 max-w-md mx-auto"
                        >
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Dados do <span className="text-[#22eb7e]">Negócio</span></h1>
                                <p className="text-slate-500 font-bold">Informações fiscais e de contato.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="label-premium ml-4">NIF (Portugal)</label>
                                    <div className="relative">
                                        <FileText size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input className="input-premium !pl-14" placeholder="123 456 789" value={formData.nif} onChange={e => setFormData({ ...formData, nif: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="label-premium ml-4">Nome Comercial</label>
                                    <div className="relative">
                                        <Building2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input className="input-premium !pl-14" placeholder="Minha Loja Pet" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="label-premium ml-4">Endereço Comercial</label>
                                    <div className="relative">
                                        <Building2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input className="input-premium !pl-14" placeholder="Rua, Cidade, Portugal" value={formData.businessAddress} onChange={e => setFormData({ ...formData, businessAddress: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="label-premium ml-4">Telemóvel de Contato</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input className="input-premium !pl-14" placeholder="+351 000 000 000" value={formData.businessPhone} onChange={e => setFormData({ ...formData, businessPhone: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button onClick={prevStep} className="btn-ghost-premium flex-1">
                                    <ArrowLeft size={18} /> Voltar
                                </button>
                                <button onClick={handleRegister} className="btn-primary-premium flex-1" disabled={loading}>
                                    {loading ? <div className="size-6 border-2 border-slate-900/10 border-t-[#22eb7e] rounded-full animate-spin" /> : 'Finalizar'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="mt-12 text-center text-slate-400 font-bold text-sm">
                    Já possui conta? <button onClick={() => navigate('/login')} className="text-[#22eb7e] hover:text-[#19c765] font-black transition-colors">Entrar agora</button>
                </p>
            </main>
        </div>
    );
};

const RoleButton: React.FC<{ active: boolean, onClick: () => void, icon: any, title: string, subtitle: string }> = ({ active, onClick, icon: Icon, title, subtitle }) => (
    <button
        onClick={onClick}
        className={`w-full p-6 rounded-[2.5rem] border-2 text-left transition-all duration-300 group relative overflow-hidden ${active ? 'bg-[#22eb7e]/5 border-[#22eb7e] shadow-2xl shadow-[#22eb7e]/10' : 'bg-white border-slate-100 hover:border-slate-200'}`}
    >
        <div className="relative z-10 flex items-center gap-6">
            <div className={`size-16 rounded-3xl flex items-center justify-center transition-all ${active ? 'bg-[#22eb7e] text-[#102217]' : 'bg-slate-50 text-slate-300 group-hover:bg-[#22eb7e]/10 group-hover:text-[#22eb7e]'}`}>
                <Icon size={32} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
                <h4 className={`text-xl font-black transition-colors ${active ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>{title}</h4>
                <p className="text-slate-400 text-xs font-bold leading-tight mt-1">{subtitle}</p>
            </div>
            {active && (
                <div className="size-8 rounded-full bg-[#22eb7e] flex items-center justify-center">
                    <Check size={18} className="text-[#102217] stroke-[4]" />
                </div>
            )}
        </div>
    </button>
);

export default RegisterView;
