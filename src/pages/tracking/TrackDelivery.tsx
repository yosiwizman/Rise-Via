import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle,
  Circle,
  Phone,
  MessageSquare,
  RefreshCw,
  Navigation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { deliveryService } from '../../services/tracking/DeliveryService';
import { DeliveryMap } from '../../components/delivery/DeliveryMap';
import { toast } from 'sonner';

interface TrackingInfo {
  routeNumber: string;
  driverName: string;
  status: string;
  routeStatus: string;
  stopNumber: number;
  totalStops: number;
  completedStops: number;
  plannedArrival?: string;
  actualArrival?: string;
  deliveryAddress: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  deliveryLocation?: {
    latitude: number;
    longitude: number;
  };
  signatureUrl?: string;
  photoUrls?: string[];
  estimatedArrival?: Date;
  lastUpdated?: Date;
}

export const TrackDelivery: React.FC = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const trackingCode = searchParams.get('code');
  
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [orderIdInput, setOrderIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (orderId || trackingCode) {
      loadTrackingInfo(orderId || trackingCode || '');
    }

    // Auto-refresh every 30 seconds
    let interval: NodeJS.Timeout;
    if (autoRefresh && trackingInfo) {
      interval = setInterval(() => {
        loadTrackingInfo(orderId || trackingCode || orderIdInput);
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId, trackingCode, autoRefresh]);

  const loadTrackingInfo = async (id: string) => {
    if (!id) return;

    setLoading(true);
    try {
      const info = await deliveryService.getDeliveryTracking(id);
      if (info) {
        setTrackingInfo({
          ...info,
          estimatedArrival: calculateEstimatedArrival(info),
          lastUpdated: new Date()
        });
        setShowMap(true);
      } else {
        toast.error('No tracking information found');
      }
    } catch (error) {
      console.error('Error loading tracking info:', error);
      toast.error('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedArrival = (info: any): Date => {
    if (info.plannedArrival) {
      return new Date(info.plannedArrival);
    }
    
    // Estimate based on remaining stops
    const remainingStops = info.totalStops - info.completedStops;
    const minutesPerStop = 15;
    const estimatedMinutes = remainingStops * minutesPerStop;
    
    const arrival = new Date();
    arrival.setMinutes(arrival.getMinutes() + estimatedMinutes);
    return arrival;
  };

  const handleTrackOrder = () => {
    if (orderIdInput) {
      loadTrackingInfo(orderIdInput);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'arrived': return 'text-blue-600';
      case 'in_progress': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDeliverySteps = () => {
    const steps = [
      { 
        label: 'Order Confirmed', 
        completed: true,
        icon: CheckCircle
      },
      { 
        label: 'Out for Delivery', 
        completed: trackingInfo?.routeStatus === 'in_progress',
        icon: Truck
      },
      { 
        label: 'Arriving Soon', 
        completed: trackingInfo?.status === 'arrived',
        icon: Navigation
      },
      { 
        label: 'Delivered', 
        completed: trackingInfo?.status === 'completed',
        icon: Package
      }
    ];

    return steps;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Delivery</h1>
          <p className="text-gray-600">Real-time updates on your order status</p>
        </motion.div>

        {/* Track Order Input */}
        {!orderId && !trackingCode && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter your order ID or tracking code"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                  className="flex-1"
                />
                <Button onClick={handleTrackOrder} disabled={loading}>
                  {loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="w-4 h-4 mr-2" />
                  )}
                  Track Order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tracking Information */}
        {trackingInfo && (
          <>
            {/* Delivery Progress */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Delivery Progress</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={autoRefresh ? 'default' : 'outline'}>
                      <RefreshCw className={`w-3 h-3 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                      {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                      Toggle
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress Steps */}
                  <div className="relative">
                    <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                    {getDeliverySteps().map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex items-center mb-8 last:mb-0"
                        >
                          <div className={`
                            z-10 w-16 h-16 rounded-full flex items-center justify-center
                            ${step.completed 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-400'
                            }
                          `}>
                            <Icon className="w-8 h-8" />
                          </div>
                          <div className="ml-6">
                            <p className={`font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                              {step.label}
                            </p>
                            {step.completed && index === 1 && trackingInfo.driverName && (
                              <p className="text-sm text-gray-600 mt-1">
                                Driver: {trackingInfo.driverName}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Delivery Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {trackingInfo.stopNumber}
                      </p>
                      <p className="text-sm text-gray-600">Your Stop Number</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {trackingInfo.completedStops}/{trackingInfo.totalStops}
                      </p>
                      <p className="text-sm text-gray-600">Stops Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {trackingInfo.estimatedArrival?.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">Estimated Arrival</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Route Number</p>
                      <p className="font-semibold">{trackingInfo.routeNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Driver</p>
                      <p className="font-semibold">{trackingInfo.driverName || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="font-semibold">{trackingInfo.deliveryAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={getStatusColor(trackingInfo.status)}>
                        {trackingInfo.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    {trackingInfo.lastUpdated && (
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-semibold">
                          {trackingInfo.lastUpdated.toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Estimated Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingInfo.plannedArrival && (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          Scheduled delivery: {new Date(trackingInfo.plannedArrival).toLocaleString()}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {trackingInfo.routeStatus === 'in_progress' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Delivery Progress</p>
                        <Progress 
                          value={(trackingInfo.completedStops / trackingInfo.totalStops) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round((trackingInfo.completedStops / trackingInfo.totalStops) * 100)}% complete
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Driver
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Map */}
            {showMap && trackingInfo.routeStatus === 'in_progress' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Live Tracking Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] relative">
                    {/* This would show a simplified version of the delivery map */}
                    <div className="absolute inset-0 bg-gray-100 rounded-b-lg flex items-center justify-center">
                      <div className="text-center">
                        <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Live map tracking</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Driver location updates every 30 seconds
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Proof of Delivery */}
            {trackingInfo.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Proof of Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your order was successfully delivered on {
                        trackingInfo.actualArrival 
                          ? new Date(trackingInfo.actualArrival).toLocaleString()
                          : 'N/A'
                      }
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trackingInfo.signatureUrl && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Signature</p>
                        <img 
                          src={trackingInfo.signatureUrl} 
                          alt="Signature" 
                          className="border rounded-lg"
                        />
                      </div>
                    )}
                    {trackingInfo.photoUrls && trackingInfo.photoUrls.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Delivery Photos</p>
                        <div className="grid grid-cols-2 gap-2">
                          {trackingInfo.photoUrls.map((url, index) => (
                            <img 
                              key={index}
                              src={url} 
                              alt={`Delivery ${index + 1}`} 
                              className="border rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
