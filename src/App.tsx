import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { supabase } from './lib/supabaseClient';
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
import SettingsView from './views/SettingsView';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userPreferences, setUserPreferences] = useState<any>({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        // Initial session check
        const initChoice = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('role, preferences').eq('id', session.user.id).single();
                setUserRole(profile?.role || 'user');
                setUserPreferences(profile?.preferences || {});
            }
            setIsLoadingAuth(false);
        };
        initChoice();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setIsAuthenticated(!!session);
            if (session) {
                // If we already have role (e.g. from login view prefetch), this might be redundant but safe
                const { data: profile } = await supabase.from('profiles').select('role, preferences').eq('id', session.user.id).single();
                setUserRole(profile?.role || 'user');
                setUserPreferences(profile?.preferences || {});
            } else {
                setUserRole(null);
                setUserPreferences({});
            }
            setIsLoadingAuth(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Show nothing while initial auth check happens to avoid flicker
    if (isLoadingAuth) return null;

    return (
        <LanguageProvider>
            <Router>
                <div className="min-h-screen bg-[#050705] flex justify-center items-center p-0 md:p-4">
                    <div className="w-full max-w-[440px] h-[100dvh] md:h-[850px] bg-white dark:bg-background-dark md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col border border-white/5">
                        <Routes>
                            <Route path="/" element={isAuthenticated ? <Navigate to="/feed" /> : <LandingView />} />
                            <Route path="/login" element={<LoginView onLogin={() => setIsAuthenticated(true)} />} />
                            <Route path="/register" element={<RegisterView />} />
                            <Route path="/onboarding" element={<OnboardingView onSelectRole={(role) => setUserRole(role)} />} />
                            <Route path="/feed" element={<FeedCheck isAuthenticated={isAuthenticated} role={userRole} />} />
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
                            <Route path="/settings" element={<SettingsView />} />
                            <Route path="/register-provider" element={<ProviderRegistrationView />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                        <AuthBottomNav isAuthenticated={isAuthenticated} preferences={userPreferences} role={userRole} />
                    </div>
                </div>
            </Router>
        </LanguageProvider>
    );
};

const FeedCheck: React.FC<{ isAuthenticated: boolean, role: string | null }> = ({ isAuthenticated, role }) => {
    const [hasDogs, setHasDogs] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const check = async () => {
            if (!isAuthenticated) return;

            // If provider, we don't strictly need to check dogs for access, they have access
            if (role === 'provider' || role === 'business') {
                setHasDogs(true);
                setLoading(false);
                return;
            }

            // Only fetch dogs if role is user or unknown
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { count } = await supabase.from('dogs').select('*', { count: 'exact', head: true }).eq('owner_id', user.id);
                setHasDogs(count !== null && count > 0);
            }
            setLoading(false);
        };
        check();
    }, [isAuthenticated, role]);

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (loading) return null; // Or a skeleton

    // Redirect to onboarding if owner has no dogs
    if (role === 'user' && !hasDogs) return <Navigate to="/onboarding" />;

    // Role-based Feed
    if (role === 'user') {
        return <WalkerListView />;
    } else {
        return <FeedView />;
    }
};

const AuthBottomNav: React.FC<{ isAuthenticated: boolean, preferences: any, role: string | null }> = ({ isAuthenticated, preferences, role }) => {
    const location = useLocation();
    const hideOn = ['/', '/login', '/register', '/onboarding'];
    const shouldHide = hideOn.includes(location.pathname) || !isAuthenticated;

    if (shouldHide) return null;
    return <BottomNav preferences={preferences} role={role} />;
};

export default App;
