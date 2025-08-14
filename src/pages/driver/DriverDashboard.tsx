import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Navigation,
  Camera,
  Signature,
  AlertTriangle,
  Battery,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { deliveryService, DeliveryRoute, DeliveryStop } from '../../services/tracking/DeliveryService';
import { locationTrackingService } from '../../services/tracking/LocationTrackingService';
import { DeliveryMap } from '../../components/delivery/DeliveryMap';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface RouteStats {
  totalStops: number;
  completedStops: number;
  failedStops: number;
  remainingStops: number;
  estimatedTimeRemaining: number;
  distanceTraveled: number;
  distanceRemaining: number;
}

export const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeRoute, setActiveRoute] = useState<DeliveryRoute | null>(null);
  const [routeStops, setRouteStops] = useState<DeliveryStop[]>([]);
  const [currentStop, setCurrentStop] = useState<DeliveryStop | null>(null);
  const [routeStats, setRouteStats] = useState<RouteStats | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showMap, setShowMap] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadActiveRoute();
      checkBatteryLevel();
      setupNetworkListener();
    }

    return () => {
      if (isTracking) {
        locationTrackingService.stopTracking();
      }
    };
  }, [user]);

  const loadActiveRoute = async () => {
    try {
      const routes = await deliveryService.getActiveRoutesForDriver(user!.id);
      if (routes.length > 0) {
        const route = routes[0];
        setActiveRoute(route);
        
        const stops = await deliveryService.getRouteStops(route.id);
        setRouteStops(stops);
        
        // Find current stop
        const nextStop = stops.find(s => s.status === 'pending' || s.status === 'arrived');
        setCurrentStop(nextStop || null);
        
        // Calculate stats
        calculateRouteStats(route, stops);
      }
    } catch (error) {
      console.error('Error loading route:', error);
      toast.error('Failed to load route');
    }
  };

  const calculateRouteStats = (route: DeliveryRoute, stops: DeliveryStop[]) => {
    const completed = stops.filter(s => s.status === 'completed').length;
    const failed = stops.filter(s => s.status === 'failed').length;
    const remaining = stops.filter(s => s.status === 'pending' || s.status === 'arrived').length;
    
    setRouteStats({
      totalStops: stops.length,
      completedStops: completed,
      failedStops: failed,
      remainingStops: remaining,
      estimatedTimeRemaining: remaining * 15, // 15 minutes per stop estimate
      distanceTraveled: route.actualDistanceMiles || 0,
      distanceRemaining: (route.totalDistanceMiles || 0) - (route.actualDistanceMiles || 0)
    });
  };

  const startRoute = async () => {
    if (!activeRoute) return;

    try {
      await deliveryService.startRoute(activeRoute.id);
      setIsTracking(true);
      toast.success('Route started - GPS tracking enabled');
      loadActiveRoute();
    } catch (error) {
      console.error('Error starting route:', error);
      toast.error('Failed to start route');
    }
  };

  const completeStop = async (stopId: string) => {
    try {
      // In a real app, you would capture signature and photos here
      await deliveryService.completeStop(stopId, {
        notes: 'Delivered successfully',
        temperatureAtDelivery: 68 // Mock temperature
      });
      
      toast.success('Stop completed');
      loadActiveRoute();
    } catch (error) {
      console.error('Error completing stop:', error);
      toast.error('Failed to complete stop');
    }
  };

  const failStop = async (stopId: string, reason: string) => {
    try {
      await deliveryService.failStop(stopId, reason);
      toast.warning('Stop marked as failed');
      loadActiveRoute();
    } catch (error) {
      console.error('Error failing stop:', error);
      toast.error('Failed to update stop');
    }
  };

  const completeRoute = async () => {
    if (!activeRoute) return;

    try {
      await deliveryService.completeRoute(activeRoute.id);
      setIsTracking(false);
      toast.success('Route completed');
      setActiveRoute(null);
      setRouteStops([]);
      setCurrentStop(null);
    } catch (error) {
      console.error('Error completing route:', error);
      toast.error('Failed to complete route');
    }
  };

  const checkBatteryLevel = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      } catch (error) {
        console.error('Battery API not available');
      }
    }
  };

  const setupNetworkListener = () => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const getStopStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'arrived': return 'text-blue-600 bg-blue-100';
      case 'skipped': return 'text-gray-600 bg-gray-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStopIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'failed': return <XCircle className="w-5 h-5" />;
      case 'arrived': return <Navigation className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              <Badge variant={batteryLevel > 20 ? 'default' : 'destructive'}>
                <Battery className="w-4 h-4 mr-1" />
                {batteryLevel}%
              </Badge>
            </div>
          </div>
        </div>

        {/* No Active Route */}
        {!activeRoute && (
          <Card>
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No Active Route</h2>
              <p className="text-gray-600 mb-4">You don't have any routes assigned for today</p>
              <Button onClick={loadActiveRoute}>
                Refresh Routes
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Route */}
        {activeRoute && (
          <>
            {/* Route Overview */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Route {activeRoute.routeNumber}
                  </CardTitle>
                  <Badge variant={activeRoute.status === 'in_progress' ? 'default' : 'secondary'}>
                    {activeRoute.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {routeStats && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">
                        {routeStats.completedStops} of {routeStats.totalStops} stops
                      </span>
                    </div>
                    <Progress 
                      value={(routeStats.completedStops / routeStats.totalStops) * 100} 
                      className="h-2"
                    />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{routeStats.completedStops}</p>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{routeStats.remainingStops}</p>
                        <p className="text-sm text-gray-600">Remaining</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{routeStats.failedStops}</p>
                        <p className="text-sm text-gray-600">Failed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round(routeStats.estimatedTimeRemaining / 60)}h
                        </p>
                        <p className="text-sm text-gray-600">Est. Time</p>
                      </div>
                    </div>

                    {/* Route Actions */}
                    <div className="flex gap-2 mt-6">
                      {activeRoute.status === 'planned' && (
                        <Button onClick={startRoute} className="flex-1">
                          <Navigation className="w-4 h-4 mr-2" />
                          Start Route
                        </Button>
                      )}
                      {activeRoute.status === 'in_progress' && (
                        <>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowMap(!showMap)}
                            className="flex-1"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            {showMap ? 'Hide Map' : 'Show Map'}
                          </Button>
                          <Button 
                            onClick={completeRoute}
                            variant="default"
                            className="flex-1"
                            disabled={routeStats.remainingStops > 0}
                          >
                            Complete Route
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map View */}
            {showMap && (
              <Card className="mb-6">
                <CardContent className="p-0">
                  <DeliveryMap
                    routeId={activeRoute.id}
                    stops={routeStops}
                    currentStopId={currentStop?.id}
                    onStopClick={(stopId) => setSelectedStopId(stopId)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Current Stop */}
            {currentStop && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    Current Stop - #{currentStop.stopNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold">{currentStop.businessName}</p>
                      <p className="text-sm text-gray-600">{currentStop.address}</p>
                    </div>
                    
                    {currentStop.plannedArrival && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>Expected: {new Date(currentStop.plannedArrival).toLocaleTimeString()}</span>
                      </div>
                    )}

                    {currentStop.notes && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{currentStop.notes}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => completeStop(currentStop.id)}
                        className="flex-1"
                        variant="default"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Delivery
                      </Button>
                      <Button
                        onClick={() => failStop(currentStop.id, 'Customer not available')}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Failed
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Signature className="w-4 h-4 mr-2" />
                        Get Signature
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stops List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Delivery Stops
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {routeStops.map((stop) => (
                    <motion.div
                      key={stop.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${
                        stop.id === currentStop?.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                      } ${stop.id === selectedStopId ? 'ring-2 ring-purple-500' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getStopStatusColor(stop.status)}`}>
                            {getStopIcon(stop.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">#{stop.stopNumber}</span>
                              <span className="text-sm text-gray-600">{stop.businessName}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{stop.address}</p>
                            {stop.plannedArrival && (
                              <p className="text-xs text-gray-500 mt-1">
                                ETA: {new Date(stop.plannedArrival).toLocaleTimeString()}
                              </p>
                            )}
                            {stop.actualArrival && (
                              <p className="text-xs text-green-600 mt-1">
                                Arrived: {new Date(stop.actualArrival).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Badge variant={stop.status === 'completed' ? 'default' : 'secondary'}>
                          {stop.status}
                        </Badge>
                      </div>

                      {stop.status === 'pending' && stop.id !== currentStop?.id && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentStop(stop)}
                          >
                            Navigate Here
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
