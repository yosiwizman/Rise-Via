import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { orderService } from '../../services/orderService';

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  total: number;
  status: string;
  payment_status: string;
  fulfillment_type: string;
  created_at: string;
  customers?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  order_items?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    products?: {
      name: string;
      sku: string;
    };
  }>;
}

export const OrderManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customers?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${order.customers?.first_name} ${order.customers?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
      case 'preparing':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered':
        return <Truck className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-200 text-green-900';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-risevia-purple border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Order Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders by number, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Order #</th>
                    <th className="text-left p-3">Customer</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Payment</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{order.order_number}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">
                            {order.customers?.first_name} {order.customers?.last_name}
                          </div>
                          <div className="text-sm text-gray-600">{order.customers?.email}</div>
                        </div>
                      </td>
                      <td className="p-3 font-medium">${order.total.toFixed(2)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.fulfillment_type === 'delivery' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.fulfillment_type.charAt(0).toUpperCase() + order.fulfillment_type.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              className="text-xs px-2 py-1 border rounded"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Details - {selectedOrder.order_number}</span>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {selectedOrder.customers?.first_name} {selectedOrder.customers?.last_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customers?.email}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Order Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Payment:</strong> {selectedOrder.payment_status}</p>
                  <p><strong>Type:</strong> {selectedOrder.fulfillment_type}</p>
                </div>
              </div>
            </div>
            
            {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 border">Product</th>
                        <th className="text-left p-2 border">Quantity</th>
                        <th className="text-left p-2 border">Price</th>
                        <th className="text-left p-2 border">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2 border">{item.name}</td>
                          <td className="p-2 border">{item.quantity}</td>
                          <td className="p-2 border">${item.price.toFixed(2)}</td>
                          <td className="p-2 border">${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
