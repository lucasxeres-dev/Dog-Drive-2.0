import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import { dogService } from './services/dogService';
import BottomNav from './components/BottomNav';

// Lazy loading views for performance
const LandingView = lazy(() => import('./views/LandingView'));
const LoginView = lazy(() => import('./views/LoginView'));
const RegisterView = lazy(() => import('./views/RegisterView'));
const OnboardingView = lazy(() => import('./views/OnboardingView'));
const FeedView = lazy(() => import('./views/FeedView'));
const WalkerListView = lazy(() => import('./views/WalkerListView'));
const ChatListView = lazy(() => import('./views/ChatListView'));
const ChatDetailView = lazy(() => import('./views/ChatDetailView'));
const ProfileDetailView = lazy(() => import('./views/ProfileDetailView'));
const BookingView = lazy(() => import('./views/BookingView'));
const ServicesView = lazy(() => import('./views/ServicesView'));
const EmergencyView = lazy(() => import('./views/EmergencyView'));
const MarketplaceView = lazy(() => import('./views/MarketplaceView'));
const CartView = lazy(() => import('./views/CartView'));
const WalletView = lazy(() => import('./views/WalletView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const ProviderRegistrationView = lazy(() => import('./views/ProviderRegistrationView'));

const LoadingFallback = () => (
    <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const App: React.FC = () => {
    const { profile, loading: isLoadingAuth, isAuthenticated } = useAuth();

    if (isLoadingAuth) return <LoadingFallback />;

    return (
        <LanguageProvider>
            <NotificationProvider>
                <Router>
                    <div className="min-h-screen bg-[#050705] flex justify-center items-center p-0 md:p-4">
                        <div className="w-full max-w-[440px] h-[100dvh] md:h-[850px] bg-white dark:bg-background-dark md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col border border-white/5 font-sans">
                            <Suspense fallback={<LoadingFallback />}>
                                <Routes>
                                    <Route path="/" element={isAuthenticated ? <Navigate to="/feed" /> : <LandingView />} />
                                    <Route path="/login" element={<LoginView onLogin={() => { }} />} />
                                    <Route path="/register" element={<RegisterView />} />
                                    <Route path="/onboarding" element={<OnboardingView onSelectRole={() => { }} />} />
                                    <Route path="/feed" element={<FeedCheck isAuthenticated={isAuthenticated} role={profile?.role || null} />} />
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
                            </Suspense>
                            <AuthBottomNav isAuthenticated={isAuthenticated} preferences={profile?.preferences} role={profile?.role || null} />
                        </div>
                    </div>
                </Router>
            </NotificationProvider>
        </LanguageProvider>
    );
};

const FeedCheck: React.FC<{ isAuthenticated: boolean, role: string | null }> = ({ isAuthenticated, role }) => {
    const [hasDogs, setHasDogs] = React.useState<boolean | null>(null);
    const [loading, setLoading] = React.useState(true);
    const { user } = useAuth();

    React.useEffect(() => {
        const check = async () => {
            if (!isAuthenticated || !user) return;
            if (role === 'provider' || role === 'business') {
                setHasDogs(true);
                setLoading(false);
                return;
            }
            const count = await dogService.countDogsByOwner(user.id);
            setHasDogs(count > 0);
            setLoading(false);
        };
        check();
    }, [isAuthenticated, role, user]);

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (loading) return <LoadingFallback />;
    if (role === 'user' && !hasDogs) return <Navigate to="/onboarding" />;

    return role === 'user' ? <WalkerListView /> : <FeedView />;
};

const AuthBottomNav: React.FC<{ isAuthenticated: boolean, preferences: any, role: string | null }> = ({ isAuthenticated, preferences, role }) => {
    const { pathname } = (window as any).location; // Fallback since useLocation is inside Suspense
    // Note: useLocation is better but need to handle correctly with router context
    // This is a simplified version; ideally would use a child component with useLocation
    return <BottomNavContainer isAuthenticated={isAuthenticated} preferences={preferences} role={role} />;
};

const BottomNavContainer: React.FC<{ isAuthenticated: boolean, preferences: any, role: string | null }> = ({ isAuthenticated, preferences, role }) => {
    // We need to be inside a component that is a child of Router to use useLocation
    try {
        const location = (window as any).ReactRouterDOM?.useLocation() || { pathname: '/' };
        const hideOn = ['/', '/login', '/register', '/onboarding'];
        const shouldHide = hideOn.includes(location.pathname) || !isAuthenticated;
        if (shouldHide) return null;
        return <BottomNav preferences={preferences} role={role} />;
    } catch {
        // Fallback if useLocation fails outside context
        const hideOn = ['/', '/login', '/register', '/onboarding'];
        const shouldHide = hideOn.some(path => window.location.hash.includes(path)) || !isAuthenticated;
        if (shouldHide) return null;
        return <BottomNav preferences={preferences} role={role} />;
    }
}

export default App;
