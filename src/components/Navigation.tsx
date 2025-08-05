import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, ShoppingBag, User, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { useAppStore } from '../store';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    mobileMenuOpen, 
    toggleMobileMenu, 
    toggleCart, 
    toggleSearch,
    cartItems 
  } = useAppStore();

  const navItems = [
    { id: '/', label: 'Home', path: '/' },
    { id: 'shop', label: 'Shop', path: '/shop' },
    { id: 'learn', label: 'Learn', path: '/learn' },
    { id: 'legal', label: 'Legal', path: '/legal' },
    { id: 'contact', label: 'Contact', path: '/contact' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    toggleMobileMenu();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavigation('/')}
              className="hover:scale-105 transition-transform"
            >
              <div className="w-16 h-16">
                <img 
                  src="/risevia-logo.png" 
                  alt="RiseViA Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'text-risevia-teal bg-risevia-teal/10'
                      : 'text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple hover:bg-purple-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple" onClick={toggleSearch}>
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple">
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple relative" onClick={toggleCart}>
              <ShoppingBag className="w-4 h-4" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-risevia-teal text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={toggleMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-risevia-charcoal dark:text-gray-300">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-gray-200">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className={`text-left px-4 py-3 rounded-lg text-lg font-medium transition-all ${
                        location.pathname === item.path
                          ? 'text-risevia-teal bg-risevia-teal/10'
                          : 'text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple hover:bg-purple-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple" onClick={toggleSearch}>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple">
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple relative" onClick={toggleCart}>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Cart
                      {cartItems.length > 0 && (
                        <span className="absolute top-1 right-4 bg-risevia-teal text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItems.length}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
