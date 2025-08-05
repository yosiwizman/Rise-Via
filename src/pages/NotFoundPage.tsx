import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Search, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { SEOHead } from '../components/SEOHead';
import { getUserState } from '../utils/cookies';
import { isStateBlocked } from '../utils/stateBlocking';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const userState = getUserState();
  const isBlocked = userState ? isStateBlocked(userState) : false;

  return (
    <div className="min-h-screen bg-risevia-black flex items-center justify-center px-4">
      <SEOHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to RiseViA's homepage to explore our premium THCA products."
        noIndex={true}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <Card className="bg-risevia-charcoal border-risevia-purple/20">
          <CardContent className="p-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-6"
            >
              <p className="text-gray-300 text-lg leading-relaxed">
                The page you're looking for doesn't exist or may have been moved. 
                Let's get you back to exploring our premium THCA products.
              </p>

              {isBlocked && (
                <div className="bg-red-950/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-400 text-sm">
                    ⚠️ Note: Some content may be restricted in your state ({userState}) due to local cannabis regulations.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  size="lg"
                  className="neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Return Home
                </Button>
                
                <Button
                  onClick={() => navigate('/shop')}
                  size="lg"
                  variant="outline"
                  className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Browse Strains
                </Button>
              </div>

              <div className="pt-6 border-t border-risevia-purple/20">
                <p className="text-gray-400 text-sm mb-4">Popular pages:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { id: 'learn', label: 'Learn About THCA', path: '/learn' },
                    { id: 'legal', label: 'Legal & Compliance', path: '/legal' },
                    { id: 'contact', label: 'Contact Us', path: '/contact' }
                  ].map((link) => (
                    <button
                      key={link.id}
                      onClick={() => navigate(link.path)}
                      className="text-risevia-teal hover:text-white text-sm underline transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
