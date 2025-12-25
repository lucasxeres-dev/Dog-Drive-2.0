import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import { supabase } from './supabaseClient';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import OnboardingView from './views/OnboardingView';
import FeedView from './views/FeedView';
import ServicesView from './views/ServicesView';
import ChatListView from './views/ChatListView';
import ChatDetailView from './views/ChatDetailView';
import ProfileDetailView from './views/ProfileDetailView';
import BookingView from './views/BookingView';
import WalkerListView from './views/WalkerListView';
import EmergencyView from './views/EmergencyView';
import MarketplaceView from './views/MarketplaceView';
import CartView from './views/CartView';
import WalletView from './views/WalletView';
import ProviderRegistrationView from './views/ProviderRegistrationView';
import RegisterView from './views/RegisterView';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <LanguageProvider>
            <Router>
                <div className="min-h-screen bg-[#050705] flex justify-center items-center p-0 md:p-4">
                    <div className="w-full max-w-[440px] h-[100dvh] md:h-[850px] bg-white dark:bg-background-dark md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col border border-white/5">
                        <Routes>
                            <Route path="/" element={<LandingView />} />
                            <Route path="/login" element={<LoginView onLogin={() => setIsAuthenticated(true)} />} />
                            <Route path="/register" element={<RegisterView />} />
                            <Route path="/onboarding" element={<OnboardingView onSelectRole={(role) => setUserRole(role)} />} />
                            <Route path="/feed" element={<FeedView />} />
                            <Route path="/services" element={<ServicesView />} />
                            <Route path="/walkers" element={<WalkerListView />} />
                            <Route path="/chats" element={<ChatListView />} />
                            <Route path="/chat/:id" element={<ChatDetailView />} />
                            <Route path="/dog/:id" element={<ProfileDetailView />} />
                            <Route path="/booking/:id" element={<BookingView />} />
                            <Route path="/emergency" element={<EmergencyView />} />
                            <Route path="/marketplace" element={<MarketplaceView />} />
                            <Route path="/cart" element={<CartView />} />
                            <Route path="/wallet" element={<WalletView />} />
                            <Route path="/register-provider" element={<ProviderRegistrationView />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                        <AuthBottomNav isAuthenticated={isAuthenticated} />
                    </div>
                </div>
            </Router>
        </LanguageProvider>
    );
};

const AuthBottomNav: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
    const location = window.location.hash; // Since we use HashRouter
    const hideOn = ['#/', '#/login', '#/register', '#/onboarding'];
    const shouldHide = hideOn.includes(location) || !isAuthenticated;

    if (shouldHide) return null;
    return <BottomNav />;
};

export default App;
