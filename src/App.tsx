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
import { ShippingPage } from './pages/ShippingPage';
import { LabResultsPage } from './pages/LabResultsPage';
import { CareersPage } from './pages/CareersPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WishlistPage } from './components/wishlist/WishlistPage';
import { SharedWishlistPage } from './components/wishlist/WishlistShare';
import { AdminPage } from './pages/AdminPage';
import { useAgeGate } from './hooks/useAgeGate';
import { getUserState } from './utils/cookies';
import { priceTrackingService } from './services/priceTracking';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [, setUserState] = useState<string>('');
  const [showStateBlocker, setShowStateBlocker] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAgeVerified, showAgeGate, verifyAge } = useAgeGate();

  useEffect(() => {
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
        return <WishlistPage />;
      case 'wishlist-shared':
        return <SharedWishlistPage shareCode="demo" onNavigate={setCurrentPage} />;
      case 'admin':
        return <AdminPage />;
      default:
        return <NotFoundPage onNavigate={setCurrentPage} />;
    }
  };

  return (
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
                cartOpen={cartOpen}
                setCartOpen={setCartOpen}
                userMenuOpen={userMenuOpen}
                setUserMenuOpen={setUserMenuOpen}
                searchOpen={searchOpen}
                setSearchOpen={setSearchOpen}
              />
              <main>
                {renderCurrentPage()}
              </main>
              <Footer onNavigate={setCurrentPage} />
              <CookieConsentBanner />
            </>
          )}
        </div>
      </AnalyticsProvider>
    </ErrorBoundary>
  );
}

export default App;
