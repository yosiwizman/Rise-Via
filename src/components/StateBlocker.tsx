import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { US_STATES } from '../utils/constants';
import { isStateBlocked, getBlockedStateMessage } from '../utils/stateBlocking';
import { getUserState, setUserState } from '../utils/cookies';

interface StateBlockerProps {
  onStateVerified: (state: string) => void;
}

export const StateBlocker = ({ onStateVerified }: StateBlockerProps) => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [showStateSelector, setShowStateSelector] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Only run once on mount
    if (isInitialized) return;
    
    const savedState = getUserState();
    if (savedState) {
      setSelectedState(savedState);
      const blocked = isStateBlocked(savedState);
      setIsBlocked(blocked);
      if (!blocked) {
        setShowStateSelector(false);
        // Use setTimeout to avoid potential synchronous state update issues
        setTimeout(() => {
          onStateVerified(savedState);
        }, 0);
      }
    }
    setIsInitialized(true);
  }, [isInitialized]); // Remove onStateVerified from dependencies

  const handleStateSelection = useCallback((state: string) => {
    setSelectedState(state);
    setUserState(state);
    const blocked = isStateBlocked(state);
    setIsBlocked(blocked);
    
    if (!blocked) {
      setShowStateSelector(false);
      // Use setTimeout to avoid potential synchronous state update issues
      setTimeout(() => {
        onStateVerified(state);
      }, 0);
    }
  }, [onStateVerified]);

  if (!showStateSelector && !isBlocked) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="max-w-md w-full bg-risevia-charcoal border-risevia-purple">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Select Your State
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-center text-sm">
            We need to verify your location to ensure compliance with local cannabis laws.
          </p>
          
          <Select value={selectedState} onValueChange={handleStateSelection}>
            <SelectTrigger className="w-full bg-risevia-black border-gray-600 text-white">
              <SelectValue placeholder="Choose your state..." />
            </SelectTrigger>
            <SelectContent className="bg-risevia-black border-gray-600">
              {US_STATES.map((state) => (
                <SelectItem 
                  key={state.code} 
                  value={state.code}
                  className="text-white hover:bg-risevia-charcoal"
                >
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isBlocked && selectedState && (
            <Alert className="compliance-warning border-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-white">
                {getBlockedStateMessage(selectedState)}
              </AlertDescription>
            </Alert>
          )}

          {isBlocked && (
            <div className="text-center space-y-3">
              <p className="text-gray-400 text-sm">
                You can still browse our educational content and learn about THCA.
              </p>
              <Button
                onClick={() => setShowStateSelector(false)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Continue Browsing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
