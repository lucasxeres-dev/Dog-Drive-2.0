import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { dogService } from './services/dogService';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import { ShoppingBag } from 'lucide-react';

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
const ProductDetailView = lazy(() => import('./views/ProductDetailView'));
const CartView = lazy(() => import('./views/CartView'));
const CheckoutView = lazy(() => import('./views/CheckoutView'));
const ProviderDashboard = lazy(() => import('./views/ProviderDashboard'));
const ChatList = lazy(() => import('./views/ChatList'));
const ChatView = lazy(() => import('./views/ChatView'));
const GroomerDashboard = lazy(() => import('./views/GroomerDashboard'));
const MyBookingsView = lazy(() => import('./views/MyBookingsView'));
const BookingDetailView = lazy(() => import('./views/BookingDetailView'));
const WalletView = lazy(() => import('./views/WalletView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const PublicStoreView = lazy(() => import('./views/PublicStoreView'));
const ProviderRegistrationView = lazy(() => import('./views/ProviderRegistrationView'));
const MapView = lazy(() => import('./views/MapView'));

const LoadingFallback = () => (
    <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const MainApp: React.FC = () => {
    const { profile, loading: isLoadingAuth, isAuthenticated } = useAuth();
    const location = useLocation();

    if (isLoadingAuth) return <LoadingFallback />;

    const containerClasses = "w-full max-w-[440px] m-auto h-[100dvh] md:h-[850px] bg-white dark:bg-background-dark md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col border border-white/5 font-sans transition-all duration-700";

    return (
        <div className="min-h-screen bg-[#050705] flex justify-center items-center p-0 md:p-4">
            <div className={containerClasses}>
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
                        <Route path="/product/:slug" element={<ProductDetailView />} />
                        <Route path="/cart" element={<CartView />} />
                        <Route path="/checkout" element={<CheckoutView />} />
                        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                        <Route path="/bookings" element={<MyBookingsView />} />
                        <Route path="/bookings/:id" element={<BookingDetailView />} />
                        <Route path="/wallet" element={<WalletView />} />
                        <Route path="/groomer-dashboard" element={<GroomerDashboard />} />
                        <Route path="/store/:id" element={<PublicStoreView />} />

                        <Route path="/settings" element={<SettingsView />} />
                        <Route path="/register-provider" element={<ProviderRegistrationView />} />
                        <Route path="/map" element={<MapView />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Suspense>
                <AuthBottomNav isAuthenticated={isAuthenticated} preferences={profile?.preferences} role={profile?.role || null} />
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <LanguageProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <Router>
                            <MainApp />
                        </Router>
                    </AuthProvider>
                </NotificationProvider>
            </LanguageProvider>
        </ErrorBoundary>
    );
};

const FeedCheck: React.FC<{ isAuthenticated: boolean, role: string | null }> = ({ isAuthenticated, role }) => {
    const [hasDogs, setHasDogs] = React.useState<boolean | null>(null);
    const [loading, setLoading] = React.useState(true);
    const { user } = useAuth();

    React.useEffect(() => {
        const check = async () => {
            if (!isAuthenticated || !user) {
                setLoading(false);
                return;
            }
            try {
                if (role === 'provider' || role === 'business') {
                    setHasDogs(true);
                } else {
                    const count = await dogService.countDogsByOwner(user.id);
                    setHasDogs(count > 0);
                }
            } catch (err) {
                console.error('Feed check error:', err);
                setHasDogs(false);
            } finally {
                setLoading(false);
            }
        };
        check();
    }, [isAuthenticated, role, user]);

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (loading) return <LoadingFallback />;
    if (role === 'owner' && !hasDogs) return <Navigate to="/onboarding" />;

    return role === 'owner' ? <WalkerListView /> : <FeedView />;
};



const AuthBottomNav: React.FC<{ isAuthenticated: boolean, preferences: any, role: string | null }> = ({ isAuthenticated, preferences, role }) => {
    const location = useLocation();
    const hideOn = ['/', '/login', '/register', '/onboarding'];
    const shouldHide = hideOn.includes(location.pathname) || !isAuthenticated;
    if (shouldHide) return null;
    return <BottomNav preferences={preferences} role={role} />;
};

export default App;
