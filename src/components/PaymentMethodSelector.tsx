import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CreditCard, Smartphone, Building, AlertTriangle, CheckCircle } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { useCart } from '../hooks/useCart';

interface PaymentMethodSelectorProps {
  onPaymentComplete: (result: { success: boolean; error?: string; orderNumber?: string; paymentMethod?: string; transactionId?: string }) => void;
  customerData: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  totalAmount: number;
}

export const PaymentMethodSelector = ({ onPaymentComplete, customerData, totalAmount }: PaymentMethodSelectorProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<typeof paymentMethods>([]);
  const { clearCart } = useCart();

  const paymentMethods = useMemo(() => [
    {
      id: 'posabit',
      name: 'POSaBIT',
      description: 'ACH Bank Transfer',
      icon: <Building className="w-6 h-6" />,
      processingTime: '1-3 business days',
      fee: '2.9%',
      cannabisCompliant: true
    },
    {
      id: 'aeropay',
      name: 'Aeropay',
      description: 'QR Code Payment',
      icon: <Smartphone className="w-6 h-6" />,
      processingTime: 'Instant',
      fee: '3.5%',
      cannabisCompliant: true
    },
    {
      id: 'hypur',
      name: 'Hypur',
      description: 'Direct Bank Payment',
      icon: <CreditCard className="w-6 h-6" />,
      processingTime: 'Instant',
      fee: '3.2%',
      cannabisCompliant: true
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Credit/Debit Card',
      icon: <CreditCard className="w-6 h-6" />,
      processingTime: 'Instant',
      fee: '2.9%',
      cannabisCompliant: false,
      note: 'CBD products only'
    }
  ], []);

  useEffect(() => {
    // Initialize payment methods
    const available = paymentMethods.filter(method => {
      // For now, show cannabis-compliant methods
      return method.cannabisCompliant;
    });
    
    setAvailableMethods(available);
    
    if (available.length > 0) {
      setSelectedMethod(available[0].id);
    };
  }, [paymentMethods]);

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    try {
      // Create order data for payment processing
      const orderData = {
        orderId: `RV-${Date.now()}`,
        amount: totalAmount,
        customerId: customerData.email,
        items: [] // TODO: Get cart items
      };
      
      const result = await paymentService.processPayment(orderData, selectedMethod);

      if (result.success) {
        clearCart();
        onPaymentComplete({
          ...result,
          orderNumber: `RV-${Date.now()}`,
          paymentMethod: selectedMethod
        });
      } else {
        onPaymentComplete(result);
      }
    } catch (error) {
      onPaymentComplete({
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (availableMethods.length === 0) {
    return (
      <Card className="bg-risevia-charcoal border-risevia-purple/20">
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              No payment methods are currently configured. Please contact support to complete your order.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-risevia-charcoal border-risevia-purple/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Select Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-950/20 border-blue-500/50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-blue-400">
            All payments are processed through cannabis-compliant payment providers with enhanced security.
          </AlertDescription>
        </Alert>

        {availableMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedMethod === method.id
                ? 'border-risevia-teal bg-risevia-teal/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-risevia-teal">{method.icon}</div>
                <div>
                  <h4 className="text-white font-medium flex items-center">
                    {method.name}
                    {method.cannabisCompliant && (
                      <Badge className="ml-2 bg-green-600 text-white text-xs">Cannabis Compliant</Badge>
                    )}
                  </h4>
                  <p className="text-gray-400 text-sm">{method.description}</p>
                  {method.note && (
                    <p className="text-yellow-400 text-xs mt-1">{method.note}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">{method.processingTime}</Badge>
                <p className="text-gray-400 text-xs mt-1">Fee: {method.fee}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 space-y-3">
          <div className="flex justify-between items-center text-white">
            <span>Subtotal:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-400 text-sm">
            <span>Processing Fee:</span>
            <span>
              {selectedMethod && availableMethods.find(m => m.id === selectedMethod)?.fee}
            </span>
          </div>
          
          <Button
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal text-white py-3"
          >
            {isProcessing ? 'Processing Payment...' : `Pay $${totalAmount.toFixed(2)}`}
          </Button>
          
          <p className="text-gray-400 text-xs text-center">
            By proceeding, you confirm you are 21+ and agree to our terms of service.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
