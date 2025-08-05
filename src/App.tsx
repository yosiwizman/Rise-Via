import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AgeGate } from './components/AgeGate';
import { StateBlocker } from './components/StateBlocker';
import { CookieConsentBanner } from './components/CookieConsent';
import { AnalyticsProvider } from './components/AnalyticsPlaceholder';
import { AppRoutes } from './components/AppRoutes';
import { CartDrawer } from './components/CartDrawer';
import { useAgeGate } from './hooks/useAgeGate';
import { getUserState } from './utils/cookies';
import { isStateBlocked } from './utils/stateBlocking';
import { useAppStore, initializeDarkMode } from './store';

function App() {
  const [, setUserState] = useState<string>('');
  const [isUserStateBlocked, setIsUserStateBlocked] = useState(false);
  const [showStateBlocker, setShowStateBlocker] = useState(false);
  const { isAgeVerified, showAgeGate, verifyAge } = useAgeGate();
  
  const { ageVerified } = useAppStore();

  useEffect(() => {
    initializeDarkMode();
    
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


  return (
    <AnalyticsProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-risevia-black text-white">
          <AgeGate isOpen={showAgeGate} onVerify={verifyAge} />
          
          {showStateBlocker && (
            <StateBlocker onStateVerified={handleStateVerified} />
          )}
          
          {(isAgeVerified || ageVerified) && (
            <>
              <Navigation />
              <main>
                <AppRoutes isStateBlocked={isUserStateBlocked} />
              </main>
              <Footer />
              <CartDrawer />
              <CookieConsentBanner />
            </>
          )}
        </div>
      </BrowserRouter>
    </AnalyticsProvider>
  );
}

export default App;
