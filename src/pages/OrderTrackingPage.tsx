import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, MapPin, Search } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export const OrderTrackingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'RV-2024-001',
          status: 'shipped',
          items: [
            { name: 'Premium THCA Flower - Blue Dream', quantity: 1, price: 45.99 },
            { name: 'THCA Pre-Rolls - Sativa Blend', quantity: 2, price: 24.99 }
          ],
          total: 95.97,
          orderDate: '2024-08-05',
          estimatedDelivery: '2024-08-10',
          trackingNumber: 'RV123456789',
          shippingAddress: {
            street: '123 Main St',
            city: 'Denver',
            state: 'CO',
            zip: '80202'
          }
        },
        {
          id: '2',
          orderNumber: 'RV-2024-002',
          status: 'processing',
          items: [
            { name: 'THCA Gummies - Mixed Berry', quantity: 1, price: 32.99 }
          ],
          total: 32.99,
          orderDate: '2024-08-07',
          estimatedDelivery: '2024-08-12',
          shippingAddress: {
            street: '456 Oak Ave',
            city: 'Boulder',
            state: 'CO',
            zip: '80301'
          }
        }
      ];
      
      setOrders(mockOrders);
      setIsLoading(false);
    };

    loadOrders();
  }, []);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <Package className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'shipped':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'delivered':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'cancelled':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-risevia-black text-white py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-risevia-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-risevia-black text-white py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-risevia-purple to-risevia-green rounded-full">
              <Package className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Order Tracking</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track your RiseViA orders and stay updated on delivery status
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number or tracking number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-risevia-purple focus:border-transparent"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-gray-400">
                {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t placed any orders yet'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="flex items-center gap-4 mb-4 lg:mb-0">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-xl font-semibold">{order.orderNumber}</h3>
                      <p className="text-gray-400">Ordered on {new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
                    <span className="font-semibold capitalize">{order.status}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-300">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>${(typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-700 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${(typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-gray-300">Shipping Information</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-risevia-purple" />
                        <div>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                        </div>
                      </div>
                      {order.estimatedDelivery && (
                        <p className="text-risevia-green">
                          Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </p>
                      )}
                      {order.trackingNumber && (
                        <p className="text-risevia-purple">
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {order.status === 'shipped' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-blue-500">Package in Transit</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Your order is on its way! Track your package using the tracking number above.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <p className="text-gray-300 mb-4">
              If you have questions about your order or need assistance, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-gradient-to-r from-risevia-purple to-risevia-green text-white py-2 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Contact Support
              </a>
              <a
                href="/shipping"
                className="border border-gray-600 text-gray-300 py-2 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Shipping Info
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
