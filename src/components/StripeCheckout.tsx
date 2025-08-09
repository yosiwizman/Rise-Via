import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CreditCard, Lock, AlertTriangle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { orderService } from '../services/orderService';

const stripePromise = loadStripe((import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51placeholder');

interface CheckoutFormProps {
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onError, customerInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { items, getCartTotal, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found.');
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: {
            line1: customerInfo.address,
            city: customerInfo.city,
            state: customerInfo.state,
            postal_code: customerInfo.zipCode,
            country: 'US',
          },
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
        return;
      }

      const orderId = await createOrder();
      clearCart();
      onSuccess(orderId);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const createOrder = async (): Promise<string> => {
    const orderData = {
      customer_id: 'temp-customer-id',
      total: getCartTotal(),
      items: items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    };

    const order = await orderService.createOrder(orderData);
    if (!order) {
      throw new Error('Failed to create order');
    }
    return order.id;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-risevia-charcoal border-risevia-purple/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-950/20 border-blue-500/50">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-blue-400">
              Your payment information is secure and encrypted.
            </AlertDescription>
          </Alert>

          <div className="bg-risevia-black/50 rounded-lg p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                  },
                },
              }}
            />
          </div>

          <div className="flex justify-between items-center text-white">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-risevia-teal">
              ${getCartTotal().toFixed(2)}
            </span>
          </div>

          <Button
            type="submit"
            disabled={!stripe || processing}
            className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold py-3"
          >
            {processing ? 'Processing...' : `Pay $${getCartTotal().toFixed(2)}`}
          </Button>

          <Alert className="bg-yellow-950/20 border-yellow-500/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400 text-sm">
              Test Mode: Use card number 4242 4242 4242 4242 with any future expiry date and CVC.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </form>
  );
};

interface StripeCheckoutProps {
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({ onSuccess, onError, customerInfo }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm onSuccess={onSuccess} onError={onError} customerInfo={customerInfo} />
    </Elements>
  );
};
