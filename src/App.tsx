import { useState, useEffect, startTransition } from 'react';
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
import { blogScheduler } from './services/blogScheduler';
import RegisterPage from './pages/RegisterPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { LearnPage } from './pages/LearnPage';
import { LegalPage } from './pages/LegalPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsOfService } from './pages/legal/TermsOfService';
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
import { B2BPage } from './pages/B2BPage';
import { HealthCheck } from './components/HealthCheck';
import { PasswordResetPage } from './pages/PasswordResetPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [blogSlug, setBlogSlug] = useState<string>('');
  const [, setUserState] = useState<string>('');
  const [showStateBlocker, setShowStateBlocker] = useState(false);
  const [, setSearchOpen] = useState(false);
  const { isAgeVerified, showAgeGate, verifyAge } = useAgeGate();

  useEffect(() => {
    startTransition(() => {
      const path = (window.location.pathname || '/').toLowerCase();
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get('page');

      if (page === 'password-reset') {
        setCurrentPage('password-reset');
      } else if (path === '/' || path === '/home') {
        setCurrentPage('home');
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
      } else if (path === '/blog') {
        setCurrentPage('blog');
      } else if (path && typeof path === 'string' && path.startsWith('/blog/')) {
        const slug = path.replace('/blog/', '');
        setBlogSlug(slug);
        setCurrentPage('blog-post');
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
    blogScheduler.start();

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
            break;
          }
        }
        if (adaWidget) {
          const element = adaWidget as HTMLElement;
          if (!element || !element.style) {
            console.warn('⚠️ UserWay widget element not properly initialized');
            return;
          }
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
                if (!element || !element.style) return;
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
            if (!element || !element.style) return;
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
      blogScheduler.stop();
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
      case 'blog':
        return <BlogPage onNavigate={(page: string, _productId?: string, slug?: string) => {
          if (page === 'blog-post' && slug) {
            setBlogSlug(slug);
            setCurrentPage('blog-post');
            window.history.pushState({}, '', `/blog/${slug}`);
          } else {
            setCurrentPage(page);
          }
        }} />;
      case 'blog-post':
        return <BlogPostPage slug={blogSlug} onNavigate={(page: string) => {
          setCurrentPage(page);
          if (page === 'blog') {
            window.history.pushState({}, '', '/blog');
          }
        }} />;
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
