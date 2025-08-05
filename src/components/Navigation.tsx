import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, ShoppingBag, User, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navigation = ({ currentPage, onNavigate }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'learn', label: 'Learn' },
    { id: 'legal', label: 'Legal' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
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
              onClick={() => handleNavigation('home')}
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
                  onClick={() => handleNavigation(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'text-risevia-teal bg-risevia-teal/10'
                      : 'text-risevia-charcoal hover:text-risevia-purple hover:bg-purple-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-risevia-charcoal hover:text-risevia-purple">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-risevia-charcoal hover:text-risevia-purple">
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-risevia-charcoal hover:text-risevia-purple">
              <ShoppingBag className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-risevia-charcoal">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-gray-200">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`text-left px-4 py-3 rounded-lg text-lg font-medium transition-all ${
                        currentPage === item.id
                          ? 'text-risevia-teal bg-risevia-teal/10'
                          : 'text-risevia-charcoal hover:text-risevia-purple hover:bg-purple-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-risevia-charcoal hover:text-risevia-purple">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-risevia-charcoal hover:text-risevia-purple">
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-risevia-charcoal hover:text-risevia-purple">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Cart
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
