import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, CreditCard, Mail, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { SEOHead } from '../components/SEOHead';

interface OrderConfirmationPageProps {
  onNavigate: (page: string) => void;
}

export const OrderConfirmationPage = ({ onNavigate }: OrderConfirmationPageProps) => {
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    total: number;
    paymentMethod: string;
    transactionId: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      setOrderData(JSON.parse(lastOrder));
    }
  }, []);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-risevia-black py-8">
        <SEOHead
          title="Order Confirmation"
          description="Your order confirmation details"
          noIndex={true}
        />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Card className="bg-risevia-charcoal border-risevia-purple/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">No Order Found</h2>
              <p className="text-gray-300 mb-6">
                We couldn't find your order details. Please check your email for confirmation.
              </p>
              <Button
                onClick={() => onNavigate('home')}
                className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white"
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
        title="Order Confirmation"
        description="Your order has been successfully placed"
        noIndex={true}
      />
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">Order Confirmed!</h1>
          <p className="text-gray-300 text-lg">
            Thank you for your order. We'll send you updates as it's processed.
          </p>
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
                  <Package className="w-5 h-5 mr-2" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Order Number:</span>
                  <span className="text-white font-mono">{orderData.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Amount:</span>
                  <span className="text-white font-semibold">${(typeof orderData.total === 'number' ? orderData.total : parseFloat(orderData.total) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Payment Method:</span>
                  <Badge className="bg-risevia-teal text-white capitalize">
                    {orderData.paymentMethod}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Transaction ID:</span>
                  <span className="text-white font-mono text-sm">{orderData.transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Order Date:</span>
                  <span className="text-white">
                    {new Date(orderData.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-risevia-charcoal border-risevia-purple/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white">Payment Confirmed</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Your payment has been successfully processed through our secure cannabis-compliant payment system.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="bg-risevia-charcoal border-risevia-purple/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-risevia-teal rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Order Processing</h4>
                      <p className="text-gray-400 text-sm">
                        We'll verify your order and prepare it for shipment (1-2 business days)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Shipping</h4>
                      <p className="text-gray-400 text-sm">
                        Your order will be shipped with tracking information provided
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Delivery</h4>
                      <p className="text-gray-400 text-sm">
                        Adult signature (21+) required upon delivery
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-risevia-charcoal border-risevia-purple/20">
              <CardContent className="p-6">
                <h4 className="text-white font-medium mb-3">Need Help?</h4>
                <p className="text-gray-400 text-sm mb-4">
                  If you have any questions about your order, please don't hesitate to contact us.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    orders@risevia.com
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Package className="w-4 h-4 mr-2" />
                    1-800-RISEVIA
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => onNavigate('home')}
              variant="outline"
              className="w-full border-risevia-purple text-risevia-purple hover:bg-risevia-purple hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
