import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapService } from '../../services/maps/MapService';
import { DeliveryStop } from '../../services/tracking/DeliveryService';
import { locationTrackingService } from '../../services/tracking/LocationTrackingService';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Navigation, MapPin, Truck, RefreshCw } from 'lucide-react';

interface DeliveryMapProps {
  routeId: string;
  stops: DeliveryStop[];
  currentStopId?: string;
  onStopClick?: (stopId: string) => void;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  routeId,
  stops,
  currentStopId,
  onStopClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isFollowing, setIsFollowing] = useState(true);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = mapService.initializeMap(mapContainer.current, {
      center: [-74.0060, 40.7128],
      zoom: 12
    });

    // Add stops to map
    addStopsToMap();

    // Start tracking driver location
    startLocationTracking();

    return () => {
      stopLocationTracking();
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (stops.length > 0) {
      addStopsToMap();
      drawRoute();
    }
  }, [stops, currentStopId]);

  const addStopsToMap = () => {
    if (!map.current) return;

    // Clear existing markers
    stops.forEach(stop => {
      mapService.removeMarker(stop.id);
    });

    // Add stop markers
    stops.forEach((stop, index) => {
      if (stop.deliveryLocation) {
        const isCurrentStop = stop.id === currentStopId;
        const color = getStopColor(stop.status, isCurrentStop);
        
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = `
          <div style="
            width: 30px;
            height: 30px;
            background-color: ${color};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
          ">
            ${index + 1}
          </div>
        `;

        el.addEventListener('click', () => {
          if (onStopClick) {
            onStopClick(stop.id);
          }
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([stop.deliveryLocation.longitude, stop.deliveryLocation.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <h3 style="font-weight: bold; margin-bottom: 4px;">
                    Stop #${stop.stopNumber}
                  </h3>
                  <p style="margin: 2px 0;">${stop.businessName}</p>
                  <p style="margin: 2px 0; font-size: 12px; color: #666;">
                    ${stop.address}
                  </p>
                  <div style="margin-top: 8px;">
                    <span style="
                      display: inline-block;
                      padding: 2px 8px;
                      background-color: ${color};
                      color: white;
                      border-radius: 4px;
                      font-size: 12px;
                    ">
                      ${stop.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              `)
          )
          .addTo(map.current!);
      }
    });

    // Fit map to show all stops
    fitMapToBounds();
  };

  const drawRoute = async () => {
    if (!map.current || stops.length < 2) return;

    // Get optimized route
    const startLocation = driverLocation || { 
      latitude: stops[0].deliveryLocation?.latitude || 40.7128,
      longitude: stops[0].deliveryLocation?.longitude || -74.0060
    };

    const routeStops = stops
      .filter(stop => stop.deliveryLocation && (stop.status === 'pending' || stop.status === 'arrived'))
      .map(stop => ({
        id: stop.id,
        location: stop.deliveryLocation!,
        businessName: stop.businessName,
        address: stop.address,
        priority: stop.stopNumber
      }));

    if (routeStops.length > 0) {
      const optimizedRoute = await mapService.optimizeRoute(routeStops, startLocation);
      
      if (optimizedRoute && map.current) {
        // Draw route polyline
        mapService.drawRoute(optimizedRoute.polyline);
      }
    }
  };

  const startLocationTracking = () => {
    // Update driver location every 5 seconds
    const updateLocation = async () => {
      const location = await mapService.getCurrentLocation();
      if (location) {
        setDriverLocation({
          lat: location.latitude,
          lng: location.longitude
        });
        updateDriverMarker(location.latitude, location.longitude);
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 5000);
    
    // Store interval ID for cleanup
    (window as any).locationTrackingInterval = interval;
  };

  const stopLocationTracking = () => {
    if ((window as any).locationTrackingInterval) {
      clearInterval((window as any).locationTrackingInterval);
    }
  };

  const updateDriverMarker = (lat: number, lng: number) => {
    if (!map.current) return;

    // Remove existing driver marker
    if (driverMarker.current) {
      driverMarker.current.remove();
    }

    // Create driver marker
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background-color: #3b82f6;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 3c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm6 17H6V10h12v10z"/>
          <path d="M8 14h8v2H8z"/>
        </svg>
      </div>
      <style>
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      </style>
    `;

    driverMarker.current = new mapboxgl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<div style="padding: 8px;">Your Current Location</div>')
      )
      .addTo(map.current);

    // Center map on driver if following
    if (isFollowing) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000
      });
    }
  };

  const fitMapToBounds = () => {
    if (!map.current || stops.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    // Add driver location if available
    if (driverLocation) {
      bounds.extend([driverLocation.lng, driverLocation.lat]);
    }

    // Add all stop locations
    stops.forEach(stop => {
      if (stop.deliveryLocation) {
        bounds.extend([stop.deliveryLocation.longitude, stop.deliveryLocation.latitude]);
      }
    });

    map.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      duration: 1000
    });
  };

  const getStopColor = (status: string, isCurrent: boolean): string => {
    if (isCurrent) return '#3b82f6'; // Blue for current stop
    
    switch (status) {
      case 'completed': return '#10b981'; // Green
      case 'failed': return '#ef4444'; // Red
      case 'arrived': return '#f59e0b'; // Amber
      case 'skipped': return '#6b7280'; // Gray
      default: return '#8b5cf6'; // Purple for pending
    }
  };

  const centerOnDriver = () => {
    if (map.current && driverLocation) {
      map.current.flyTo({
        center: [driverLocation.lng, driverLocation.lat],
        zoom: 16,
        duration: 1000
      });
    }
  };

  const toggleFollowing = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="relative h-[600px] w-full">
      <div ref={mapContainer} className="h-full w-full rounded-lg" />
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Button
          size="sm"
          variant={isFollowing ? 'default' : 'outline'}
          onClick={toggleFollowing}
          className="shadow-lg"
        >
          <Navigation className={`w-4 h-4 mr-2 ${isFollowing ? 'animate-pulse' : ''}`} />
          {isFollowing ? 'Following' : 'Follow Driver'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={centerOnDriver}
          className="shadow-lg"
        >
          <Truck className="w-4 h-4 mr-2" />
          Center on Driver
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={fitMapToBounds}
          className="shadow-lg"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Show All Stops
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={drawRoute}
          className="shadow-lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Route
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <h3 className="text-sm font-semibold mb-2">Legend</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-xs">Current Stop / Driver</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span className="text-xs">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-xs">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-xs">Failed</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-4">
          <Badge variant="default">
            Route #{routeId.slice(0, 8)}
          </Badge>
          {driverLocation && (
            <Badge variant="outline">
              <MapPin className="w-3 h-3 mr-1" />
              {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
