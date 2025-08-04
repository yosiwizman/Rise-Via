import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, FileSignature, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

export const ShippingInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
          <Alert className="bg-blue-950/20 border-blue-500/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-blue-400">
              All orders require adult signature upon delivery (21+)
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-risevia-teal" />
                <span className="text-white font-semibold">Preferred Carrier</span>
              </div>
              <p className="text-gray-300 text-sm">USPS Priority Mail with tracking</p>
              <Badge className="bg-risevia-teal text-white">Discreet Packaging</Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-risevia-teal" />
                <span className="text-white font-semibold">Processing Time</span>
              </div>
              <p className="text-gray-300 text-sm">1-3 business days</p>
              <p className="text-gray-400 text-xs">Orders placed before 2 PM EST ship same day</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileSignature className="w-4 h-4 text-risevia-teal" />
                <span className="text-white font-semibold">Signature Required</span>
              </div>
              <p className="text-gray-300 text-sm">Adult signature (21+) required for all deliveries</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-risevia-teal" />
                <span className="text-white font-semibold">Shipping Restrictions</span>
              </div>
              <p className="text-gray-300 text-sm">US domestic only</p>
              <p className="text-gray-400 text-xs">No international shipping available</p>
            </div>
          </div>
          
          <div className="bg-risevia-black/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Shipping Rates</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Standard (3-5 business days)</span>
                <span>$9.99</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Priority (2-3 business days)</span>
                <span>$14.99</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Express (1-2 business days)</span>
                <span>$24.99</span>
              </div>
              <div className="flex justify-between text-risevia-teal font-semibold">
                <span>Free shipping on orders $150+</span>
                <span>$0.00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
