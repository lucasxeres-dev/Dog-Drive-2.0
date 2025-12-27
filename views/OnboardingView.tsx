
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useTranslation } from '../LanguageContext';
import { supabase } from '../supabaseClient';

interface OnboardingViewProps {
    onSelectRole: (role: string) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onSelectRole }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.OWNER);
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [city, setCity] = useState<string>('Rio de Janeiro');
    const [selectedCountry, setSelectedCountry] = useState<string>('BR');
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
        traits: '',
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

    const [uploading, setUploading] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pet' | 'doc') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (type === 'pet') setUploading(true);
            else setUploadingDoc(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { data: { user } } = await supabase.auth.getUser();
            const filePath = `${user?.id || 'guest'}/${fileName}`;
            const bucket = type === 'pet' ? 'pet-photos' : 'documents';

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            if (type === 'pet') {
                setDogData({ ...dogData, photo: data.publicUrl });
            } else if (selectedRole === UserRole.BUSINESS) {
                setBusinessData({ ...businessData, doc_url: data.publicUrl });
            } else {
                setProviderData({ ...providerData, doc_url: data.publicUrl });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao enviar imagem. Tente novamente.');
        } finally {
            if (type === 'pet') setUploading(false);
            else setUploadingDoc(false);
        }
    };

    const handleNext = () => {
        if (step === 0) {
            setStep(1);
        } else if (step === 1) {
            setStep(2);
        } else if (selectedRole === UserRole.WALKER && step < 4) {
            setStep(step + 1);
        } else if (selectedRole === UserRole.BUSINESS && step < 3) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        // Update profile
        const { error: profileError } = await supabase.from('profiles').update({
            role: selectedRole === UserRole.OWNER ? 'user' :
                selectedRole === UserRole.BUSINESS ? 'business' : 'provider',
            address: selectedRole === UserRole.WALKER ? providerData.address :
                selectedRole === UserRole.BUSINESS ? businessData.address : null,
            provider_services: selectedRole === UserRole.WALKER ? providerData.services : null,
            document_url: selectedRole === UserRole.WALKER ? providerData.doc_url :
                selectedRole === UserRole.BUSINESS ? businessData.doc_url : null,
            country: selectedCountry,
            business_name: selectedRole === UserRole.BUSINESS ? businessData.name : null,
            tax_id: selectedRole === UserRole.BUSINESS ? businessData.tax_id : null,
            business_type: selectedRole === UserRole.BUSINESS ? businessData.type : 'none',
            latitude: coords?.lat,
            longitude: coords?.lng
        }).eq('id', user.id);

        if (profileError) console.error('Profile update error:', profileError);

        // Save dog for owners
        if (selectedRole === UserRole.OWNER) {
            const { error: dogError } = await supabase.from('dogs').insert({
                owner_id: user.id,
                name: dogData.name,
                age: dogData.age,
                image_url: dogData.photo,
                traits: dogData.traits,
                request_instructions: dogData.request,
                location: city,
                latitude: coords?.lat,
                longitude: coords?.lng
            });

            if (dogError) {
                if (dogError.code === '23505') {
                    // Unique violation: User already has a dog.
                    // This is acceptable as we just want to ensure they have one.
                    // effectively "ignore" the attempt to add a second one.
                    console.warn('User already has a dog registered. Skipping insertion.');
                } else {
                    console.error('Error registering dog:', dogError);
                    alert('Erro ao cadastrar cachorro. Tente novamente.');
                    return; // Stop if genuine error
                }
            }
        }

        // Save bank details for providers
        if (selectedRole === UserRole.WALKER && providerData.pix) {
            await supabase.from('bank_details').upsert({
                user_id: user.id,
                encrypted_data: providerData.pix, // For now, storing directly as PIX. In prod, encrypt.
                bank_name: 'PIX',
                account_type: 'PIX'
            });
        }

        onSelectRole(selectedRole);
        navigate('/feed');
    };

    const roles = [
        { id: UserRole.OWNER, title: t('owner'), icon: 'pets' },
        { id: UserRole.WALKER, title: t('walker'), icon: 'directions_walk' },
        { id: UserRole.BUSINESS, title: t('business'), icon: 'storefront' }
    ];

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display p-6 overflow-y-auto pb-32">
            <header className="flex items-center mb-8">
                {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center border border-gray-100 dark:border-white/10 mr-4">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                )}
                <div className="flex-1 text-center font-bold opacity-60">
                    {step === 0 ? 'Dog Drive' :
                        step === 1 ? (selectedCountry === 'BR' ? t('brazil') : t('europe')) :
                            selectedRole === UserRole.OWNER ? t('owner') :
                                selectedRole === UserRole.BUSINESS ? t('business') : t('walker')}
                </div>
                {step === 0 && <div className="w-10" />}
            </header>

            {step === 0 ? (
                // Step 0: Role Selection
                <>
                    <div className="mb-8">
                        <h1 className="text-[32px] font-extrabold leading-tight mb-3">{t('onboarding_title')}</h1>
                        <p className="text-[#608a72] dark:text-[#a1b8aa] text-base font-medium">{t('onboarding_sub')}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {roles.map((role) => (
                            <label key={role.id} className="cursor-pointer group">
                                <input
                                    type="radio"
                                    className="sr-only peer"
                                    name="role"
                                    checked={selectedRole === role.id}
                                    onChange={() => setSelectedRole(role.id as UserRole)}
                                />
                                <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-sm border-2 border-transparent peer-checked:border-primary transition-all">
                                    <div className="flex items-center justify-center rounded-2xl bg-[#f0f5f2] dark:bg-[#25382c] peer-checked:bg-primary/20 shrink-0 size-14">
                                        <span className={`material-symbols-outlined text-[28px] ${selectedRole === role.id ? 'text-primary' : 'text-gray-400'}`}>{role.icon}</span>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <h3 className="text-lg font-bold">{role.title}</h3>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedRole === role.id ? 'bg-primary border-primary' : 'border-gray-200 dark:border-white/20'}`}>
                                        {selectedRole === role.id && <span className="material-symbols-outlined text-[16px] text-[#102217] font-bold">check</span>}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </>
            ) : step === 1 ? (
                // Step 1: Country Selection
                <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black mb-2">{t('select_country')} 🌍</h1>
                        <p className="text-gray-500 font-medium">Onde você se encontra?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => { setSelectedCountry('BR'); setIsEurope(false); }}
                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${selectedCountry === 'BR' ? 'bg-primary/10 border-primary' : 'bg-white dark:bg-surface-dark border-transparent'}`}
                        >
                            <span className="text-4xl">🇧🇷</span>
                            <span className="font-bold">{t('brazil')}</span>
                        </button>
                        <button
                            onClick={() => { setIsEurope(true); setSelectedCountry('PT'); }}
                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${isEurope ? 'bg-primary/10 border-primary' : 'bg-white dark:bg-surface-dark border-transparent'}`}
                        >
                            <span className="text-4xl">🇪🇺</span>
                            <span className="font-bold">{t('europe')}</span>
                        </button>
                    </div>

                    {isEurope && (
                        <div className="mt-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">País da Europa</label>
                            <select
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="w-full h-16 bg-white dark:bg-surface-dark rounded-3xl px-6 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-sm appearance-none"
                            >
                                {Object.entries(t('countries') as any).map(([code, name]: [string, any]) => (
                                    <option key={code} value={code}>{name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            ) : selectedRole === UserRole.OWNER ? (
                // Step 2: Owner (Dog Info)
                <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black mb-2 animate-slideUp">Cadastre seu Cão 🦴</h1>
                        <p className="text-gray-500 font-medium">Conte-nos um pouco sobre seu melhor amigo.</p>
                    </div>

                    <div className="space-y-5">
                        <div className="group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('pet_name')}</label>
                            <input
                                type="text"
                                value={dogData.name}
                                onChange={e => setDogData({ ...dogData, name: e.target.value })}
                                placeholder="ex: Max"
                                className="w-full h-16 bg-white dark:bg-surface-dark rounded-3xl px-6 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('pet_age')}</label>
                                <input
                                    type="text"
                                    value={dogData.age}
                                    onChange={e => setDogData({ ...dogData, age: e.target.value })}
                                    placeholder="ex: 3 anos"
                                    className="w-full h-16 bg-white dark:bg-surface-dark rounded-3xl px-6 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('pet_photo')}</label>
                            <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-surface-dark rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 transition-all hover:border-primary/50">
                                {dogData.photo ? (
                                    <div className="relative group">
                                        <img src={dogData.photo} alt="Preview" className="size-40 rounded-2xl object-cover shadow-lg" />
                                        <button
                                            onClick={() => setDogData({ ...dogData, photo: '' })}
                                            className="absolute -top-2 -right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center cursor-pointer w-full py-4">
                                        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            {uploading ? (
                                                <div className="size-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <span className="material-symbols-outlined text-3xl text-primary">add_a_photo</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-gray-500">{uploading ? 'Enviando...' : 'Clique para subir a foto'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'pet')}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('pet_traits')}</label>
                            <textarea
                                value={dogData.traits}
                                onChange={e => setDogData({ ...dogData, traits: e.target.value })}
                                placeholder="ex: Muito dócil, medo de fogos..."
                                className="w-full h-32 bg-white dark:bg-surface-dark rounded-3xl p-6 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-sm resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('pet_request')}</label>
                            <textarea
                                value={dogData.request}
                                onChange={e => setDogData({ ...dogData, request: e.target.value })}
                                placeholder="ex: Procuro alguém para passeio educativo"
                                className="w-full h-32 bg-white dark:bg-surface-dark rounded-3xl p-6 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-sm resize-none"
                            />
                        </div>
                    </div>
                </div>
            ) : selectedRole === UserRole.BUSINESS ? (
                // Business Flow: Vet / Grooming
                <div className="space-y-6 animate-fadeIn pb-10">
                    {step === 2 && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-black mb-2">Tipo de Negócio 🏢</h1>
                                <p className="text-gray-500 font-medium">Selecione o serviço que sua empresa oferece.</p>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { id: 'clinic', label: t('vet_clinic'), icon: 'medical_services' },
                                    { id: 'grooming', label: t('grooming_shop'), icon: 'content_cut' }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setBusinessData({ ...businessData, type: type.id as any })}
                                        className={`w-full p-6 rounded-3xl border-2 flex items-center gap-4 transition-all ${businessData.type === type.id
                                            ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                                            : 'bg-white dark:bg-surface-dark border-transparent shadow-sm'
                                            }`}
                                    >
                                        <div className={`size-12 rounded-2xl flex items-center justify-center ${businessData.type === type.id ? 'bg-primary text-[#102217]' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                            <span className="material-symbols-outlined text-2xl font-black">{type.icon}</span>
                                        </div>
                                        <span className="text-lg font-bold flex-1 text-left">{type.label}</span>
                                        {businessData.type === type.id && <span className="material-symbols-outlined text-primary font-black">check_circle</span>}
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{selectedCountry === 'BR' ? t('tax_id_br') : t('tax_id_eu')}</label>
                                    <input
                                        type="text"
                                        value={businessData.tax_id}
                                        onChange={e => setBusinessData({ ...businessData, tax_id: e.target.value })}
                                        placeholder={selectedCountry === 'BR' ? '00.000.000/0001-00' : 'Tax ID / VAT Number'}
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
                                    <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-surface-dark rounded-3xl border-2 border-dashed border-primary/30">
                                        {businessData.doc_url ? (
                                            <span className="text-primary font-bold flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span>Arquivo Enviado</span>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center">
                                                <span className="material-symbols-outlined text-4xl text-primary mb-2">upload_file</span>
                                                <span className="text-xs font-bold text-gray-400">Clique para enviar comprovante</span>
                                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'doc')} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // Provider Flow: Walker / Boarding
                <div className="space-y-6 animate-fadeIn pb-10">
                    {step === 2 && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-black mb-2 animate-slideUp">{t('service_type')}</h1>
                                <p className="text-gray-500 font-medium">Você pode escolher uma ou ambas.</p>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { id: 'walking', label: t('walking'), icon: 'directions_walk' },
                                    { id: 'boarding', label: t('boarding_label'), icon: 'home' }
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
                                        className={`w-full p-6 rounded-3xl border-2 flex items-center gap-4 transition-all ${providerData.services.includes(svc.id)
                                            ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                                            : 'bg-white dark:bg-surface-dark border-transparent shadow-sm'
                                            }`}
                                    >
                                        <div className={`size-12 rounded-2xl flex items-center justify-center ${providerData.services.includes(svc.id) ? 'bg-primary text-[#102217]' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                            <span className="material-symbols-outlined text-2xl font-black">{svc.icon}</span>
                                        </div>
                                        <span className="text-lg font-bold flex-1 text-left">{svc.label}</span>
                                        {providerData.services.includes(svc.id) && <span className="material-symbols-outlined text-primary font-black">check_circle</span>}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-black mb-2 animate-slideUp">Documentação 🪪</h1>
                                <p className="text-gray-500 font-medium">{t('doc_upload')}</p>
                            </div>
                            <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-surface-dark rounded-3xl border-2 border-dashed border-primary/30">
                                {providerData.doc_url ? (
                                    <div className="relative">
                                        <div className="size-48 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-primary/20 shadow-xl">
                                            <img src={providerData.doc_url} alt="Document" className="w-full h-full object-cover grayscale opacity-50" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl text-primary drop-shadow-lg">lock</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setProviderData({ ...providerData, doc_url: '' })}
                                            className="absolute -top-2 -right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center cursor-pointer w-full py-6 group">
                                        <div className="size-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            {uploadingDoc ? (
                                                <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-primary">credit_card</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-black text-gray-500 uppercase tracking-widest">{uploadingDoc ? 'Uploading...' : 'Subir foto para a nuvem'}</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'doc')} disabled={uploadingDoc} />
                                    </label>
                                )}
                            </div>
                        </>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-slideUp">
                            <div>
                                <h1 className="text-3xl font-black mb-2">Quase lá! ✨</h1>
                                <p className="text-gray-500 font-medium">Finalize com seu endereço e dados para pagamento.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('address_label')}</label>
                                    <input
                                        type="text"
                                        value={providerData.address}
                                        onChange={e => setProviderData({ ...providerData, address: e.target.value })}
                                        placeholder="Rua, Número, Bairro - Cidade"
                                        className="w-full h-16 bg-white dark:bg-surface-dark rounded-3xl px-6 font-bold border-2 border-transparent focus:border-primary transition-all shadow-sm"
                                    />
                                </div>

                                <div className="p-6 bg-primary/5 rounded-[2.5rem] border-2 border-primary/20 mt-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="material-symbols-outlined text-primary">payments</span>
                                        <label className="text-xs font-black uppercase tracking-widest text-[#102217]">{t('bank_title')}</label>
                                    </div>
                                    <input
                                        type="text"
                                        value={providerData.pix}
                                        onChange={e => setProviderData({ ...providerData, pix: e.target.value })}
                                        placeholder={t('pix_key')}
                                        className="w-full h-14 bg-white dark:bg-background-dark rounded-2xl px-5 font-bold border-2 border-transparent focus:border-primary transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4 mb-2 block">{t('experience_label')}</label>
                                    <textarea
                                        value={providerData.bio}
                                        onChange={e => setProviderData({ ...providerData, bio: e.target.value })}
                                        placeholder="Fale um pouco sobre você..."
                                        className="w-full h-32 bg-white dark:bg-surface-dark rounded-3xl p-6 font-bold border-2 border-transparent focus:border-primary transition-all shadow-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light dark:from-background-dark pt-12">
                <button
                    onClick={handleNext}
                    disabled={uploading || uploadingDoc}
                    className="w-full h-16 bg-primary text-[#102217] text-lg font-black rounded-3xl shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                >
                    <span>{(step < 2 || (selectedRole === UserRole.WALKER && step < 4) || (selectedRole === UserRole.BUSINESS && step < 3)) ? t('continue') : t('finish_btn')}</span>
                    <span className="material-symbols-outlined font-black">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default OnboardingView;
