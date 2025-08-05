import { useState, useEffect } from 'react';
import './App.css';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AgeGate } from './components/AgeGate';
import { StateBlocker } from './components/StateBlocker';
import { CookieConsentBanner } from './components/CookieConsent';
import { AnalyticsProvider } from './components/AnalyticsPlaceholder';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProgressBar from './components/ui/ProgressBar';
import BackToTop from './components/ui/BackToTop';
import MonitoringDashboard from './components/analytics/MonitoringDashboard';
import FeedbackWidget from './components/analytics/FeedbackWidget';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { LearnPage } from './pages/LearnPage';
import { LegalPage } from './pages/LegalPage';
import { ContactPage } from './pages/ContactPage';
import { ShippingPage } from './pages/ShippingPage';
import { LabResultsPage } from './pages/LabResultsPage';
import { CareersPage } from './pages/CareersPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAgeGate } from './hooks/useAgeGate';
import { getUserState } from './utils/cookies';
import { isStateBlocked } from './utils/stateBlocking';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [, setUserState] = useState<string>('');
  const [isUserStateBlocked, setIsUserStateBlocked] = useState(false);
  const [showStateBlocker, setShowStateBlocker] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAgeVerified, showAgeGate, verifyAge } = useAgeGate();

  useEffect(() => {
    const savedState = getUserState();
    if (savedState) {
      setUserState(savedState);
      setIsUserStateBlocked(isStateBlocked(savedState));
    } else {
      setShowStateBlocker(true);
    }
  }, []);

  const handleStateVerified = (state: string) => {
    setUserState(state);
    setIsUserStateBlocked(isStateBlocked(state));
    setShowStateBlocker(false);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'shop':
        return <ShopPage isStateBlocked={isUserStateBlocked} />;
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
      default:
        return <NotFoundPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ErrorBoundary>
      <AnalyticsProvider>
        <CartProvider>
          <div className="min-h-screen bg-risevia-black text-white">
            <ProgressBar />
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
                <BackToTop />
                <MonitoringDashboard />
                <FeedbackWidget />
              </>
            )}
          </div>
        </CartProvider>
      </AnalyticsProvider>
    </ErrorBoundary>
  );
}

export default App;
