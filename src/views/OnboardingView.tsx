import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSupabase } from '../hooks/useSupabase';
import { uploadImage } from '../lib/imageUpload';
import {
    Dog, ArrowLeft, Check,
    Globe, User, Footprints,
    Home, ShoppingBag, Scissors,
    Camera, FileText, Lock,
    ChevronRight, CreditCard, Sparkles,
    CheckCircle2, X, MapPin, Info, Shield,
    Stethoscope, Upload
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
                        const cityName = data.address.city || data.address.town || data.address.village || data.address.suburb || 'Rio de Janeiro';
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

        // Proactive Fix 1: Validate file size (max 5MB)
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

            // Proactive Fix 2: Better error reporting for uploads
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
            if ((selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) && (!businessData.name || businessData.name.trim().length < 3)) {
                showNotification('Nome da empresa inválido', 'error');
                return;
            }
        }

        if (step === 3 && (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING)) {
            const nifRegex = /^[0-9]{9}$/;
            if (!nifRegex.test(businessData.tax_id)) {
                showNotification('NIF deve ter 9 dígitos (Portugal)', 'error');
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
        } else if (selectedRole === UserRole.WALKER || selectedRole === UserRole.BOARDING) {
            if (step < 4) { // Walker/Boarding has 3 steps after country (2, 3, 4)
                setStep(step + 1);
            } else {
                handleFinish();
            }
        } else if (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) {
            if (step < 3) { // Petshop/Grooming has 2 steps after country (2, 3)
                setStep(step + 1);
            } else {
                handleFinish();
            }
        } else { // Owner
            if (step < 3) { // Owner now has 3 steps (2, 3)
                setStep(step + 1);
            } else {
                handleFinish();
            }
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
                address: (selectedRole === UserRole.WALKER || selectedRole === UserRole.BOARDING || selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) ? providerData.address : null,
                provider_services: (selectedRole === UserRole.WALKER || selectedRole === UserRole.BOARDING) ? providerData.services : null,
                document_url: (selectedRole !== UserRole.OWNER) ? providerData.doc_url : null,
                country: 'PT',
                business_name: (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) ? businessData.name : null,
                tax_id: (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) ? businessData.tax_id : null,
                business_type: (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) ? businessData.type : 'none',
                has_shop: hasShop,
                email: user.email,
                latitude: coords?.lat,
                longitude: coords?.lng,
                wallet_balance: 0.00 // Defensive initialization
            }).eq('id', user.id);

            if (profileError) throw profileError;

            // Save dog for owners
            if (selectedRole === UserRole.OWNER) {
                if (!dogData.name || dogData.name.trim() === '') {
                    showNotification('Nome do cachorro é obrigatório', 'error');
                    return;
                }

                // Defensive insertion: only include fields that we are reasonably sure exist or handle failure gracefully
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

                // Add advanced fields only if present in state (migration 05 adds these)
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
                    showNotification(`Erro ao salvar pet: ${dogError.message}. Tentando processar mesmo assim...`, 'warning');
                    // We don't return here so the profile update still holds
                }
            }

            // Save bank details for providers
            if (selectedRole === UserRole.WALKER && providerData.pix) {
                await supabase.from('bank_details').upsert({
                    user_id: user.id,
                    encrypted_data: providerData.pix,
                    bank_name: 'PIX',
                    account_type: 'PIX'
                });
            }

            showNotification('Onboarding concluído!', 'success');
            onSelectRole(selectedRole);
            navigate('/feed');
        } catch (err: any) {
            console.error('Onboarding error:', err);
            showNotification(err.message || 'Erro ao finalizar onboarding. Tente novamente.', 'error');
        }
    };

    const roles = [
        { id: UserRole.OWNER, title: t('owner'), icon: Dog },
        { id: UserRole.WALKER, title: t('walker'), icon: Footprints },
        { id: UserRole.BOARDING, title: t('boarding'), icon: Home },
        { id: UserRole.PETSHOP, title: t('petshop'), icon: ShoppingBag },
        { id: UserRole.GROOMING, title: t('grooming'), icon: Scissors }
    ];

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden">
            <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                {step > 0 ? (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all border border-slate-200/50"
                    >
                        <ArrowLeft size={20} />
                    </button>
                ) : (
                    <div className="w-10" />
                )}
                <div className="flex-1 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        {step === 0 ? 'Registro' :
                            step === 1 ? 'Localização' :
                                selectedRole === UserRole.OWNER ? 'Pet Info' : 'Profissional'}
                    </span>
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar">
                {step === 0 ? (
                    <div className="space-y-10 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">Como você quer usar o <span className="text-[#22eb7e]">Dog Drive</span>?</h1>
                            <p className="text-slate-500 font-bold leading-relaxed">Escolha seu perfil para começarmos.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {roles.map((role) => (
                                <label key={role.id} className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        className="sr-only peer"
                                        name="role"
                                        checked={selectedRole === role.id}
                                        onChange={() => setSelectedRole(role.id as UserRole)}
                                    />
                                    <div className="flex items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border-2 border-transparent peer-checked:border-[#22eb7e] peer-checked:bg-[#22eb7e]/5 transition-all relative overflow-hidden">
                                        <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform peer-checked:bg-[#22eb7e]/20 peer-checked:text-[#102217]">
                                            <role.icon size={28} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-slate-900 leading-none">{role.title}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 italic">
                                                {role.id === UserRole.OWNER ? 'Para quem tem pet' : 'Para quem ama pets'}
                                            </p>
                                        </div>
                                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedRole === role.id ? 'bg-[#22eb7e] border-[#22eb7e] scale-110' : 'border-slate-200'}`}>
                                            {selectedRole === role.id && <Check size={14} className="text-[#102217] stroke-[4]" />}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                ) : step === 1 ? (
                    <div className="space-y-10 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">Sua região é <span className="text-[#22eb7e]">Portugal</span> 🇵🇹</h1>
                            <p className="text-slate-500 font-bold leading-relaxed">Operamos exclusivamente em terras lusitanas no momento.</p>
                        </div>

                        <div className="p-12 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center gap-6 text-center hover:scale-[1.02] transition-transform">
                            <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl shadow-inner">
                                🇵🇹
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Portugal</h2>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-[#22eb7e] animate-ping" />
                                    <span className="text-[10px] font-black text-[#2e9c60] uppercase tracking-[0.3em]">Comunidade Ativa</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#102217] p-8 rounded-[2.5rem] text-white flex items-center gap-4">
                            <Globe size={20} className="text-[#22eb7e] shrink-0" />
                            <p className="text-[11px] font-bold leading-relaxed opacity-80 uppercase tracking-wider">
                                Estamos expandindo em breve para outras regiões. Fique atento às novidades!
                            </p>
                        </div>
                    </div>
                ) : selectedRole === UserRole.OWNER && step === 2 ? (
                    <div className="space-y-10 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">Cadastre seu <span className="text-[#22eb7e]">Pet</span> 🦴</h1>
                            <p className="text-slate-500 font-bold leading-relaxed">Conte-nos um pouco sobre seu melhor amigo.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="label-premium ml-4">Nome do Pet</label>
                                <input
                                    type="text"
                                    value={dogData.name}
                                    onChange={e => setDogData({ ...dogData, name: e.target.value })}
                                    placeholder="ex: Max"
                                    className="input-premium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="label-premium ml-4">Idade</label>
                                    <input
                                        type="text"
                                        value={dogData.age}
                                        onChange={e => setDogData({ ...dogData, age: e.target.value })}
                                        placeholder="ex: 3 anos"
                                        className="input-premium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="label-premium ml-4">Gênero</label>
                                    <select
                                        value={dogData.gender}
                                        onChange={e => setDogData({ ...dogData, gender: e.target.value as any })}
                                        className="input-premium appearance-none"
                                    >
                                        <option value="">Selecionar</option>
                                        <option value="male">Macho</option>
                                        <option value="female">Fêmea</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="label-premium ml-4">Foto do Pet</label>
                                <div className="premium-card !p-8 !rounded-[2.5rem] border-dashed border-2 border-slate-200 flex flex-col items-center justify-center min-h-[200px] hover:border-[#22eb7e] transition-colors group cursor-pointer">
                                    {dogData.photo ? (
                                        <div className="relative">
                                            <img src={dogData.photo} alt="Preview" className="w-full h-48 object-cover rounded-2xl shadow-xl" />
                                            <button
                                                onClick={() => setDogData({ ...dogData, photo: '' })}
                                                className="absolute -top-3 -right-3 size-10 bg-white text-rose-500 rounded-full flex items-center justify-center shadow-lg border border-slate-100 active:scale-95 transition-all"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center gap-4 cursor-pointer w-full text-center">
                                            <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#22eb7e]/10 group-hover:text-[#22eb7e] transition-all">
                                                {uploading ? <div className="size-6 border-2 border-[#22eb7e] border-t-transparent rounded-full animate-spin" /> : <Camera size={32} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Toque para enviar</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">PNG, JPG até 5MB</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'pet')} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="label-premium ml-4">Temperamento</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Dócil', 'Ativo', 'Calmo', 'Brincalhão', 'Bravo', 'Sociável'].map(trait => (
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
                                            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${dogData.traits.includes(trait) ? 'bg-[#102217] text-[#22eb7e] shadow-lg shadow-[#102217]/20 border border-[#102217]' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'}`}
                                        >
                                            {trait}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : selectedRole === UserRole.OWNER && step === 3 ? (
                    <div className="space-y-10 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">Pronto para <span className="text-[#22eb7e]">Explorar</span>! 🚀</h1>
                            <p className="text-slate-500 font-bold leading-relaxed">Confira os dados do seu pet e comece a diversão.</p>
                        </div>

                        <div className="relative overflow-hidden bg-[#102217] rounded-[3.5rem] p-10 text-white shadow-2xl shadow-[#102217]/30 border border-white/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#22eb7e]/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="relative mb-8">
                                    <div className="size-32 rounded-[2.5rem] border-4 border-[#22eb7e]/30 p-2 rotate-3 hover:rotate-0 transition-transform duration-500">
                                        <img
                                            src={dogData.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop'}
                                            alt={dogData.name}
                                            className="w-full h-full rounded-[2rem] object-cover shadow-2xl"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 size-12 bg-[#22eb7e] text-[#102217] rounded-2xl flex items-center justify-center shadow-xl border-4 border-[#102217]">
                                        <Dog size={24} strokeWidth={3} />
                                    </div>
                                </div>

                                <h2 className="text-4xl font-black tracking-tight mb-2">{dogData.name || 'Pet'}</h2>
                                <div className="flex items-center gap-3 justify-center mb-8">
                                    <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#22eb7e]">{dogData.age || 'N/I'}</span>
                                    <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#22eb7e]">{dogData.gender === 'male' ? 'Macho' : 'Fêmea'}</span>
                                </div>

                                <div className="w-full space-y-3">
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                                        <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-[#22eb7e]">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Localização</p>
                                            <p className="text-sm font-bold">{city || 'Portugal'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                                        <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-[#22eb7e]">
                                            <Sparkles size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Temperamento</p>
                                            <p className="text-sm font-bold truncate">{(dogData.traits || []).join(', ') || 'N/I'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) ? (
                    // Business Flow: Shop / Grooming
                    <div className="space-y-6 animate-fadeIn pb-10">
                        {step === 2 && (
                            <>
                                <div className="mb-8">
                                    <h1 className="text-3xl font-black mb-2">{t('business_type_title')} 🏢</h1>
                                    <p className="text-gray-500 font-medium">{t('business_type_subtitle')}</p>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { id: 'clinic', label: t('vet_clinic'), icon: Stethoscope },
                                        { id: 'grooming', label: t('grooming_shop'), icon: Scissors }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setBusinessData({ ...businessData, type: type.id as any })}
                                            className={`w-full p-6 rounded-3xl border-2 flex items-center gap-4 transition-all ${businessData.type === type.id
                                                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                                                : 'bg-white border-slate-100 shadow-sm'
                                                }`}
                                        >
                                            <div className={`size-12 rounded-2xl flex items-center justify-center ${businessData.type === type.id ? 'bg-primary text-[#102217]' : 'bg-slate-50 text-slate-400'}`}>
                                                <type.icon size={24} strokeWidth={2.5} />
                                            </div>
                                            <span className="text-lg font-bold flex-1 text-left">{type.label}</span>
                                            {businessData.type === type.id && <CheckCircle2 className="text-primary" size={20} strokeWidth={3} />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="mb-8">
                                    <h1 className="text-3xl font-black mb-2">Dados da Empresa 📋</h1>
                                    <p className="text-gray-500 font-medium">Precisamos dos dados legais para validação.</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('business_name')}</label>
                                        <input
                                            type="text"
                                            value={businessData.name}
                                            onChange={e => setBusinessData({ ...businessData, name: e.target.value })}
                                            placeholder="Nome Fantasia"
                                            className="w-full h-16 bg-white dark:bg-surface-dark rounded-3xl px-6 font-bold border-2 border-transparent focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('tax_id_eu')}</label>
                                        <input
                                            type="text"
                                            value={businessData.tax_id}
                                            onChange={e => setBusinessData({ ...businessData, tax_id: e.target.value })}
                                            placeholder="Tax ID / VAT Number"
                                            className="w-full h-16 bg-white dark:bg-surface-dark rounded-3xl px-6 font-bold border-2 border-transparent focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('business_address')}</label>
                                        <input
                                            type="text"
                                            value={businessData.address}
                                            onChange={e => setBusinessData({ ...businessData, address: e.target.value })}
                                            placeholder="Endereço da Sede"
                                            className="w-full h-16 bg-white dark:bg-surface-dark rounded-3xl px-6 font-bold border-2 border-transparent focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">Comprovante / Licença</label>
                                        {businessData.doc_url ? (
                                            <span className="text-primary font-bold flex items-center gap-2"><CheckCircle2 size={18} />Arquivo Enviado</span>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center">
                                                <Upload size={32} className="text-primary mb-2" />
                                                <span className="text-xs font-bold text-slate-400">Clique para enviar comprovante</span>
                                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'doc')} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 p-6 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/20 transition-all flex items-center gap-4">
                                    <div className={`size-14 rounded-2xl flex items-center justify-center transition-colors ${hasShop ? 'bg-primary/20 text-primary' : 'bg-slate-50 text-slate-400'}`}>
                                        <ShoppingBag size={28} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold">{t('shop_function')}</h3>
                                        <p className="text-xs text-gray-500 font-medium">Permitir venda de produtos no marketplace</p>
                                    </div>
                                    <button
                                        onClick={() => setHasShop(!hasShop)}
                                        className={`w-14 h-8 rounded-full relative transition-colors ${hasShop ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 size-6 bg-white rounded-full transition-all ${hasShop ? 'left-7' : 'left-1'} shadow-sm`} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-10 animate-fade-in pb-10">
                        {step === 2 && (
                            <div className="space-y-10">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">Quais <span className="text-[#22eb7e]">Serviços</span> você oferece?</h1>
                                    <p className="text-slate-500 font-bold leading-relaxed">Você pode escolher múltiplas opções.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
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
                                            className={`flex items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border-2 transition-all group ${providerData.services.includes(svc.id) ? 'border-[#22eb7e] bg-[#22eb7e]/5' : 'border-transparent'}`}
                                        >
                                            <div className={`size-16 rounded-2xl flex items-center justify-center transition-all ${providerData.services.includes(svc.id) ? 'bg-[#22eb7e] text-[#102217]' : 'bg-slate-50 text-slate-300'}`}>
                                                <svc.icon size={28} strokeWidth={2.5} />
                                            </div>
                                            <span className="text-lg font-black text-slate-900 flex-1 text-left">{svc.label}</span>
                                            <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${providerData.services.includes(svc.id) ? 'bg-[#22eb7e] border-[#22eb7e] scale-110' : 'border-slate-200'}`}>
                                                {providerData.services.includes(svc.id) && <Check size={14} className="text-[#102217] stroke-[4]" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-10">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">Sua <span className="text-[#22eb7e]">Identidade</span> 🪪</h1>
                                    <p className="text-slate-500 font-bold leading-relaxed">Precisamos de uma foto do seu documento para segurança.</p>
                                </div>
                                <div className="premium-card !p-10 !rounded-[3.5rem] border-dashed border-2 border-slate-200 flex flex-col items-center justify-center min-h-[300px] bg-white group cursor-pointer hover:border-[#22eb7e] transition-all">
                                    {providerData.doc_url ? (
                                        <div className="relative w-full">
                                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-100 shadow-2xl">
                                                <img src={providerData.doc_url} alt="Document" className="w-full h-full object-cover grayscale opacity-40 blur-[2px]" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#102217]/60 backdrop-blur-sm">
                                                    <Lock size={48} className="text-[#22eb7e] mb-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22eb7e]">Documento Protegido</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setProviderData({ ...providerData, doc_url: '' })}
                                                className="absolute -top-4 -right-4 size-12 bg-white text-rose-500 rounded-full flex items-center justify-center shadow-2xl border border-slate-100 active:scale-95 transition-all"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center gap-6 cursor-pointer w-full text-center">
                                            <div className="size-24 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#22eb7e]/10 group-hover:text-[#22eb7e] transition-all">
                                                {uploadingDoc ? <div className="size-8 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin" /> : <FileText size={48} />}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Tire uma foto nítida</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">FRENTE E VERSO OU PASSAPORTE</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'doc')} disabled={uploadingDoc} />
                                        </label>
                                    )}
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <Shield size={20} className="text-[#22eb7e] shrink-0" />
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                                        Seus dados são criptografados de ponta a ponta e usados apenas para verificação de identidade.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-10">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">Detalhes da <span className="text-[#22eb7e]">Conta</span> ✨</h1>
                                    <p className="text-slate-500 font-bold leading-relaxed">Quase lá! Finalize seu perfil profissional.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="label-premium ml-4">Endereço de Atendimento</label>
                                        <div className="relative">
                                            <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={providerData.address}
                                                onChange={e => setProviderData({ ...providerData, address: e.target.value })}
                                                placeholder="Rua, Número, Bairro - Cidade"
                                                className="input-premium !pl-14"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-[#102217] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-[#102217]/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#22eb7e]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-[#22eb7e]/10 flex items-center justify-center text-[#22eb7e]">
                                                    <CreditCard size={16} />
                                                </div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Dados para Recebimento (IBAN)</label>
                                            </div>
                                            <input
                                                type="text"
                                                value={providerData.pix}
                                                onChange={e => setProviderData({ ...providerData, pix: e.target.value })}
                                                placeholder="PT50 0000 0000 0000 0000 0000 0"
                                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold placeholder:text-white/20 focus:border-[#22eb7e] transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="label-premium ml-4">Fale sobre sua experiência</label>
                                        <textarea
                                            value={providerData.bio}
                                            onChange={e => setProviderData({ ...providerData, bio: e.target.value })}
                                            placeholder="Fale um pouco sobre você e seu amor por pets..."
                                            className="input-premium !h-32 !py-6 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="px-6 py-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 sticky bottom-0 z-50">
                <button
                    onClick={handleNext}
                    disabled={uploading || uploadingDoc}
                    className="btn-primary-premium w-full group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10">
                        {((selectedRole === UserRole.OWNER && step === 3) ||
                            ((selectedRole === UserRole.WALKER || selectedRole === UserRole.BOARDING) && step === 4) ||
                            ((selectedRole === UserRole.PETSHOP || selectedRole === UserRole.GROOMING) && step === 3))
                            ? 'Finalizar Cadastro'
                            : 'Continuar'}
                    </span>
                    <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
            </footer>
        </div >
    );
};

export default OnboardingView;
