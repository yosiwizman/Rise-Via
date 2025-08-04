import { motion } from 'framer-motion';
import { CreditCard, Phone, Mail, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface PaymentPlaceholderProps {
  onContactForPayment: () => void;
}

export const PaymentPlaceholder = ({ onContactForPayment }: PaymentPlaceholderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-risevia-charcoal border-risevia-purple/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-yellow-950/20 border-yellow-500/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              Due to cannabis industry regulations, we use specialized high-risk payment processing.
            </AlertDescription>
          </Alert>
          
          <div className="bg-risevia-black/50 rounded-lg p-4 space-y-3">
            <h4 className="text-white font-semibold">Payment processing through:</h4>
            <p className="text-risevia-teal font-medium">[High-Risk Processor Integration Pending]</p>
            <p className="text-gray-300 text-sm">
              Secure payment processing specifically designed for cannabis commerce
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Available Payment Methods:</h4>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• ACH Bank Transfer</li>
              <li>• Cryptocurrency (Bitcoin, Ethereum)</li>
              <li>• Money Order</li>
              <li>• Wire Transfer</li>
            </ul>
          </div>
          
          <Button
            onClick={onContactForPayment}
            className="w-full neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            Contact for Payment Options
          </Button>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              1-800-RISEVIA
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              orders@risevia.com
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
