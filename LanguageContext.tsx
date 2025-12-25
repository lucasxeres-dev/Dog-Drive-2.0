
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    app_name: 'Dog Drive',
    landing_subtitle: 'Encontre o par perfeito para seu pet. Conecte-se com passeadores e novos amigos.',
    choose_lang: 'Escolha seu idioma',
    login_title: 'Bem-vindo de volta!',
    email_label: 'E-mail ou Usuário',
    password_label: 'Senha',
    forgot_pass: 'Esqueceu sua senha?',
    enter_btn: 'Entrar',
    or_continue: 'Ou continue com',
    no_account: 'Não tem uma conta?',
    sign_up: 'Cadastre-se',
    onboarding_title: 'Bem-vindo ao Dog Drive!',
    onboarding_sub: 'Selecione seu tipo de perfil para começar.',
    owner: 'Dono do Dog',
    walker: 'Passeador e Hospedagem',
    business: 'Pet Shops e Clínicas',
    email_placeholder: 'ex: amantedecao@email.com',
    password_placeholder: 'Digite sua senha',
    login_subtitle: 'O match perfeito para seu pet',
    continue: 'Continuar',
    match_tab: 'MATCH',
    services_tab: 'SERVIÇOS',
    chat_tab: 'CONVERSAS',
    help_tab: 'AJUDA',
    search_placeholder: 'Buscar...',
    need_help: 'Precisa de ajuda?',
    location_label: 'Sua Localização',
    call_police: 'Chamar Polícia',
    report_accident: 'Reportar Acidente',
    call_owner: 'Ligar para o Dono',
    emergency_warn: 'O uso destes recursos compartilhará sua localização.',
    book: 'Agendar',
    summary: 'Resumo',
    total: 'Total',
    pay_btn: 'Agendar e Pagar',
    marketplace: 'Mercado',
    all: 'Todos',
    food: 'Ração',
    toys: 'Brinquedos',
    messages: 'Mensagens',
    new_matches: 'Novas Combinações',
    about: 'Sobre',
    traits: 'Traços e Necessidades',
    location: 'Localização',
    conversations: 'Conversas',
    city: 'Rio de Janeiro',
    services_top_sub: 'Serviços • Atendimento',
    services_title: 'O que seu cão precisa?',
    walking_cat: 'Passeio',
    boarding_cat: 'Hospedagem',
    grooming_cat: 'Banho e Tosa',
    vet_cat: 'Veterinário',
    marketplace_cat: 'Mercado',
    find_walker: 'Encontrar Passeador',
    search_walker: 'Buscar por nome...',
    nearby: 'Próximos',
    top_rated: 'Melhor Avaliados',
    lowest_price: 'Menor Preço',
    per_hour: '/hr',
    date: 'Data',
    september_2025: 'Setembro 2025',
    walking_service: 'Passeio (1h)',
    filter_preferences: 'Preferências',
    max_distance: 'Distância Máxima',
    location_filter: 'Localização',
    apply_filters: 'Aplicar Filtros',
    pet_name: 'Nome do Pet',
    pet_age: 'Idade',
    pet_traits: 'Peculiaridades/Temperamento',
    pet_request: 'Que serviço você procura para ele?',
    pet_photo: 'Foto do Pet (URL)',
    walker_bio: 'Sua Experiência',
    finish_btn: 'Finalizar Cadastro',
    service_type: 'Quais serviços você oferece?',
    walking: 'Passeador',
    boarding_label: 'Hospedagem',
    doc_upload: 'Envie uma foto do seu Documento (RG/CPF)',
    address_label: 'Endereço Residencial',
    bank_title: 'Dados para Recebimento (PIX)',
    pix_key: 'Chave PIX',
    experience_label: 'Conte sua experiência com pets'
  },
  en: {
    app_name: 'Dog Drive',
    landing_subtitle: 'Find the perfect match for your pet. Connect with walkers, sitters, and new friends.',
    choose_lang: 'Choose your language',
    login_title: 'Welcome back!',
    email_label: 'Email or Username',
    password_label: 'Password',
    forgot_pass: 'Forgot password?',
    enter_btn: 'Enter',
    or_continue: 'Or continue with',
    no_account: 'Don\'t have an account?',
    sign_up: 'Sign up',
    onboarding_title: 'Welcome to Dog Drive!',
    onboarding_sub: 'Select your profile type to get started.',
    owner: 'Dog Owner',
    walker: 'Walker & Boarding',
    business: 'Pet Services',
    email_placeholder: 'ex: doglover@email.com',
    password_placeholder: 'Enter your password',
    login_subtitle: 'The perfect match for your pet',
    continue: 'Continue',
    match_tab: 'MATCH',
    services_tab: 'SERVICES',
    chat_tab: 'CHATS',
    help_tab: 'HELP',
    search_placeholder: 'Search...',
    need_help: 'Need help?',
    location_label: 'Your Location',
    call_police: 'Call Police',
    report_accident: 'Report Accident',
    call_owner: 'Call Dog Owner',
    emergency_warn: 'Using these features will share your live location.',
    book: 'Book',
    summary: 'Summary',
    total: 'Total',
    pay_btn: 'Schedule and Pay',
    marketplace: 'Marketplace',
    all: 'All',
    food: 'Food',
    toys: 'Toys',
    messages: 'Messages',
    new_matches: 'New Matches',
    about: 'About',
    traits: 'Traits & Needs',
    location: 'Location',
    conversations: 'Conversations',
    city: 'Rio de Janeiro',
    services_top_sub: 'Services • Assistance',
    services_title: 'What does your dog need?',
    walking_cat: 'Dog Walking',
    boarding_cat: 'Boarding',
    grooming_cat: 'Grooming',
    vet_cat: 'Vet Services',
    marketplace_cat: 'Marketplace',
    find_walker: 'Find a Walker',
    search_walker: 'Search by name...',
    nearby: 'Nearby',
    top_rated: 'Top Rated',
    lowest_price: 'Lowest Price',
    per_hour: '/hr',
    date: 'Date',
    september_2025: 'September 2025',
    walking_service: 'Walking (1hr)',
    filter_preferences: 'Preferences',
    max_distance: 'Maximum Distance',
    location_filter: 'Location',
    apply_filters: 'Apply Filters',
    pet_name: 'Pet Name',
    pet_age: 'Age',
    pet_traits: 'Peculiarities/Traits',
    pet_request: 'What service are you looking for?',
    pet_photo: 'Pet Photo (URL)',
    walker_bio: 'Your Experience',
    finish_btn: 'Finish Registration',
    service_type: 'Which services do you offer?',
    walking: 'Walking',
    boarding_label: 'Boarding',
    doc_upload: 'Upload a photo of your ID (RG/CPF)',
    address_label: 'Home Address',
    bank_title: 'Bank Details (PIX)',
    pix_key: 'PIX Key',
    experience_label: 'Tell us about your experience with pets'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('dog_drive_lang');
    return (saved === 'en' || saved === 'pt') ? saved : 'pt';
  });

  useEffect(() => {
    localStorage.setItem('dog_drive_lang', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['pt']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within a LanguageProvider');
  return context;
};
