import { useState, useEffect, startTransition, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AgeGate } from './components/AgeGate';
import { StateBlocker } from './components/StateBlocker';
import { CookieConsentBanner } from './components/CookieConsent';
import { AnalyticsProvider } from './components/AnalyticsPlaceholder';
import { WishlistInitializer } from './components/wishlist/WishlistInitializer';
import MobileCartButton from './components/MobileCartButton';
import { ToastEventHandler } from './components/ToastEventHandler';
import { ChatBot } from './components/ChatBot';
import { Toaster } from './components/ui/sonner';
import { useAgeGate } from './hooks/useAgeGate';
import { getUserState } from './utils/cookies';
import { priceTrackingService } from './services/priceTracking';
import { blogScheduler } from './services/blogScheduler';
import { initializeTables } from './lib/database';
import { initializeAuth, cleanupAuth } from './lib/auth';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then(m => ({ default: m.ShopPage })));
const LearnPage = lazy(() => import('./pages/LearnPage').then(m => ({ default: m.LearnPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService').then(m => ({ default: m.TermsOfService })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const ShippingPage = lazy(() => import('./pages/ShippingPage').then(m => ({ default: m.ShippingPage })));
const LabResultsPage = lazy(() => import('./pages/LabResultsPage').then(m => ({ default: m.LabResultsPage })));
const CareersPage = lazy(() => import('./pages/CareersPage').then(m => ({ default: m.CareersPage })));
const WishlistPage = lazy(() => import('./components/wishlist/WishlistPage').then(m => ({ default: m.WishlistPage })));
const B2BPage = lazy(() => import('./pages/B2BPage').then(m => ({ default: m.B2BPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const HealthCheck = lazy(() => import('./components/HealthCheck').then(m => ({ default: m.HealthCheck })));

// Auth pages
const LoginForm = lazy(() => import('./components/auth/LoginForm').then(m => ({ default: m.LoginForm })));
const RegisterForm = lazy(() => import('./components/auth/RegisterForm').then(m => ({ default: m.RegisterForm })));
const ForgotPasswordForm = lazy(() => import('./components/auth/ForgotPasswordForm').then(m => ({ default: m.ForgotPasswordForm })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

// Layout wrapper component
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('home');
  const [, setSearchOpen] = useState(false);
  const { isAgeVerified } = useAgeGate();
  
  // Update currentPage based on location
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path === '/' || path === '/home') {
      setCurrentPage('home');
    } else if (path.startsWith('/shop')) {
      setCurrentPage('shop');
    } else if (path.startsWith('/learn')) {
      setCurrentPage('learn');
    } else if (path.startsWith('/blog')) {
      setCurrentPage('blog');
    } else if (path.startsWith('/wishlist')) {
      setCurrentPage('wishlist');
    } else if (path.startsWith('/account') || path.startsWith('/dashboard') || path.startsWith('/profile')) {
      setCurrentPage('account');
    } else if (path.startsWith('/admin')) {
      setCurrentPage('admin');
    } else {
      setCurrentPage(path.substring(1));
    }
  }, [location]);

  // Don't show navigation/footer on auth pages
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].some(
    path => location.pathname.startsWith(path)
  );

  if (!isAgeVerified || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        setSearchOpen={setSearchOpen}
      />
      <main>{children}</main>
      <Footer onNavigate={(page) => setCurrentPage(page)} />
      <MobileCartButton />
      <ChatBot />
    </>
  );
}

function App() {
  const [, setUserState] = useState<string>('');
  const [showStateBlocker, setShowStateBlocker] = useState(false);
  const { isAgeVerified, showAgeGate, verifyAge } = useAgeGate();
  
  // Use refs to store cleanup functions
  const cleanupFunctionsRef = useRef<{
    timers: NodeJS.Timeout[];
    intervals: NodeJS.Timeout[];
    observers: MutationObserver[];
    listeners: Array<{ element: Element | Document | Window; event: string; handler: EventListener }>;
  }>({
    timers: [],
    intervals: [],
    observers: [],
    listeners: []
  });

  useEffect(() => {
    const savedState = getUserState();
    if (savedState) {
      setUserState(savedState);
    } else {
      setShowStateBlocker(true);
    }

    const initializeApp = async () => {
      try {
        console.log('🔧 Initializing application...');
        
        // Initialize auth system
        initializeAuth();
        
        // Initialize database tables
        const success = await initializeTables();
        if (success) {
          console.log('✅ Database tables initialized successfully');
        } else {
          console.error('❌ Database initialization failed');
        }
      } catch (error) {
        console.error('❌ Application initialization error:', error);
      }
      
      priceTrackingService.startPriceTracking();
      blogScheduler.start();
    };
    
    initializeApp();

    // UserWay accessibility widget setup with proper cleanup
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
          const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            isHidden = !isHidden;
            element.style.opacity = isHidden ? '0.3' : '1';
            element.style.pointerEvents = isHidden ? 'none' : 'auto';
          };
          
          element.addEventListener('contextmenu', handleContextMenu);
          cleanupFunctionsRef.current.listeners.push({
            element,
            event: 'contextmenu',
            handler: handleContextMenu as EventListener
          });
          
          element.title = 'Right-click to hide/show • Accessibility Widget';
        }
      };

      // Initial positioning with delays
      const timer1 = setTimeout(positionWidget, 500);
      const timer2 = setTimeout(positionWidget, 1500);
      const timer3 = setTimeout(positionWidget, 3000);
      
      cleanupFunctionsRef.current.timers.push(timer1, timer2, timer3);

      // Resize handler
      const handleResize = () => positionWidget();
      window.addEventListener('resize', handleResize);
      cleanupFunctionsRef.current.listeners.push({
        element: window,
        event: 'resize',
        handler: handleResize as EventListener
      });

      // Add hide button after widget loads
      const timer4 = setTimeout(addUserWayHideButton, 2000);
      cleanupFunctionsRef.current.timers.push(timer4);
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

    // Cleanup function
    return () => {
      // Stop services
      priceTrackingService.stopPriceTracking();
      blogScheduler.stop();
      cleanupAuth();
      
      // Clear all timers
      cleanupFunctionsRef.current.timers.forEach(timer => clearTimeout(timer));
      
      // Clear all intervals
      cleanupFunctionsRef.current.intervals.forEach(interval => clearInterval(interval));
      
      // Disconnect all observers
      cleanupFunctionsRef.current.observers.forEach(observer => observer.disconnect());
      
      // Remove all event listeners
      cleanupFunctionsRef.current.listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      
      // Remove script if it exists
      const scriptElement = document.querySelector('script[src*="userway.org"]');
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, []);

  const handleStateVerified = (state: string) => {
    setUserState(state);
    setShowStateBlocker(false);
  };

  return (
    <CustomerProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AnalyticsProvider>
            <Router>
              <div className="min-h-screen bg-risevia-black text-white">
                {/* Age gating modal */}
                <AgeGate isOpen={showAgeGate} onVerify={verifyAge} />
                {showStateBlocker && (
                  <StateBlocker onStateVerified={handleState} />
                )}

                {isAgeVerified && (
                  <>
                    <WishlistInitializer />
                    <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
                      <AppLayout>
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/" element={<HomePage onNavigate={() => {}} />} />
                          <Route path="/shop" element={<ShopPage />} />
                          <Route path="/learn" element={<LearnPage />} />
                          <Route path="/legal" element={<LegalPage />} />
                          <Route path="/privacy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsOfService />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/shipping" element={<ShippingPage />} />
                          <Route path="/lab-results" element={<LabResultsPage />} />
                          <Route path="/careers" element={<CareersPage />} />
                          <Route path="/b2b" element={<B2BPage />} />
                          <Route path="/blog" element={<BlogPage onNavigate={() => {}} />} />
                          <Route path="/blog/:slug" element={<BlogPostPage slug="" onNavigate={() => {}} />} />
                          <Route path="/health" element={<HealthCheck />} />
                          
                          {/* Auth Routes */}
                          <Route path="/login" element={<LoginForm />} />
                          <Route path="/register" element={<RegisterForm />} />
                          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                          <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
                          <Route path="/unauthorized" element={<UnauthorizedPage />} />
                          
                          {/* Protected Routes - Customer */}
                          <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute>
                                <Dashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <UserProfile />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/wishlist"
                            element={
                              <ProtectedRoute>
                                <WishlistPage onNavigate={() => {}} />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/checkout"
                            element={
                              <ProtectedRoute>
                                <CheckoutPage onNavigate={() => {}} isStateBlocked={false} />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/orders"
                            element={
                              <ProtectedRoute>
                                <OrderTrackingPage />
                              </ProtectedRoute>
                            }
                          />
                          
                          {/* Protected Routes - Admin */}
                          <Route
                            path="/admin/*"
                            element={
                              <ProtectedRoute requireAdmin>
                                <AdminDashboard />
                              </ProtectedRoute>
                            }
                          />
                          
                          {/* Catch all - 404 */}
                          <Route path="*" element={<NotFoundPage onNavigate={() => {}} />} />
                        </Routes>
                      </AppLayout>
                    </Suspense>
                    <CookieConsentBanner />
                  </>
                )}
              </div>
              <ToastEventHandler />
              <Toaster />
            </Router>
          </AnalyticsProvider>
        </AuthProvider>
      </ErrorBoundary>
    </CustomerProvider>
  );
}

export default App;
