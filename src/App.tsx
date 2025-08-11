import { useState, useEffect } from 'react';
import './App.css';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AgeGate } from './components/AgeGate';
import { StateBlocker } from './components/StateBlocker';
import { CookieConsentBanner } from './components/CookieConsent';
import { AnalyticsProvider } from './components/AnalyticsPlaceholder';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { LearnPage } from './pages/LearnPage';
import { LegalPage } from './pages/LegalPage';
import { ContactPage } from './pages/ContactPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ShippingPage } from './pages/ShippingPage';
import { LabResultsPage } from './pages/LabResultsPage';
import { CareersPage } from './pages/CareersPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WishlistPage } from './components/wishlist/WishlistPage';
import { SharedWishlistPage } from './components/wishlist/WishlistShare';
import { AdminPage } from './pages/AdminPage';
import { CustomerProvider } from './contexts/CustomerContext';
import { AccountPage } from './pages/AccountPage';
import { LoginPage } from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { B2BPage } from './pages/B2BPage';
import { HealthCheck } from './components/HealthCheck';
import { useAgeGate } from './hooks/useAgeGate';
import { getUserState } from './utils/cookies';
import { priceTrackingService } from './services/priceTracking';
import MobileCartButton from './components/MobileCartButton';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [, setUserState] = useState<string>('');
  const [showStateBlocker, setShowStateBlocker] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
      setTimeout(addUserWayHideButton, 2000);
    };
    document.head.appendChild(script);

    const addUserWayHideButton = () => {
      const widget = document.querySelector('[aria-label="Accessibility Menu"]');
      if (widget && !widget.parentElement?.classList.contains('userway-container')) {
        const container = document.createElement('div');
        container.className = 'userway-container';
        
        const hideButton = document.createElement('button');
        hideButton.className = 'userway-hide-button';
        hideButton.innerHTML = '×';
        hideButton.title = 'Minimize accessibility widget';
        hideButton.setAttribute('aria-label', 'Minimize accessibility widget');
        
        hideButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const isMinimized = container.classList.contains('userway-minimized');
          
          if (isMinimized) {
            container.classList.remove('userway-minimized');
            hideButton.innerHTML = '×';
            hideButton.title = 'Minimize accessibility widget';
            localStorage.setItem('userway-minimized', 'false');
          } else {
            container.classList.add('userway-minimized');
            hideButton.innerHTML = '◀';
            hideButton.title = 'Restore accessibility widget';
            localStorage.setItem('userway-minimized', 'true');
          }
        };
        
        widget.parentNode?.insertBefore(container, widget);
        container.appendChild(widget);
        container.appendChild(hideButton);
        
        const isMinimized = localStorage.getItem('userway-minimized') === 'true';
        if (isMinimized) {
          container.classList.add('userway-minimized');
          hideButton.innerHTML = '◀';
          hideButton.title = 'Restore accessibility widget';
        }
        
        console.log('✅ UserWay hide button added!');
      }
    };

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
        return <WishlistPage />;
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
                <Navigation 
                  currentPage={currentPage} 
                  onNavigate={setCurrentPage}
                  userMenuOpen={userMenuOpen}
                  setUserMenuOpen={setUserMenuOpen}
                  setSearchOpen={() => {}}
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
        </AnalyticsProvider>
      </ErrorBoundary>
    </CustomerProvider>
  );
}

export default App;
