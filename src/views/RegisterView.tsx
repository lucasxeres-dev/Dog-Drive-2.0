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
        email: '',
        phone: '',
        cpfRg: '',
        password: '',
        confirmPassword: '',
        securityCode: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (!formData.fullName || !formData.email || !formData.phone) {
                showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                showNotification('E-mail inválido', 'error');
                return;
            }
        }
        if (step === 2 && !formData.cpfRg) {
            showNotification('O CPF ou RG é obrigatório para sua segurança.', 'error');
            return;
        }
        setStep(step + 1);
    };

    const handleRegister = async () => {
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
            const { error: signUpError } = await (authService as any).supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        cpf_rg: formData.cpfRg,
                        security_code: formData.securityCode
                    }
                }
            });

            if (signUpError) throw signUpError;

            showNotification('Cadastro realizado! Verifique seu email.', 'success');
            navigate('/login');
        } catch (err: any) {
            showNotification(err.message || 'Erro ao registrar usuário', 'error');
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
                    <h2 className="text-[#111814] dark:text-white text-2xl font-black uppercase text-center">Criar Conta</h2>
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= i ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>


                <div className="flex-1 flex flex-col">
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Nome Completo</label>
                                <input
                                    name="fullName"
                                    className="w-full rounded-3xl border-2 border-transparent bg-white dark:bg-white/5 h-16 pl-6 text-base font-bold transition-all outline-none focus:bg-white dark:focus:bg-black/20 focus:border-primary shadow-sm"
                                    placeholder="Ex: João Silva"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full rounded-3xl border-2 border-transparent bg-white dark:bg-white/5 h-16 pl-6 text-base font-bold transition-all outline-none focus:bg-white dark:focus:bg-black/20 focus:border-primary shadow-sm"
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Telefone</label>
                                <input
                                    name="phone"
                                    className="w-full rounded-3xl border-2 border-transparent bg-white dark:bg-white/5 h-16 pl-6 text-base font-bold transition-all outline-none focus:bg-white dark:focus:bg-black/20 focus:border-primary shadow-sm"
                                    placeholder="(11) 99999-9999"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">CPF ou RG</label>
                                <input
                                    name="cpfRg"
                                    className="w-full rounded-3xl border-2 border-transparent bg-white dark:bg-white/5 h-16 pl-6 text-base font-bold transition-all outline-none focus:bg-white dark:focus:bg-black/20 focus:border-primary shadow-sm"
                                    placeholder="000.000.000-00"
                                    value={formData.cpfRg}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="p-4 bg-primary/5 rounded-3xl border border-primary/20">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary text-xl">shield</span>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Seus dados são criptografados e utilizados apenas para verificação de identidade e segurança nas caminhadas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Senha</label>
                                <input
                                    name="password"
                                    type="password"
                                    className="w-full rounded-3xl border-2 border-transparent bg-white dark:bg-white/5 h-16 pl-6 text-base font-bold transition-all outline-none focus:bg-white dark:focus:bg-black/20 focus:border-primary shadow-sm"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Confirmar Senha</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    className="w-full rounded-3xl border-2 border-transparent bg-white dark:bg-white/5 h-16 pl-6 text-base font-bold transition-all outline-none focus:bg-white dark:focus:bg-black/20 focus:border-primary shadow-sm"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 leading-none">Código de Segurança (Opcional)</label>
                                <input
                                    name="securityCode"
                                    className="w-full rounded-3xl border-2 border-transparent bg-white dark:bg-white/5 h-16 pl-6 text-base font-bold transition-all outline-none focus:bg-white dark:focus:bg-black/20 focus:border-primary shadow-sm"
                                    placeholder="Ex: 123456"
                                    value={formData.securityCode}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-8 flex gap-4">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-gray-400 hover:text-primary transition-all"
                            >
                                <span className="material-symbols-outlined font-black">arrow_back</span>
                            </button>
                        )}
                        <button
                            onClick={step < 3 ? handleNextStep : handleRegister}
                            disabled={loading}
                            className="btn-primary flex-1 h-16 text-sm uppercase tracking-widest"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-[#050705] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{step < 3 ? 'Próximo' : 'Finalizar Cadastro'}</span>
                                    <span className="material-symbols-outlined font-black">chevron_right</span>
                                </>
                            )}
                        </button>
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
