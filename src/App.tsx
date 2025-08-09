import { useState, useEffect } from 'react';
import './App.css';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AgeGate } from './components/AgeGate';
import { StateBlocker } from './components/StateBlocker';
import { CookieConsentBanner } from './components/CookieConsent';
import { AnalyticsProvider } from './components/AnalyticsPlaceholder';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WishlistInitializer } from './components/wishlist/WishlistInitializer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { LearnPage } from './pages/LearnPage';
import { LegalPage } from './pages/LegalPage';
import { ContactPage } from './pages/ContactPage';
import { ShippingPage } from './pages/ShippingPage';
import { LabResultsPage } from './pages/LabResultsPage';
import { CareersPage } from './pages/CareersPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WishlistPage } from './components/wishlist/WishlistPage';
import { SharedWishlistPage } from './components/wishlist/WishlistShare';
import { AdminPage } from './pages/AdminPage';
import { AccountPage } from './pages/AccountPage';
import { LoginPage } from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { B2BPage } from './pages/B2BPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { HealthCheck } from './components/HealthCheck';
import { CustomerProvider } from './contexts/CustomerContext';
import { useAgeGate } from './hooks/useAgeGate';
import { getUserState } from './utils/cookies';
import { priceTrackingService } from './services/priceTracking';
import MobileCartButton from './components/MobileCartButton';
import { Toaster } from './components/ui/toaster';
import { ToastEventHandler } from './components/ToastEventHandler';

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


  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'shop':
        return <ShopPage />;
      case 'learn':
        return <LearnPage />;
      case 'legal':
        return <LegalPage />;
      case 'contact':
        return <ContactPage />;
      case 'shipping':
        return <ShippingPage />;
      case 'lab-results':
        return <LabResultsPage />;
      case 'careers':
        return <CareersPage />;
      case 'wishlist':
        return <WishlistPage onNavigate={setCurrentPage} />;
      case 'wishlist-shared':
        return <SharedWishlistPage shareCode="demo" onNavigate={setCurrentPage} />;
      case 'admin':
        return <AdminPage />;
      case 'account':
        return <AccountPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'b2b':
        return <B2BPage />;
      case 'checkout':
        return <CheckoutPage onNavigate={setCurrentPage} isStateBlocked={false} />;
      case 'health':
        return <HealthCheck />;
      default:
        return <NotFoundPage onNavigate={setCurrentPage} />;
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
              </>
            )}
          </div>
          <ToastEventHandler />
          <Toaster />
        </AnalyticsProvider>
      </ErrorBoundary>
    </CustomerProvider>
  );
}

export default App;
