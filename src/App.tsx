import { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AgeGate } from './components/AgeGate';
import { StateBlocker } from './components/StateBlocker';
import { CookieConsentBanner } from './components/CookieConsent';
import { AnalyticsProvider } from './components/AnalyticsPlaceholder';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WishlistInitializer } from './components/wishlist/WishlistInitializer';
import { FloatingChatButton } from './components/FloatingChatButton';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CustomerProvider } from './contexts/CustomerContext';
import { useAgeGate } from './hooks/useAgeGate';
import { getUserState } from './utils/cookies';
import { priceTrackingService } from './services/priceTracking';
import MobileCartButton from './components/MobileCartButton';
import { Toaster } from './components/ui/toaster';
import { ToastEventHandler } from './components/ToastEventHandler';
import { ChatBot } from './components/ChatBot';

const LearnPage = lazy(() => import('./pages/LearnPage').then(module => ({ default: module.LearnPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(module => ({ default: module.LegalPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const ShippingPage = lazy(() => import('./pages/ShippingPage').then(module => ({ default: module.ShippingPage })));
const LabResultsPage = lazy(() => import('./pages/LabResultsPage').then(module => ({ default: module.LabResultsPage })));
const CareersPage = lazy(() => import('./pages/CareersPage').then(module => ({ default: module.CareersPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const WishlistPage = lazy(() => import('./components/wishlist/WishlistPage').then(module => ({ default: module.WishlistPage })));
const SharedWishlistPage = lazy(() => import('./components/wishlist/WishlistShare').then(module => ({ default: module.SharedWishlistPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(module => ({ default: module.AccountPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.default })));
const B2BPage = lazy(() => import('./pages/B2BPage').then(module => ({ default: module.B2BPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const HealthCheck = lazy(() => import('./components/HealthCheck').then(module => ({ default: module.HealthCheck })));

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [, setUserState] = useState<string>('');
  const [showStateBlocker, setShowStateBlocker] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [, setSearchOpen] = useState(false);
  const { isAgeVerified, showAgeGate, verifyAge } = useAgeGate();

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/shop') {
      setCurrentPage('shop');
    } else if (path === '/learn') {
      setCurrentPage('learn');
    } else if (path === '/legal') {
      setCurrentPage('legal');
    } else if (path === '/contact') {
      setCurrentPage('contact');
    } else if (path === '/wishlist') {
      setCurrentPage('wishlist');
    } else if (path === '/account') {
      setCurrentPage('account');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/register') {
      setCurrentPage('register');
    } else if (path === '/b2b' || path === '/wholesale') {
      setCurrentPage('b2b');
    } else if (path === '/checkout') {
      setCurrentPage('checkout');
    } else if (path === '/health') {
      setCurrentPage('health');
    } else {
      setCurrentPage('home');
    }

    const savedState = getUserState();
    if (savedState) {
      setUserState(savedState);
    } else {
      setShowStateBlocker(true);
    }

    priceTrackingService.startPriceTracking();

    const script = document.createElement('script');
    script.src = 'https://cdn.userway.org/widget.js';
    script.setAttribute('data-account', 'FREE_ACCOUNT');
    script.async = true;
    script.onload = () => {
      console.log('✅ ADA widget loaded!');
      setTimeout(() => {
        const adaWidget = document.querySelector('[aria-label*="Accessibility"]') || 
                         document.querySelector('[data-uw-feature-tour]') ||
                         document.querySelector('.uw-s10-bottom-right');
        if (adaWidget) {
          const element = adaWidget as HTMLElement;
          element.style.zIndex = '9999';
          element.style.position = 'fixed';
          element.style.display = 'block';
          element.style.visibility = 'visible';
          element.removeAttribute('offscreen');
          
          if (window.innerWidth <= 768) {
            element.style.bottom = '80px';
            element.style.left = '20px';
            element.style.right = 'auto';
          } else {
            element.style.bottom = '20px';
            element.style.right = '20px';
            element.style.left = 'auto';
          }
          element.style.top = 'auto';
          element.style.width = '60px';
          element.style.height = '60px';
          
          console.log('✅ ADA widget positioned:', {
            mobile: window.innerWidth <= 768,
            bottom: element.style.bottom,
            left: element.style.left,
            right: element.style.right,
            display: element.style.display,
            visibility: element.style.visibility
          });
        }
      }, 1000);
    };
    document.head.appendChild(script);

    return () => {
      priceTrackingService.stopPriceTracking();
    };
  }, []);

  const handleStateVerified = (state: string) => {
    setUserState(state);
    setShowStateBlocker(false);
  };

  const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'shop':
        return <ShopPage />;
      case 'learn':
        return (
          <Suspense fallback={<PageLoader />}>
            <LearnPage />
          </Suspense>
        );
      case 'legal':
        return (
          <Suspense fallback={<PageLoader />}>
            <LegalPage />
          </Suspense>
        );
      case 'contact':
        return (
          <Suspense fallback={<PageLoader />}>
            <ContactPage />
          </Suspense>
        );
      case 'shipping':
        return (
          <Suspense fallback={<PageLoader />}>
            <ShippingPage />
          </Suspense>
        );
      case 'lab-results':
        return (
          <Suspense fallback={<PageLoader />}>
            <LabResultsPage />
          </Suspense>
        );
      case 'careers':
        return (
          <Suspense fallback={<PageLoader />}>
            <CareersPage />
          </Suspense>
        );
      case 'wishlist':
        return (
          <Suspense fallback={<PageLoader />}>
            <WishlistPage onNavigate={setCurrentPage} />
          </Suspense>
        );
      case 'wishlist-shared':
        return (
          <Suspense fallback={<PageLoader />}>
            <SharedWishlistPage shareCode="demo" onNavigate={setCurrentPage} />
          </Suspense>
        );
      case 'admin':
        return (
          <Suspense fallback={<PageLoader />}>
            <AdminPage />
          </Suspense>
        );
      case 'account':
        return (
          <Suspense fallback={<PageLoader />}>
            <AccountPage />
          </Suspense>
        );
      case 'login':
        return (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        );
      case 'register':
        return (
          <Suspense fallback={<PageLoader />}>
            <RegisterPage onNavigate={setCurrentPage} />
          </Suspense>
        );
      case 'b2b':
        return (
          <Suspense fallback={<PageLoader />}>
            <B2BPage />
          </Suspense>
        );
      case 'checkout':
        return (
          <Suspense fallback={<PageLoader />}>
            <CheckoutPage onNavigate={setCurrentPage} isStateBlocked={false} />
          </Suspense>
        );
      case 'health':
        return (
          <Suspense fallback={<PageLoader />}>
            <HealthCheck />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<PageLoader />}>
            <NotFoundPage onNavigate={setCurrentPage} />
          </Suspense>
        );
    }
  };

  return (
    <CustomerProvider>
      <ErrorBoundary>
        <AnalyticsProvider>
          <div className="min-h-screen bg-risevia-black text-white">
            <AgeGate isOpen={showAgeGate} onVerify={verifyAge} />
            
            {showStateBlocker && (
              <StateBlocker onStateVerified={handleStateVerified} />
            )}
            
            {isAgeVerified && (
              <>
                <WishlistInitializer />
                <Navigation 
                  currentPage={currentPage} 
                  onNavigate={setCurrentPage}
                  userMenuOpen={userMenuOpen}
                  setUserMenuOpen={setUserMenuOpen}
                  setSearchOpen={setSearchOpen}
                />
                <main>
                  {renderCurrentPage()}
                </main>
                <Footer onNavigate={setCurrentPage} />
                <MobileCartButton />
                <CookieConsentBanner />
                <FloatingChatButton />
              </>
            )}
          </div>
          <ToastEventHandler />
          <Toaster />
          <ChatBot />
        </AnalyticsProvider>
      </ErrorBoundary>
    </CustomerProvider>
  );
}

export default App;
