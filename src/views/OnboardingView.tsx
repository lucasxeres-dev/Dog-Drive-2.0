import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSupabase } from '../hooks/useSupabase';
import { uploadImage } from '../lib/imageUpload';
import { PremiumButton } from '../components/UIComponents';
import {
    Dog, ArrowLeft, Check,
    Globe, User, Footprints,
    Home, ShoppingBag, Scissors,
    Camera, FileText, Lock,
    ChevronRight, CreditCard, Sparkles,
    CheckCircle2, X, MapPin, Info, Shield,
    Stethoscope, Upload, Search
} from 'lucide-react';

interface OnboardingViewProps {
    onSelectRole: (role: string) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onSelectRole }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const supabase = useSupabase();
    const [step, setStep] = useState(0);
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.OWNER);
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [city, setCity] = useState<string>('Lisboa');
    const [selectedCountry, setSelectedCountry] = useState<string>('PT');
    const [isEurope, setIsEurope] = useState(false);

    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    setCoords({ lat, lng });
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
                        const data = await res.json();
                        const cityName = data.address.city || data.address.town || data.address.village || data.address.suburb || 'Lisboa';
                        setCity(cityName);
                    } catch (e) {
                        console.error('Onboarding geocode error:', e);
                    }
                },
                (err) => console.error('Onboarding geolocation error:', err)
            );
        }
    }, []);

    // Owner dog data
    const [dogData, setDogData] = useState({
        name: '',
        age: '',
        breed: '',
        gender: '' as 'male' | 'female' | '',
        size: '' as 'mini' | 'small' | 'medium' | 'large' | 'giant' | '',
        weight: '',
        color: '',
        is_castrated: false,
        traits: [] as string[],
        request: '',
        photo: ''
    });

    // Business data
    const [businessData, setBusinessData] = useState({
        type: 'none' as 'clinic' | 'grooming' | 'none',
        name: '',
        tax_id: '',
        address: '',
        doc_url: ''
    });

    // Provider data
    const [providerData, setProviderData] = useState({
        services: [] as string[],
        doc_url: '',
        address: '',
        pix: '',
        bio: ''
    });

    const [hasShop, setHasShop] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pet' | 'doc') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showNotification('Arquivo muito grande. Máximo 5MB.', 'error');
            return;
        }

        try {
            if (type === 'pet') setUploading(true);
            else setUploadingDoc(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const bucket = type === 'pet' ? 'pet-photos' : 'documents';

            const { url } = await uploadImage(file, {
                bucket,
                userId: user.id,
                onProgress: (progress) => console.log(`Upload: ${progress}%`)
            }).catch(uploadErr => {
                console.error('Upload sub-service error:', uploadErr);
                throw new Error('Falha no serviço de upload. Verifique os buckets do Supabase.');
            });

            if (type === 'pet') {
                setDogData({ ...dogData, photo: url });
            } else if (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) {
                setBusinessData({ ...businessData, doc_url: url });
            } else {
                setProviderData({ ...providerData, doc_url: url });
            }
            showNotification('Upload concluído!', 'success');
        } catch (error: any) {
            console.error('Error uploading image:', error);
            showNotification(error.message || 'Erro ao enviar imagem. Verifique sua conexão.', 'error');
        } finally {
            if (type === 'pet') setUploading(false);
            else setUploadingDoc(false);
        }
    };

    const handleNext = async () => {
        // Validation for each step
        if (step === 2) {
            if (selectedRole === UserRole.OWNER && (!dogData.name || dogData.name.trim().length < 2)) {
                showNotification('Nome do pet muito curto', 'error');
                return;
            }
        }

        if (step === 3 && (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING)) {
            if (!businessData.name || businessData.name.trim().length < 3) {
                showNotification('Nome da empresa inválido', 'error');
                return;
            }
            const nifRegex = /^[0-9]{9}$/;
            if (!nifRegex.test(businessData.tax_id)) {
                showNotification('NIF deve ter 9 dígitos (Portugal)', 'error');
                return;
            }
        }

        if (step === 2 && (selectedRole === UserRole.WALKER || selectedRole === UserRole.BOARDING)) {
            if (providerData.services.length === 0) {
                showNotification('Selecione pelo menos um serviço', 'error');
                return;
            }
        }

        if (step === 0) {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('profiles').update({ role: selectedRole }).eq('id', user.id);
                }
            } catch (err) {
                console.error('Failed to pre-save role:', err);
            }
            setStep(1);
        } else if (step === 1) {
            setStep(2);
        } else if (selectedRole === UserRole.OWNER) {
            if (step < 3) setStep(step + 1);
            else handleFinish();
        } else {
            // Professionals and Businesses
            if (step < 4) setStep(step + 1);
            else handleFinish();
        }
    };

    const handleFinish = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            showNotification('Sessão expirada. Faça login novamente.', 'error');
            navigate('/login');
            return;
        }

        try {
            // Update profile
            const { error: profileError } = await supabase.from('profiles').update({
                role: selectedRole,
                address: (selectedRole !== UserRole.OWNER) ? providerData.address : null,
                provider_services: (selectedRole !== UserRole.OWNER) ? providerData.services : null,
                document_url: (selectedRole !== UserRole.OWNER) ? providerData.doc_url : null,
                country: 'PT',
                business_name: (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) ? businessData.name : null,
                tax_id: (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) ? businessData.tax_id : null,
                business_type: (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) ? businessData.type : 'none',
                has_shop: hasShop,
                email: user.email,
                latitude: coords?.lat,
                longitude: coords?.lng,
                wallet_balance: 0.00
            }).eq('id', user.id);

            if (profileError) throw profileError;

            // 1. If Groomer/Petshop/Professional, create business_profile first
            let businessId = null;
            if (selectedRole !== UserRole.OWNER) {
                const { data: bProfile, error: bError } = await supabase.from('business_profiles').upsert({
                    user_id: user.id,
                    company_name: businessData.name || user.email?.split('@')[0],
                    nif: businessData.tax_id,
                    business_address: businessData.address || providerData.address,
                    is_online: true,
                    latitude: coords?.lat,
                    longitude: coords?.lng
                }).select().single();

                if (bError) console.error('Error creating business profile:', bError);
                else businessId = bProfile.id;

                // 2. Add default location for professional if businessId created
                if (businessId) {
                    await supabase.from('business_locations').insert({
                        business_id: businessId,
                        name: 'Local Principal',
                        address: businessData.address || providerData.address,
                        latitude: coords?.lat,
                        longitude: coords?.lng,
                        is_active: true
                    });
                }
            }

            // Save dog ONLY for owners
            if (selectedRole === UserRole.OWNER) {
                if (!dogData.name || dogData.name.trim() === '') {
                    showNotification('Nome do cachorro é obrigatório', 'error');
                    return;
                }

                const dogInsertData: any = {
                    owner_id: user.id,
                    name: dogData.name.trim(),
                    age: dogData.age || '0',
                    request_instructions: dogData.request,
                    image_url: dogData.photo,
                    latitude: coords?.lat,
                    longitude: coords?.lng,
                    location: city || 'Portugal'
                };

                if (dogData.breed) dogInsertData.breed = dogData.breed;
                if (dogData.gender) dogInsertData.gender = dogData.gender;
                if (dogData.size) dogInsertData.size = dogData.size;
                if (dogData.weight) dogInsertData.weight = parseFloat(dogData.weight);
                if (dogData.color) dogInsertData.color = dogData.color;
                if (dogData.is_castrated !== undefined) dogInsertData.is_castrated = dogData.is_castrated;
                if (dogData.traits && dogData.traits.length > 0) dogInsertData.traits = dogData.traits.join(', ');

                const { error: dogError } = await supabase.from('dogs').insert(dogInsertData);

                if (dogError) {
                    console.error('Dog registration error:', dogError);
                    showNotification(`Erro ao salvar pet: ${dogError.message}`, 'warning');
                }
            }

            // Save bank details
            if (providerData.pix) {
                await supabase.from('bank_details').upsert({
                    user_id: user.id,
                    encrypted_data: providerData.pix,
                    bank_name: 'IBAN',
                    account_type: 'IBAN'
                });
            }

            showNotification('Onboarding concluído!', 'success');
            onSelectRole(selectedRole);

            // Redirect based on role
            if (selectedRole === UserRole.GROOMING || selectedRole === UserRole.PETSHOP) {
                navigate('/groomer-dashboard');
            } else {
                navigate('/feed');
            }
        } catch (err: any) {
            console.error('Onboarding error:', err);
            showNotification(err.message || 'Erro ao finalizar onboarding.', 'error');
        }
    };

    const roles = [
        { id: UserRole.OWNER, title: t('owner'), icon: Dog, desc: 'Para quem tem pet' },
        { id: UserRole.WALKER, title: t('walker'), icon: Footprints, desc: 'Passeadores' },
        { id: UserRole.BOARDING, title: t('boarding'), icon: Home, desc: 'Hospedagem' },
        { id: UserRole.PETSHOP, title: t('petshop'), icon: ShoppingBag, desc: 'Produtos' },
        { id: UserRole.GROOMING, title: t('grooming'), icon: Scissors, desc: 'Estética' }
    ];

    const maxSteps = (selectedRole === UserRole.OWNER) ? 4 : 5;

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-24 lg:pb-0">
            {/* Premium Header */}
            <header className="px-6 pt-14 pb-8 flex flex-col items-center glass sticky top-0 z-50 border-b border-white">
                <div className="flex gap-3 mb-6">
                    {Array.from({ length: maxSteps }).map((_, s) => (
                        <div key={s} className="relative">
                            <motion.div
                                initial={false}
                                animate={{
                                    width: step >= s ? 30 : 10,
                                    backgroundColor: step >= s ? '#22eb7e' : '#e2e8f0'
                                }}
                                className="h-1.5 rounded-full shadow-sm"
                            />
                            {step === s && (
                                <motion.div
                                    layoutId="onboarding-step-glow"
                                    className="absolute inset-0 bg-[#22eb7e] rounded-full blur-sm opacity-50"
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="absolute left-6 size-10 rounded-full bg-white/50 border border-white flex items-center justify-center text-slate-600 hover:bg-white transition-all shadow-sm"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#22eb7e]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            {step === 0 ? 'Registro de Perfil' :
                                step === 1 ? 'Sua Região' :
                                    selectedRole === UserRole.OWNER ? 'Identidade do Pet' : 'Perfil Profissional'}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-10 no-scrollbar">
                <AnimatePresence mode="wait">
                    {step === 0 ? (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                                    Como deseja usar o <span className="text-[#22eb7e] relative">Dog Drive<div className="absolute -bottom-1 left-0 w-full h-2 bg-[#22eb7e]/20" /></span>?
                                </h1>
                                <p className="text-slate-500 font-bold leading-relaxed">Cada perfil oferece ferramentas exclusivas para a sua jornada pet.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                {roles.map((role) => (
                                    <label key={role.id} className="cursor-pointer group relative">
                                        <input
                                            type="radio"
                                            className="sr-only peer"
                                            name="role"
                                            checked={selectedRole === role.id}
                                            onChange={() => setSelectedRole(role.id as UserRole)}
                                        />
                                        <div className="flex items-center gap-6 bg-white p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border-4 border-transparent peer-checked:border-[#22eb7e] peer-checked:bg-[#102217] transition-all duration-500 relative overflow-hidden group-hover:shadow-2xl">
                                            {selectedRole === role.id && (
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#22eb7e]/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                                            )}
                                            <div className={`size-18 rounded-2xl flex items-center justify-center transition-all duration-500 ${selectedRole === role.id ? 'bg-[#22eb7e] text-[#102217] shadow-glow rotate-2' : 'bg-slate-50 text-slate-400 group-hover:scale-105'}`}>
                                                <role.icon size={32} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`text-xl font-black tracking-tight transition-colors duration-500 ${selectedRole === role.id ? 'text-white' : 'text-slate-900'}`}>{role.title}</h3>
                                                <p className={`text-[10px] font-black uppercase tracking-widest mt-2 italic transition-colors duration-500 ${selectedRole === role.id ? 'text-[#22eb7e]/60' : 'text-slate-400'}`}>
                                                    {role.desc}
                                                </p>
                                            </div>
                                            <div className={`size-8 rounded-xl border-4 flex items-center justify-center transition-all duration-500 ${selectedRole === role.id ? 'bg-[#22eb7e] border-[#22eb7e] scale-110 shadow-lg shadow-[#22eb7e]/20' : 'border-slate-100'}`}>
                                                {selectedRole === role.id && <Check size={18} className="text-[#102217] stroke-[4]" />}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    ) : step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                                    Sua região é <span className="text-[#22eb7e]">Portugal</span> 🇵🇹
                                </h1>
                                <p className="text-slate-500 font-bold leading-relaxed">Iniciamos nossa jornada exclusivamente em terras lusitanas.</p>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="p-14 rounded-[4rem] bg-white border-4 border-white shadow-2xl shadow-slate-200/50 flex flex-col items-center gap-8 text-center relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-50/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <div className="size-32 bg-[#22eb7e]/10 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-white">
                                    🇵🇹
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-3">Portugal</h2>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="relative">
                                            <div className="w-3 h-3 rounded-full bg-[#22eb7e]" />
                                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#22eb7e] animate-ping" />
                                        </div>
                                        <span className="text-[11px] font-black text-[#2e9c60] uppercase tracking-[0.4em]">Comunidade Ativa</span>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="bg-[#102217] p-8 rounded-[3rem] text-white flex items-center gap-6 relative overflow-hidden shadow-2xl shadow-[#102217]/20 border border-white/5">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#22eb7e]/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                                <div className="size-14 rounded-2xl bg-[#22eb7e]/10 flex items-center justify-center shrink-0">
                                    <Globe size={28} className="text-[#22eb7e]" />
                                </div>
                                <p className="text-[12px] font-bold leading-relaxed opacity-80 uppercase tracking-widest">
                                    Expansão global em breve. Fique atento às novas fronteiras do Dog Drive!
                                </p>
                            </div>
                        </motion.div>
                    ) : selectedRole === UserRole.OWNER && step === 2 ? (
                        <motion.div
                            key="step2-owner"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                                    Cadastre seu <span className="text-[#22eb7e]">Pet</span> 🦴
                                </h1>
                                <p className="text-slate-500 font-bold leading-relaxed">Cada detalhe ajuda a encontrar o match ideal para o seu amigo.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2 group">
                                    <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Nome do Pet</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#102217] group-focus-within:bg-[#22eb7e] transition-all">
                                            <Search size={18} strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type="text"
                                            value={dogData.name}
                                            onChange={e => setDogData({ ...dogData, name: e.target.value })}
                                            placeholder="ex: Max"
                                            className="input-premium !pl-20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Raça</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#102217] group-focus-within:bg-[#22eb7e] transition-all">
                                            <Dog size={18} strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type="text"
                                            value={dogData.breed}
                                            onChange={e => setDogData({ ...dogData, breed: e.target.value })}
                                            placeholder="ex: Golden Retriever"
                                            className="input-premium !pl-20"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="label-premium ml-5">Idade</label>
                                        <input
                                            type="text"
                                            value={dogData.age}
                                            onChange={e => setDogData({ ...dogData, age: e.target.value })}
                                            placeholder="ex: 3 anos"
                                            className="input-premium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-premium ml-5">Gênero</label>
                                        <div className="relative">
                                            <select
                                                value={dogData.gender}
                                                onChange={e => setDogData({ ...dogData, gender: e.target.value as any })}
                                                className="input-premium appearance-none pr-10"
                                            >
                                                <option value="">Gênero</option>
                                                <option value="male">Macho</option>
                                                <option value="female">Fêmea</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <ChevronRight size={18} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="label-premium ml-5">Foto do Protagonista</label>
                                    <div className="premium-card !p-8 !rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center min-h-[250px] hover:border-[#22eb7e]/30 transition-all group cursor-pointer relative overflow-hidden bg-white/50">
                                        {dogData.photo ? (
                                            <div className="relative w-full aspect-square md:aspect-video rounded-[2rem] overflow-hidden shadow-2xl">
                                                <img src={dogData.photo} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                <button
                                                    onClick={(e) => { e.preventDefault(); setDogData({ ...dogData, photo: '' }); }}
                                                    className="absolute top-4 right-4 size-10 bg-white/90 backdrop-blur-md text-rose-500 rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-all z-20"
                                                >
                                                    <X size={20} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center gap-5 cursor-pointer w-full text-center py-6">
                                                <div className={`size-20 rounded-[1.75rem] flex items-center justify-center transition-all duration-500 ${uploading ? 'bg-[#22eb7e]/10' : 'bg-slate-50 text-slate-300 group-hover:bg-[#22eb7e]/10 group-hover:text-[#22eb7e] group-hover:rotate-6'}`}>
                                                    {uploading ? (
                                                        <div className="size-8 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Camera size={40} />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-slate-900 tracking-tight uppercase">Toque para eternizar</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">PNG ou JPG até 5MB</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'pet')} disabled={uploading} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="label-premium ml-5">Temperamento do Match</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Dócil', 'Ativo', 'Calmo', 'Brincalhão', 'Guarda', 'Sociável'].map(trait => (
                                            <button
                                                key={trait}
                                                onClick={() => {
                                                    const current = dogData.traits;
                                                    setDogData({
                                                        ...dogData,
                                                        traits: current.includes(trait)
                                                            ? current.filter(t => t !== trait)
                                                            : [...current, trait]
                                                    });
                                                }}
                                                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${dogData.traits.includes(trait)
                                                    ? 'bg-[#102217] text-[#22eb7e] shadow-xl shadow-[#102217]/20 border-2 border-[#102217]'
                                                    : 'bg-white text-slate-400 border-2 border-slate-50 hover:border-slate-100 shadow-sm'
                                                    }`}
                                            >
                                                {trait}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : selectedRole === UserRole.OWNER && step === 3 ? (
                        <motion.div
                            key="step3-owner"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                                    Quase lá! <span className="text-[#22eb7e]">Pronto</span> 🚀
                                </h1>
                                <p className="text-slate-500 font-bold leading-relaxed">Confira o passaporte do seu melhor amigo.</p>
                            </div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="relative overflow-hidden bg-[#102217] rounded-[3.5rem] p-10 text-white shadow-3xl shadow-[#102217]/40 border-4 border-white"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#22eb7e]/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="relative mb-8">
                                        <div className="size-36 rounded-[2.5rem] border-4 border-[#22eb7e]/30 p-2 rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl overflow-hidden">
                                            <img
                                                src={dogData.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop'}
                                                alt={dogData.name}
                                                className="w-full h-full rounded-[1.75rem] object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-3 -right-3 size-14 bg-[#22eb7e] text-[#102217] rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#102217] rotate-[-8deg]">
                                            <Dog size={28} strokeWidth={3} />
                                        </div>
                                    </div>

                                    <h2 className="text-5xl font-black tracking-tighter mb-2">{dogData.name || 'Pet'}</h2>
                                    <div className="flex items-center gap-3 justify-center mb-10">
                                        <span className="px-4 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-[#22eb7e] border border-white/5">{dogData.age || 'N/I'}</span>
                                        <span className="px-4 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-[#22eb7e] border border-white/5">{dogData.gender === 'male' ? 'MACHO' : 'FÊMEA'}</span>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <div className="flex items-center gap-5 bg-white/5 p-5 rounded-[2rem] border border-white/5 text-left group hover:bg-white/10 transition-colors">
                                            <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#22eb7e] shadow-inner group-hover:scale-110 transition-transform">
                                                <MapPin size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Portugal</p>
                                                <p className="text-base font-bold text-white/90">{city || 'Lisboa'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5 bg-white/5 p-5 rounded-[2rem] border border-white/5 text-left group hover:bg-white/10 transition-colors">
                                            <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#22eb7e] shadow-inner group-hover:scale-110 transition-transform">
                                                <Sparkles size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Personalidade</p>
                                                <p className="text-base font-bold text-white/90 truncate max-w-[180px]">{(dogData.traits || []).join(', ') || 'Explorador'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) ? (
                        <motion.div
                            key="business-flow"
                            className="space-y-10"
                        >
                            {step === 2 && (
                                <motion.div
                                    key="step2-business"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="text-center md:text-left">
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">{t('business_type_title')} 🏢</h1>
                                        <p className="text-slate-500 font-bold leading-relaxed">{t('business_type_subtitle')}</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5">
                                        {[
                                            { id: 'clinic', label: t('vet_clinic'), icon: Stethoscope, desc: 'Consultas e exames' },
                                            { id: 'grooming', label: t('grooming_shop'), icon: Scissors, desc: 'Estética e higiene' }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setBusinessData({ ...businessData, type: type.id as any })}
                                                className={`flex items-center gap-6 bg-white p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border-4 transition-all group ${businessData.type === type.id
                                                    ? 'border-[#22eb7e] bg-[#102217]'
                                                    : 'border-transparent'
                                                    }`}
                                            >
                                                <div className={`size-16 rounded-2xl flex items-center justify-center transition-all ${businessData.type === type.id ? 'bg-[#22eb7e] text-[#102217] shadow-glow rotate-2' : 'bg-slate-50 text-slate-300'}`}>
                                                    <type.icon size={28} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h3 className={`text-lg font-black tracking-tight transition-colors ${businessData.type === type.id ? 'text-white' : 'text-slate-900'}`}>{type.label}</h3>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 opacity-60 transition-colors ${businessData.type === type.id ? 'text-[#22eb7e]' : 'text-slate-400'}`}>{type.desc}</p>
                                                </div>
                                                {businessData.type === type.id && <div className="size-8 rounded-xl bg-[#22eb7e] flex items-center justify-center shadow-lg"><Check size={18} className="text-[#102217] stroke-[4]" /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3-business"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="text-center md:text-left">
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">Dados da Empresa 📋</h1>
                                        <p className="text-slate-500 font-bold leading-relaxed">Informações essenciais para validação de segurança.</p>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">{t('business_name')}</label>
                                            <input
                                                type="text"
                                                value={businessData.name}
                                                onChange={e => setBusinessData({ ...businessData, name: e.target.value })}
                                                placeholder="ex: Pet Shop Premium"
                                                className="input-premium"
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">{t('tax_id_eu')}</label>
                                            <input
                                                type="text"
                                                value={businessData.tax_id}
                                                onChange={e => setBusinessData({ ...businessData, tax_id: e.target.value })}
                                                placeholder="NIF (9 dígitos)"
                                                className="input-premium"
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">{t('business_address')}</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#22eb7e] transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    value={businessData.address}
                                                    onChange={e => setBusinessData({ ...businessData, address: e.target.value })}
                                                    placeholder="Endereço da sede"
                                                    className="input-premium !pl-16"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-[#102217] p-10 rounded-[3.5rem] text-white flex flex-col items-center gap-6 relative overflow-hidden shadow-2xl shadow-[#102217]/30 border-4 border-white">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#22eb7e]/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                            <div className={`size-20 rounded-[1.75rem] flex items-center justify-center transition-all duration-500 ${uploadingDoc ? 'bg-[#22eb7e]/10' : 'bg-white/5 text-white/20'}`}>
                                                {uploadingDoc ? <div className="size-8 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin" /> : <Shield size={40} className="text-[#22eb7e]" />}
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-xl font-black tracking-tight mb-2">Comprovante Legal</h3>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22eb7e]/60">Certidão Permanente ou equivalente</p>
                                            </div>
                                            {businessData.doc_url ? (
                                                <div className="flex items-center gap-3 px-6 py-3 bg-[#22eb7e] text-[#102217] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg animate-bounce-short">
                                                    <Check size={16} strokeWidth={3} /> Enviado com sucesso
                                                </div>
                                            ) : (
                                                <label className="w-full">
                                                    <div className="h-14 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest text-white/40 hover:border-[#22eb7e]/40 hover:text-white transition-all cursor-pointer">
                                                        Toque para carregar
                                                    </div>
                                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'doc')} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="provider-flow"
                            className="space-y-10"
                        >
                            {step === 2 && (
                                <motion.div
                                    key="step2-provider"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="text-center md:text-left">
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">Quais <span className="text-[#22eb7e]">Serviços</span> oferece?</h1>
                                        <p className="text-slate-500 font-bold leading-relaxed">Selecione todas as especialidades do seu perfil.</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5">
                                        {[
                                            { id: 'walking', label: 'Passeios', icon: Footprints },
                                            { id: 'boarding', label: 'Hospedagem', icon: Home },
                                            { id: 'grooming', label: 'Banho e Tosa', icon: Scissors },
                                            { id: 'petshop', label: 'Pet Shop', icon: ShoppingBag }
                                        ].map(svc => (
                                            <button
                                                key={svc.id}
                                                onClick={() => {
                                                    const current = providerData.services;
                                                    setProviderData({
                                                        ...providerData,
                                                        services: current.includes(svc.id)
                                                            ? current.filter(s => s !== svc.id)
                                                            : [...current, svc.id]
                                                    });
                                                }}
                                                className={`flex items-center gap-6 bg-white p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border-4 transition-all group ${providerData.services.includes(svc.id)
                                                    ? 'border-[#22eb7e] bg-[#102217]'
                                                    : 'border-transparent'
                                                    }`}
                                            >
                                                <div className={`size-16 rounded-2xl flex items-center justify-center transition-all ${providerData.services.includes(svc.id) ? 'bg-[#22eb7e] text-[#102217] shadow-glow rotate-2' : 'bg-slate-50 text-slate-300'}`}>
                                                    <svc.icon size={28} strokeWidth={2.5} />
                                                </div>
                                                <span className={`text-lg font-black tracking-tight flex-1 text-left transition-colors ${providerData.services.includes(svc.id) ? 'text-white' : 'text-slate-900'}`}>{svc.label}</span>
                                                <div className={`size-8 rounded-xl flex items-center justify-center transition-all ${providerData.services.includes(svc.id) ? 'bg-[#22eb7e] shadow-lg shadow-[#22eb7e]/20' : 'bg-slate-50'}`}>
                                                    {providerData.services.includes(svc.id) && <Check size={18} className="text-[#102217] stroke-[4]" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3-provider"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="text-center md:text-left">
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">Sua <span className="text-[#22eb7e]">Identidade</span> 🪪</h1>
                                        <p className="text-slate-500 font-bold leading-relaxed">Ambiente seguro para verificação de dados oficiais.</p>
                                    </div>
                                    <div className="premium-card !p-12 !rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center min-h-[350px] bg-white group cursor-pointer hover:border-[#22eb7e]/30 transition-all relative overflow-hidden">
                                        {providerData.doc_url ? (
                                            <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-3xl">
                                                <img src={providerData.doc_url} alt="Document" className="w-full h-full object-cover grayscale opacity-30 blur-[4px]" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#102217]/60 backdrop-blur-md">
                                                    <div className="size-20 rounded-3xl bg-[#22eb7e]/10 flex items-center justify-center mb-6">
                                                        <Lock size={48} className="text-[#22eb7e] animate-pulse" />
                                                    </div>
                                                    <p className="text-xs font-black uppercase tracking-[0.4em] text-[#22eb7e]">Documento Protegido</p>
                                                </div>
                                                <button
                                                    onClick={() => setProviderData({ ...providerData, doc_url: '' })}
                                                    className="absolute top-6 right-6 size-12 bg-white/90 backdrop-blur-xl text-rose-500 rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all z-20"
                                                >
                                                    <X size={24} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center gap-8 cursor-pointer w-full text-center">
                                                <div className={`size-28 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${uploadingDoc ? 'bg-[#22eb7e]/10' : 'bg-slate-50 text-slate-300 group-hover:bg-[#22eb7e]/10 group-hover:text-[#22eb7e] group-hover:-rotate-6'}`}>
                                                    {uploadingDoc ? <div className="size-10 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin" /> : <FileText size={56} />}
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Capture seu documento</h3>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">C.C. ou Passaporte visível</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'doc')} disabled={uploadingDoc} />
                                            </label>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-6 p-8 bg-[#102217] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#22eb7e]/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                                        <div className="size-12 rounded-2xl bg-[#22eb7e]/10 flex items-center justify-center shrink-0">
                                            <Shield size={22} className="text-[#22eb7e]" />
                                        </div>
                                        <p className="text-[11px] font-bold text-white/60 leading-relaxed uppercase tracking-widest">
                                            Os seus dados são protegidos por criptografia de nível bancário e eliminados após confirmação manual.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4-provider"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="text-center md:text-left">
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">Seu <span className="text-[#22eb7e]">Perfil</span> ✨</h1>
                                        <p className="text-slate-500 font-bold leading-relaxed">Última etapa! Finalize sua jornada de boas-vindas.</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-2 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Endereço de Base</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400 group-focus-within:text-[#102217] group-focus-within:bg-[#22eb7e] transition-all">
                                                    <MapPin size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={providerData.address}
                                                    onChange={e => setProviderData({ ...providerData, address: e.target.value })}
                                                    placeholder="ex: Avenida da Liberdade, Lisboa"
                                                    className="input-premium !pl-20"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-[#102217] p-10 rounded-[3.5rem] border-4 border-white shadow-3xl shadow-[#102217]/40 relative overflow-hidden">
                                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#22eb7e]/5 rounded-full -mr-24 -mb-24 blur-3xl" />
                                            <div className="relative z-10 space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-2xl bg-[#22eb7e]/10 flex items-center justify-center text-[#22eb7e]">
                                                        <CreditCard size={24} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22eb7e]">Recebimento via IBAN</label>
                                                        <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Válido apenas para contas PT</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={providerData.pix}
                                                    onChange={e => setProviderData({ ...providerData, pix: e.target.value })}
                                                    placeholder="PT50 0000 0000 0000 0000 0000 0"
                                                    className="w-full h-18 bg-white/5 border-2 border-white/10 rounded-[1.75rem] px-8 text-white text-lg font-black tracking-tight placeholder:text-white/15 focus:border-[#22eb7e] transition-all outline-none shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 group">
                                            <label className="label-premium ml-5 group-focus-within:text-[#22eb7e] transition-colors">Sua Bio Profissional</label>
                                            <textarea
                                                value={providerData.bio}
                                                onChange={e => setProviderData({ ...providerData, bio: e.target.value })}
                                                placeholder="Conte sua trajetória com animais, cursos e paixões..."
                                                className="input-premium !h-44 !py-8 resize-none !px-8 leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="px-6 py-10 bg-white/40 backdrop-blur-3xl border-t border-white/40 sticky bottom-0 z-50">
                <div className="max-w-md mx-auto">
                    <PremiumButton
                        onClick={handleNext}
                        isLoading={uploading || uploadingDoc}
                        fullWidth
                        size="lg"
                    >
                        <span className="flex items-center justify-center gap-3">
                            {((selectedRole === UserRole.OWNER && step === 3) ||
                                ((selectedRole === UserRole.WALKER || selectedRole === UserRole.BOARDING) && step === 4) ||
                                ((selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) && step === 3))
                                ? 'Finalizar Jornada'
                                : 'Continuar'}
                            <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </PremiumButton>
                </div>
            </footer>
        </div>
    );
};

export default OnboardingView;
