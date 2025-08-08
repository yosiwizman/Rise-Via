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
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CustomerProvider } from './contexts/CustomerContext';
import { useAgeGate } from './hooks/useAgeGate';
import { getUserState } from './utils/cookies';
import { priceTrackingService } from './services/priceTracking';
import { Toaster } from './components/ui/sonner';

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
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-position', '6');
    script.async = true;
    script.onload = () => {
      console.log('✅ ADA widget loaded!');
      
      const positionWidget = () => {
        const selectors = [
          '[aria-label*="Accessibility"]',
          '[data-uw-feature-tour]',
          '.uw-s10-bottom-right',
          '.uw-s10-top-right',
          '.uw-s10-middle-right',
          '#uw-widget',
          '[class*="uw-"]',
          'iframe[src*="userway"]',
          'div[style*="position: fixed"]'
        ];
        
        let adaWidget = null;
        for (const selector of selectors) {
          adaWidget = document.querySelector(selector);
          if (adaWidget) {
            console.log(`🎯 Found ADA widget with selector: ${selector}`);
            break;
          }
        }
        
        if (adaWidget) {
          console.log('🔧 Positioning ADA widget to left-middle as requested');
          const element = adaWidget as HTMLElement;
          
          element.style.setProperty('display', 'block', 'important');
          element.style.setProperty('visibility', 'visible', 'important');
          element.style.setProperty('opacity', '1', 'important');
          element.style.setProperty('z-index', '999999', 'important');
          element.style.setProperty('position', 'fixed', 'important');
          element.style.setProperty('top', '50%', 'important');
          element.style.setProperty('left', '20px', 'important');
          element.style.setProperty('transform', 'translateY(-50%)', 'important');
          element.style.setProperty('bottom', 'auto', 'important');
          element.style.setProperty('right', 'auto', 'important');
          element.style.setProperty('width', '60px', 'important');
          element.style.setProperty('height', '60px', 'important');
          element.style.setProperty('border-radius', '50%', 'important');
          element.style.setProperty('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.15)', 'important');
          element.style.setProperty('background-color', '#6366f1', 'important');
          element.style.setProperty('border', '2px solid #8b5cf6', 'important');
          element.style.setProperty('margin', '0', 'important');
          element.style.setProperty('padding', '0', 'important');
          
          if (window.innerWidth <= 768) {
            element.style.setProperty('left', '15px', 'important');
            element.style.setProperty('width', '50px', 'important');
            element.style.setProperty('height', '50px', 'important');
            console.log('📱 Applied mobile-specific ADA widget styling');
          }
          
          let isHidden = false;
          element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            isHidden = !isHidden;
            element.style.setProperty('opacity', isHidden ? '0.3' : '1', 'important');
            element.style.setProperty('pointer-events', isHidden ? 'none' : 'auto', 'important');
            console.log(`🔄 ADA widget ${isHidden ? 'hidden' : 'shown'}`);
          });
          
          element.title = 'Right-click to hide/show • Accessibility Widget';
          console.log('✅ ADA widget positioned to left-middle successfully');
        } else {
          console.warn('⚠️ ADA widget not found, retrying...');
          setTimeout(positionWidget, 1000);
        }
      };
      
      setTimeout(positionWidget, 500);
      setTimeout(positionWidget, 1500);
      setTimeout(positionWidget, 3000);
      setTimeout(positionWidget, 5000);
      
      window.addEventListener('resize', positionWidget);
      
      const observer = new MutationObserver(() => {
        positionWidget();
      });
      observer.observe(document.body, { childList: true, subtree: true });
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
                <CookieConsentBanner />
              </>
            )}
          </div>
        </AnalyticsProvider>
      </ErrorBoundary>
      <Toaster />
    </CustomerProvider>
  );
}

export default App;
