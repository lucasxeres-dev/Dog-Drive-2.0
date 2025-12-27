import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/authService';

const RegisterView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
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
        avatarFile: null as File | null,
        avatarPreview: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({
                ...formData,
                avatarFile: file,
                avatarPreview: URL.createObjectURL(file)
            });
        }
    };



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
        if (formData.username.length < 3) {
            showNotification('O nome de usuário deve ter pelo menos 3 caracteres.', 'error');
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

        setLoading(true);
        try {
            let avatarUrl = '';

            // Upload photo if selected
            if (formData.avatarFile) {
                const fileExt = formData.avatarFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `registration/${fileName}`;

                // Upload using public policy or anon
                const { error: uploadError } = await (authService as any).supabase.storage
                    .from('avatars')
                    .upload(filePath, formData.avatarFile);

                if (!uploadError) {
                    const { data } = (authService as any).supabase.storage
                        .from('avatars')
                        .getPublicUrl(filePath);
                    avatarUrl = data.publicUrl;
                }
            }

            const { data, error: signUpError } = await authService.signUp(formData.email, formData.password, {
                data: {
                    full_name: formData.fullName,
                    username: formData.username.toLowerCase(),
                    phone: formData.phone,
                    role: formData.role,
                    email: formData.email,
                    avatar_url: avatarUrl // Send photo URL with metadata
                }
            });

            if (signUpError) throw signUpError;

            // Attempt Auto-Login
            if (data.user && !data.session) {
                showNotification('Cadastro realizado! Verifique seu email para confirmar.', 'success');
                navigate('/login');
            } else if (data.session) {
                // Auto login successful (Email confirm disabled or implicit)
                showNotification(`Bem-vindo, ${formData.fullName}!`, 'success');
                // Navigate based on role or to onboarding
                if (formData.role === 'owner') navigate('/onboarding'); // Logic in OnboardingView handles the rest
                else navigate('/feed'); // Or wherever
            } else {
                showNotification('Cadastro realizado! Fazendo login...', 'success');
                const { error: loginError } = await authService.signIn(formData.email, formData.password);
                if (!loginError) navigate('/onboarding');
                else navigate('/login');
            }

        } catch (err: any) {
            console.error('Registration error:', err);
            if (err.message && err.message.includes('already registered')) {
                showNotification('Este e-mail já está cadastrado.', 'error');
            } else if (err.status === 429) {
                showNotification('Muitas tentativas. Tente novamente mais tarde.', 'error');
            } else {
                showNotification(`Erro ao criar conta: ${err.message || 'Tente novamente.'}`, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col">
                {/* Header */}
                <div className="w-full flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg transform rotate-3 mb-4">
                        <span className="material-symbols-outlined text-[#050705] text-[24px] font-black">person_add</span>
                    </div>
                    <h2 className="text-[#111814] dark:text-white text-2xl font-black uppercase text-center">{step === 1 ? 'Selecione seu Perfil' : 'Seus Dados'}</h2>
                    <div className="flex gap-2 mt-4">
                        {[1, 2].map(i => (
                            <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= i ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>


                <div className="flex-1 flex flex-col">
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: 'owner', label: t('owner'), icon: 'pets' },
                                    { id: 'walker', label: t('walker'), icon: 'directions_walk' },
                                    { id: 'boarding', label: t('boarding'), icon: 'home' },
                                    { id: 'petshop', label: 'Petshop ou Banho e Tosa', icon: 'storefront' }
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
                                        <span className="text-base font-bold flex-1 text-left">{role.label}</span>
                                        <span className={`material-symbols-outlined transition-opacity ${formData.role === role.id ? 'text-primary opacity-100' : 'opacity-0'}`}>arrow_forward</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Photo Upload */}
                            <div className="flex justify-center mb-6">
                                <label className="relative cursor-pointer group">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/10 border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                                        {formData.avatarPreview ? (
                                            <img src={formData.avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-gray-400 text-3xl group-hover:text-primary">add_a_photo</span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-[#050705] shadow-lg">
                                        <span className="material-symbols-outlined text-sm font-black">edit</span>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                </label>
                            </div>

                            {/* Personal Info Group - Single Column Vertical Layout */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Nome Completo</label>
                                    <input
                                        name="fullName"
                                        className="input-premium h-14" // Slightly taller for better touch
                                        placeholder="Ex: João da Silva"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Nome de Usuário</label>
                                    <input
                                        name="username"
                                        className="input-premium h-14"
                                        placeholder="@joaosilva"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        className="input-premium h-14"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Telefone / WhatsApp</label>
                                    <input
                                        name="phone"
                                        className="input-premium h-14"
                                        placeholder="(11) 99999-9999"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Senha</label>
                                    <input
                                        name="password"
                                        type="password"
                                        className="input-premium h-14"
                                        placeholder="••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Confirmar Senha</label>
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        className="input-premium h-14"
                                        placeholder="••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
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
                        {step === 2 && (
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
                        )}
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
