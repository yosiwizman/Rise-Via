import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface AgeGateProps {
  isOpen: boolean;
  onVerify: (isOver21: boolean) => void;
}

export const AgeGate = ({ isOpen, onVerify }: AgeGateProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = async (isOver21: boolean) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
    onVerify(isOver21);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto bg-risevia-black border-risevia-purple">
        <DialogTitle className="sr-only">Age Verification Required</DialogTitle>
        <DialogDescription className="sr-only">
          You must be 21 years or older to access this website and purchase cannabis products.
        </DialogDescription>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 bg-transparent">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">21+</span>
              </div>
              <CardTitle className="text-2xl font-bold gradient-text">
                Age Verification Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-gray-300">
                <p className="mb-4">
                  You must be 21 years or older to access this website and purchase cannabis products.
                </p>
                <p className="text-sm text-gray-400">
                  By entering this site, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleVerification(true)}
                  disabled={isLoading}
                  className="w-full neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold py-3 rounded-2xl"
                >
                  {isLoading ? 'Verifying...' : 'I am 21 or older'}
                </Button>
                
                <Button
                  onClick={() => handleVerification(false)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 py-3 rounded-2xl"
                >
                  I am under 21
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                <p>This website uses cookies to ensure you get the best experience.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
