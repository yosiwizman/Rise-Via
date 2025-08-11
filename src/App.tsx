import { useState, useEffect, lazy, startTransition } from 'react';
import './App.css';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AgeGate } from './components/AgeGate';
import { StateBlocker } from './components/StateBlocker';
import { CookieConsentBanner } from './components/CookieConsent';
import { AnalyticsProvider } from './components/AnalyticsPlaceholder';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WishlistInitializer } from './components/wishlist/WishlistInitializer';
import MobileCartButton from './components/MobileCartButton';
import { ToastEventHandler } from './components/ToastEventHandler';
import { ChatBot } from './components/ChatBot';
import { Toaster } from './components/ui/sonner';
import { CustomerProvider } from './contexts/CustomerContext';
import { useAgeGate } from './hooks/useAgeGate';
import { getUserState } from './utils/cookies';
import { priceTrackingService } from './services/priceTracking';
import RegisterPage from './pages/RegisterPage';

const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then(module => ({ default: module.ShopPage })));
const LearnPage = lazy(() => import('./pages/LearnPage').then(module => ({ default: module.LearnPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(module => ({ default: module.LegalPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(module => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(module => ({ default: module.TermsPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage').then(module => ({ default: module.OrderTrackingPage })));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService').then(module => ({ default: module.TermsOfService })));
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
const PasswordResetPage = lazy(() => import('./pages/PasswordResetPage').then(module => ({ default: module.PasswordResetPage })));

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [, setUserState] = useState<string>('');
  const [showStateBlocker, setShowStateBlocker] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [, setSearchOpen] = useState(false);
  const { isAgeVerified, showAgeGate, verifyAge } = useAgeGate();

  useEffect(() => {
    startTransition(() => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get('page');
      
      if (page === 'password-reset') {
        setCurrentPage('password-reset');
      } else if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/shop') {
        setCurrentPage('shop');
      } else if (path === '/learn') {
        setCurrentPage('learn');
      } else if (path === '/legal') {
        setCurrentPage('legal');
      } else if (path === '/privacy') {
        setCurrentPage('privacy');
      } else if (path === '/legal/privacy') {
        setCurrentPage('legal-privacy');
      } else if (path === '/terms') {
        setCurrentPage('terms');
      } else if (path === '/legal/terms') {
        setCurrentPage('legal-terms');
      } else if (path === '/reset-password') {
        setCurrentPage('reset-password');
      } else if (path === '/orders' || path === '/account/orders') {
        setCurrentPage('orders');
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
    });

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
            break;
          }
        }
        if (adaWidget) {
          const element = adaWidget as HTMLElement;
          element.style.removeProperty('left');
          element.removeAttribute('offscreen');

          // Mobile and Desktop positioning
          if (window.innerWidth <= 768) {
            element.style.top = '50%';
            element.style.right = '15px';
            element.style.left = 'auto';
            element.style.width = '50px';
            element.style.height = '50px';
          } else {
            element.style.top = '50%';
            element.style.right = '20px';
            element.style.left = 'auto';
            element.style.width = '60px';
            element.style.height = '60px';
          }
          element.style.bottom = 'auto';
          element.style.transform = 'translateY(-50%)';
          element.style.zIndex = '999999';
          element.style.position = 'fixed';
          element.style.display = 'block';
          element.style.visibility = 'visible';
          element.style.opacity = '1';
          element.style.borderRadius = '50%';
          element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          element.style.backgroundColor = '#6366f1';
          element.style.border = '2px solid #8b5cf6';
          element.style.margin = '0';
          element.style.padding = '0';

          // Accessibility: right-click to hide/show
          let isHidden = false;
          element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            isHidden = !isHidden;
            element.style.opacity = isHidden ? '0.3' : '1';
            element.style.pointerEvents = isHidden ? 'none' : 'auto';
          });
          element.title = 'Right-click to hide/show • Accessibility Widget';

          // Mutation observer to prevent forced left positioning
          const styleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const currentStyle = element.getAttribute('style') || '';
                if (currentStyle.includes('left:') && !currentStyle.includes('left: auto')) {
                  element.style.right = window.innerWidth <= 768 ? '15px' : '20px';
                  element.style.left = 'auto';
                }
              }
            });
          });
          styleObserver.observe(element, {
            attributes: true,
            attributeFilter: ['style']
          });

          // Interval to maintain right-side positioning
          const maintainPosition = () => {
            const currentStyle = element.getAttribute('style') || '';
            if (currentStyle.includes('left:') && !currentStyle.includes('left: auto')) {
              element.style.right = window.innerWidth <= 768 ? '15px' : '20px';
              element.style.left = 'auto';
            }
          };
          setInterval(maintainPosition, 1000);
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
      case 'privacy':
        return <PrivacyPage />;
      case 'legal-privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsPage />;
      case 'legal-terms':
        return <TermsOfService />;
      case 'reset-password':
        return <ResetPasswordPage />;
      case 'password-reset':
        return <PasswordResetPage onNavigate={setCurrentPage} />;
      case 'orders':
        return <OrderTrackingPage />;
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
            {/* Age gating modal (merged feature: use AgeGate) */}
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
                <ChatBot />
              </>
            )}
          </div>
          <ToastEventHandler />
          <Toaster />
        </AnalyticsProvider>
      </ErrorBoundary>
      <Toaster />
    </CustomerProvider>
  );
}

export default App;
