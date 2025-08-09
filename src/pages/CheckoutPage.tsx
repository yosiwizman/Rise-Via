import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Truck, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { SEOHead } from '../components/SEOHead';
import { ProductWarnings } from '../components/ProductWarnings';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';
import { ShippingInfo } from '../components/ShippingInfo';
import { useCart } from '../hooks/useCart';

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
  isStateBlocked: boolean;
}

export const CheckoutPage = ({ onNavigate, isStateBlocked }: CheckoutPageProps) => {
  const { getCartTotal } = useCart();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [agreements, setAgreements] = useState({
    ageVerification: false,
    signatureRequired: false,
    termsAccepted: false
  });
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [orderSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAgreementChange = (key: string, checked: boolean) => {
    setAgreements(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const isFormValid = () => {
    const requiredFields = Object.values(formData).every(field => field.trim() !== '');
    const allAgreements = Object.values(agreements).every(agreement => agreement);
    return requiredFields && allAgreements && !isStateBlocked;
  };

  if (isStateBlocked) {
    return (
      <div className="min-h-screen bg-risevia-black py-8">
        <SEOHead
          title="Checkout"
          description="Complete your RiseViA order"
          noIndex={true}
        />
        <div className="max-w-4xl mx-auto px-4">
          <Card className="bg-risevia-charcoal border-red-500">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold text-white mb-4">Checkout Not Available</h2>
              <p className="text-gray-300 mb-6">
                We cannot process orders for your state due to local cannabis regulations.
              </p>
              <Button
                onClick={() => onNavigate('home')}
                className="bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
              >
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-risevia-black py-8">
      <SEOHead
        title="Secure Checkout"
        description="Complete your RiseViA order with secure, compliant checkout process"
        noIndex={true}
      />
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">Secure Checkout</h1>
          <p className="text-gray-300">Complete your order with confidence</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="bg-risevia-charcoal border-risevia-purple/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-risevia-black border-risevia-purple/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-risevia-black border-risevia-purple/30 text-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-risevia-black border-risevia-purple/30 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-gray-300">Street Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-risevia-black border-risevia-purple/30 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-gray-300">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="bg-risevia-black border-risevia-purple/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-gray-300">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="bg-risevia-black border-risevia-purple/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-gray-300">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="bg-risevia-black border-risevia-purple/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-risevia-black border-risevia-purple/30 text-white"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-risevia-charcoal border-risevia-purple/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Required Agreements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="ageVerification"
                    checked={agreements.ageVerification}
                    onCheckedChange={(checked) => handleAgreementChange('ageVerification', checked as boolean)}
                    className="border-risevia-purple data-[state=checked]:bg-risevia-teal"
                  />
                  <Label htmlFor="ageVerification" className="text-gray-300 text-sm leading-relaxed">
                    I confirm that I am 21 years of age or older and legally allowed to purchase cannabis products in my state.
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="signatureRequired"
                    checked={agreements.signatureRequired}
                    onCheckedChange={(checked) => handleAgreementChange('signatureRequired', checked as boolean)}
                    className="border-risevia-purple data-[state=checked]:bg-risevia-teal"
                  />
                  <Label htmlFor="signatureRequired" className="text-gray-300 text-sm leading-relaxed">
                    I understand that adult signature (21+) is required upon delivery and someone will need to be present to sign for the package.
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="termsAccepted"
                    checked={agreements.termsAccepted}
                    onCheckedChange={(checked) => handleAgreementChange('termsAccepted', checked as boolean)}
                    className="border-risevia-purple data-[state=checked]:bg-risevia-teal"
                  />
                  <Label htmlFor="termsAccepted" className="text-gray-300 text-sm leading-relaxed">
                    I have read and agree to the Terms and Conditions and Privacy Policy.
                  </Label>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <ProductWarnings placement="checkout" />
            
            <ShippingInfo />

            {!showPaymentOptions ? (
              <Card className="bg-risevia-charcoal border-risevia-purple/20">
                <CardContent className="p-6 text-center">
                  <Button
                    onClick={() => setShowPaymentOptions(true)}
                    disabled={!isFormValid()}
                    className="w-full neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Continue to Payment
                  </Button>
                  {!isFormValid() && (
                    <p className="text-gray-400 text-sm mt-2">
                      Please complete all required fields and agreements
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : orderSuccess ? (
              <Card className="bg-risevia-charcoal border-green-500/50">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-2xl font-bold text-white mb-4">Order Confirmed!</h3>
                  <p className="text-gray-300 mb-4">
                    Your order has been successfully placed. Order ID: {orderSuccess}
                  </p>
                  <Button
                    onClick={() => onNavigate('home')}
                    className="bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <PaymentMethodSelector 
                onPaymentComplete={(result) => {
                  if (result.success) {
                    localStorage.setItem('lastOrder', JSON.stringify({
                      orderNumber: result.orderNumber,
                      total: getCartTotal(),
                      paymentMethod: result.paymentMethod,
                      transactionId: result.transactionId,
                      timestamp: new Date().toISOString()
                    }));
                    onNavigate('order-confirmation');
                  } else {
                    alert('Payment failed: ' + result.error);
                    setShowPaymentOptions(false);
                  }
                }}
                customerData={formData}
                totalAmount={getCartTotal()}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
