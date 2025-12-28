import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabaseClient';

const RegisterView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
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
        if (formData.password !== formData.confirmPassword) {
            showNotification('As senhas não coincidem', 'error');
            return;
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
        <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
            {/* Header / Progress */}
            <div className="pt-10 pb-6 px-8 flex flex-col items-center">
                <div className="flex gap-2 mb-4">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-[#22eb7e]' : 'w-4 bg-slate-100'}`}
                        />
                    ))}
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase">
                    {step === 1 ? 'Escolha seu Perfil' : step === 2 ? 'Seus Dados' : 'Detalhes do Negócio'}
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-10 no-scrollbar">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={containerVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="space-y-4"
                        >
                            <RoleButton
                                active={role === 'owner'}
                                onClick={() => { setRole('owner'); nextStep(); }}
                                icon="pets"
                                title="Sou Tutor"
                                subtitle="Encontre serviços para seu pet"
                            />
                            <RoleButton
                                active={role === 'business'}
                                onClick={() => { setRole('business'); nextStep(); }}
                                icon="storefront"
                                title="Sou Empresa"
                                subtitle="PetShops e Clínicas Veterinárias"
                            />
                            <RoleButton
                                active={role === 'provider'}
                                onClick={() => { setRole('provider'); nextStep(); }}
                                icon="handyman"
                                title="Sou Provedor"
                                subtitle="Passeadores e profissionais autônomos"
                            />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            variants={containerVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="space-y-5"
                        >
                            <div className="space-y-1">
                                <label className="label-premium">Nome Completo</label>
                                <input className="input-premium" placeholder="Ex: João Silva" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="label-premium">Nome de Usuário</label>
                                <input className="input-premium" placeholder="@joao" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="label-premium">E-mail</label>
                                <input className="input-premium" placeholder="seu@email.com" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="label-premium">Senha</label>
                                <input className="input-premium" placeholder="••••••" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="label-premium">Confirmar Senha</label>
                                <input className="input-premium" placeholder="••••••" type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button onClick={prevStep} className="btn-ghost-premium flex-1">Voltar</button>
                                <button onClick={isBusinessRole ? nextStep : handleRegister} className="btn-primary-premium flex-1">
                                    {isBusinessRole ? 'Próximo' : 'Finalizar'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            variants={containerVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="space-y-5"
                        >
                            <div className="space-y-1">
                                <label className="label-premium">NIF / Número Fiscal</label>
                                <input className="input-premium" placeholder="Ex: 123456789" value={formData.nif} onChange={e => setFormData({ ...formData, nif: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="label-premium">Nome da Empresa</label>
                                <input className="input-premium" placeholder="Ex: Pet Shop Astral" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="label-premium">Endereço Comercial</label>
                                <input className="input-premium" placeholder="Rua, Cidade, Portugal" value={formData.businessAddress} onChange={e => setFormData({ ...formData, businessAddress: e.target.value })} />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button onClick={prevStep} className="btn-ghost-premium flex-1">Voltar</button>
                                <button onClick={handleRegister} className="btn-primary-premium flex-1" disabled={loading}>
                                    {loading ? 'Criando...' : 'Finalizar'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="mt-8 text-center text-slate-500 text-sm font-bold">
                    Já tem conta? <button onClick={() => navigate('/login')} className="text-[#22eb7e] hover:underline font-black outline-none">Fazer Login</button>
                </p>
            </div>
        </div>
    );
};

const RoleButton: React.FC<{ active: boolean, onClick: () => void, icon: string, title: string, subtitle: string }> = ({ active, onClick, icon, title, subtitle }) => (
    <button
        onClick={onClick}
        className={`w-full p-5 rounded-[1.5rem] border-2 text-left transition-all duration-300 group ${active ? 'bg-[#22eb7e]/10 border-[#22eb7e]' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-[#22eb7e] text-black' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                <span className="material-symbols-outlined text-2xl font-black">{icon}</span>
            </div>
            <div className="flex-1">
                <h4 className={`text-base font-black transition-colors ${active ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>{title}</h4>
                <p className="text-slate-400 text-[11px] font-medium leading-tight">{subtitle}</p>
            </div>
            {active && <span className="material-symbols-outlined text-[#22eb7e] font-black">check_circle</span>}
        </div>
    </button>
);

export default RegisterView;
