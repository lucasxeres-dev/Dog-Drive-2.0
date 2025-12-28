import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/authService';
import { useSupabase } from '../hooks/useSupabase';

const RegisterView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const supabase = useSupabase();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'owner' as 'owner' | 'walker' | 'boarding' | 'petshop' | 'grooming',
        // Business fields (Step 3)
        nif: '',
        companyName: '',
        businessEmail: '',
        businessPhone: '',
        businessAddress: '',
        vatRegistered: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const isBusinessRole = ['petshop', 'grooming', 'boarding'].includes(formData.role);

    const handleRegister = async () => {
        // Validation
        if (!formData.fullName || !formData.email || !formData.phone || !formData.username || !formData.password) {
            showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            showNotification('E-mail inválido', 'error');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            showNotification('As senhas não coincidem.', 'error');
            return;
        }
        if (formData.password.length < 6) {
            showNotification('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        // Business validation
        if (isBusinessRole && (!formData.nif || !formData.companyName)) {
            showNotification('Preencha NIF e Nome da Empresa.', 'error');
            return;
        }

        setLoading(true);
        try {
            console.log('Registering user with:', formData.email);
            const { data, error: signUpError } = await authService.signUp(formData.email, formData.password, {
                data: {
                    full_name: formData.fullName,
                    username: formData.username.trim().toLowerCase().replace('@', ''),
                    phone: formData.phone,
                    role: formData.role,
                    email: formData.email,
                    country: 'PT'
                }
            });

            if (signUpError) throw signUpError;

            // If business user, save business profile
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

                if (businessError) {
                    console.error('Business profile error:', businessError);
                }
            }

            showNotification('Cadastro realizado com sucesso! Faça login para continuar.', 'success');

            // Wait a moment for trigger and sessions to settle
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (err: any) {
            console.error('Registration error details:', err);
            if (err.message && (err.message.includes('already registered') || err.status === 422)) {
                showNotification('Este e-mail ou usuário já está em uso.', 'error');
            } else {
                showNotification(`Erro ao criar conta: ${err.message || 'Tente novamente.'}`, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const totalSteps = isBusinessRole ? 3 : 2;

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col">
                {/* Header */}
                <div className="w-full flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg transform rotate-3 mb-4">
                        <span className="material-symbols-outlined text-[#050705] text-[24px] font-black">person_add</span>
                    </div>
                    <h2 className="text-[#111814] dark:text-white text-2xl font-black uppercase text-center">
                        {step === 1 && 'Selecione seu Perfil'}
                        {step === 2 && 'Seus Dados'}
                        {step === 3 && 'Dados da Empresa'}
                    </h2>
                    <div className="flex gap-2 mt-4">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= i + 1 ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: 'owner', label: t('owner'), icon: 'pets', desc: 'Tenho um pet' },
                                    { id: 'walker', label: t('walker'), icon: 'directions_walk', desc: 'Passeador individual' },
                                    { id: 'boarding', label: t('boarding'), icon: 'home', desc: 'Hotel/Hospedagem' },
                                    { id: 'petshop', label: 'Petshop', icon: 'storefront', desc: 'Loja de pets' },
                                    { id: 'grooming', label: 'Banho e Tosa', icon: 'shower', desc: 'Serviços de estética' }
                                ].map(role => (
                                    <button
                                        key={role.id}
                                        onClick={() => {
                                            setFormData({ ...formData, role: role.id as any });
                                            setStep(2);
                                        }}
                                        className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 ${formData.role === role.id ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-white dark:bg-white/5 border-transparent shadow-sm'}`}
                                    >
                                        <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${formData.role === role.id ? 'bg-primary text-[#050705]' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                                            <span className="material-symbols-outlined text-2xl font-black">{role.icon}</span>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className="text-base font-bold block">{role.label}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{role.desc}</span>
                                        </div>
                                        <span className={`material-symbols-outlined transition-opacity ${formData.role === role.id ? 'text-primary opacity-100' : 'opacity-0'}`}>arrow_forward</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Nome Completo</label>
                                    <input name="fullName" className="input-premium h-14" placeholder="Ex: João da Silva" value={formData.fullName} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Nome de Usuário</label>
                                    <input name="username" className="input-premium h-14" placeholder="@joaosilva" value={formData.username} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Email</label>
                                    <input name="email" type="email" className="input-premium h-14" placeholder="seu@email.com" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Telefone / WhatsApp</label>
                                    <input name="phone" className="input-premium h-14" placeholder="(11) 99999-9999" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Senha</label>
                                    <input name="password" type="password" className="input-premium h-14" placeholder="••••••" value={formData.password} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Confirmar Senha</label>
                                    <input name="confirmPassword" type="password" className="input-premium h-14" placeholder="••••••" value={formData.confirmPassword} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && isBusinessRole && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4">
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Dados da empresa (similar ao Glovo fornecedor)</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">NIF / CNPJ *</label>
                                    <input name="nif" className="input-premium h-14" placeholder="123456789" value={formData.nif} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Nome da Empresa *</label>
                                    <input name="companyName" className="input-premium h-14" placeholder="PetShop ABC Ltda" value={formData.companyName} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Email Comercial</label>
                                    <input name="businessEmail" type="email" className="input-premium h-14" placeholder="contato@empresa.com" value={formData.businessEmail} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Telefone Comercial</label>
                                    <input name="businessPhone" className="input-premium h-14" placeholder="(11) 3333-3333" value={formData.businessPhone} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Endereço Completo</label>
                                    <textarea name="businessAddress" className="input-premium h-24 resize-none" placeholder="Rua, número, bairro, cidade, CEP" value={formData.businessAddress} onChange={handleChange}></textarea>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                                    <input type="checkbox" name="vatRegistered" checked={formData.vatRegistered} onChange={handleChange} className="w-5 h-5" />
                                    <label className="text-sm font-bold">Empresa registrada para IVA/Impostos</label>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-8 flex gap-4">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-gray-400 hover:text-primary transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined font-black">arrow_back</span>
                            </button>
                        )}
                        {(step === 2 && !isBusinessRole) || step === 3 ? (
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className="btn-primary flex-1 h-16 text-sm uppercase tracking-widest"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-[#050705] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Finalizar Cadastro</span>
                                        <span className="material-symbols-outlined font-black">check</span>
                                    </>
                                )}
                            </button>
                        ) : step === 2 && isBusinessRole ? (
                            <button
                                onClick={() => setStep(3)}
                                className="btn-primary flex-1 h-16 text-sm uppercase tracking-widest"
                            >
                                <span>Próximo: Dados da Empresa</span>
                                <span className="material-symbols-outlined font-black">arrow_forward</span>
                            </button>
                        ) : null}
                    </div>

                    <p className="text-center mt-6 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                        Já tem conta? <button onClick={() => navigate('/login')} className="text-primary hover:underline ml-1">Fazer Login</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterView;
