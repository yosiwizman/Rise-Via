import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import MapboxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import { territoryService } from '../TerritoryService';

// Initialize Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface RouteStop {
  id: string;
  location: MapLocation;
  businessName: string;
  address: string;
  estimatedArrival?: Date;
  timeWindow?: {
    start: string;
    end: string;
  };
  priority?: number;
  deliveryNotes?: string;
}

export interface OptimizedRoute {
  stops: RouteStop[];
  totalDistance: number;
  totalDuration: number;
  polyline: string;
  bounds: [[number, number], [number, number]];
}

export interface GeofenceAlert {
  type: 'entering' | 'exiting' | 'nearby';
  zone: {
    id: string;
    name: string;
    type: string;
    message?: string;
  };
  distance: number;
  timestamp: Date;
}

class MapService {
  private static instance: MapService;
  private directionsClient: any;
  private geocodingClient: any;
  private map: mapboxgl.Map | null = null;
  private markers: Map<string, mapboxgl.Marker> = new Map();
  private activeRoute: any = null;

  constructor() {
    const mapboxClient = require('@mapbox/mapbox-sdk')({ 
      accessToken: mapboxgl.accessToken 
    });
    this.directionsClient = MapboxDirections(mapboxClient);
    this.geocodingClient = MapboxGeocoding(mapboxClient);
  }

  public static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  /**
   * Initialize map instance
   */
  initializeMap(container: string | HTMLElement, options?: mapboxgl.MapboxOptions): mapboxgl.Map {
    this.map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.0060, 40.7128], // Default to NYC
      zoom: 12,
      ...options
    });

    // Add navigation controls
    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add geolocate control
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    return this.map;
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<MapLocation | null> {
    try {
      const response = await this.geocodingClient
        .forwardGeocode({
          query: address,
          limit: 1,
          countries: ['US']
        })
        .send();

      if (response.body.features.length > 0) {
        const feature = response.body.features[0];
        return {
          latitude: feature.center[1],
          longitude: feature.center[0],
          address: feature.place_name,
          name: feature.text
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await this.geocodingClient
        .reverseGeocode({
          query: [lng, lat],
          limit: 1
        })
        .send();

      if (response.body.features.length > 0) {
        return response.body.features[0].place_name;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Optimize delivery route with multiple stops
   */
  async optimizeRoute(stops: RouteStop[], startLocation: MapLocation): Promise<OptimizedRoute | null> {
    if (stops.length < 2) {
      console.error('Need at least 2 stops to optimize route');
      return null;
    }

    try {
      // Prepare waypoints
      const waypoints = [
        { coordinates: [startLocation.longitude, startLocation.latitude] },
        ...stops.map(stop => ({
          coordinates: [stop.location.longitude, stop.location.latitude]
        }))
      ];

      const response = await this.directionsClient
        .getDirections({
          profile: 'driving',
          waypoints,
          geometries: 'polyline',
          overview: 'full',
          steps: true,
          alternatives: false,
          continue_straight: true,
          roundtrip: true,
          source: 'first',
          destination: 'last'
        })
        .send();

      if (response.body.routes.length > 0) {
        const route = response.body.routes[0];
        
        // Reorder stops based on optimized route
        const optimizedStops = route.waypoints.slice(1).map((waypoint: any, index: number) => {
          return stops[waypoint.waypoint_index - 1];
        });

        return {
          stops: optimizedStops,
          totalDistance: route.distance * 0.000621371, // Convert meters to miles
          totalDuration: route.duration / 60, // Convert seconds to minutes
          polyline: route.geometry,
          bounds: this.calculateBounds(waypoints.map(w => w.coordinates))
        };
      }

      return null;
    } catch (error) {
      console.error('Route optimization error:', error);
      return null;
    }
  }

  /**
   * Add marker to map
   */
  addMarker(
    id: string,
    location: MapLocation,
    options?: {
      color?: string;
      icon?: string;
      draggable?: boolean;
      popup?: string;
    }
  ): mapboxgl.Marker | null {
    if (!this.map) return null;

    // Remove existing marker if it exists
    this.removeMarker(id);

    // Create marker element
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundColor = options?.color || '#8b5cf6';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

    const marker = new mapboxgl.Marker({
      element: el,
      draggable: options?.draggable || false
    })
      .setLngLat([location.longitude, location.latitude])
      .addTo(this.map);

    if (options?.popup) {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(options.popup);
      marker.setPopup(popup);
    }

    this.markers.set(id, marker);
    return marker;
  }

  /**
   * Remove marker from map
   */
  removeMarker(id: string): void {
    const marker = this.markers.get(id);
    if (marker) {
      marker.remove();
      this.markers.delete(id);
    }
  }

  /**
   * Draw route on map
   */
  drawRoute(polyline: string, color: string = '#8b5cf6'): void {
    if (!this.map) return;

    // Remove existing route
    if (this.map.getSource('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }

    // Decode polyline
    const coordinates = this.decodePolyline(polyline);

    // Add route to map
    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    });

    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }

  /**
   * Draw territory boundaries on map
   */
  async drawTerritoryBoundaries(territoryId: string): Promise<void> {
    if (!this.map) return;

    try {
      const territory = await territoryService.getTerritoryById(territoryId);
      if (!territory || !territory.boundaries) return;

      // Remove existing territory layer
      if (this.map.getSource('territory')) {
        this.map.removeLayer('territory-fill');
        this.map.removeLayer('territory-outline');
        this.map.removeSource('territory');
      }

      // Add territory source
      this.map.addSource('territory', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            name: territory.name
          },
          geometry: territory.boundaries
        }
      });

      // Add fill layer
      this.map.addLayer({
        id: 'territory-fill',
        type: 'fill',
        source: 'territory',
        paint: {
          'fill-color': '#8b5cf6',
          'fill-opacity': 0.2
        }
      });

      // Add outline layer
      this.map.addLayer({
        id: 'territory-outline',
        type: 'line',
        source: 'territory',
        paint: {
          'line-color': '#8b5cf6',
          'line-width': 2
        }
      });
    } catch (error) {
      console.error('Error drawing territory boundaries:', error);
    }
  }

  /**
   * Check if location is within geofence
   */
  isLocationInGeofence(
    location: MapLocation,
    center: MapLocation,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(
      location.latitude,
      location.longitude,
      center.latitude,
      center.longitude
    );
    
    return distance <= radiusMeters;
  }

  /**
   * Calculate distance between two points (in meters)
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get current user location
   */
  async getCurrentLocation(): Promise<MapLocation | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Fit map to bounds
   */
  fitBounds(bounds: [[number, number], [number, number]], padding: number = 50): void {
    if (!this.map) return;

    this.map.fitBounds(bounds, {
      padding: { top: padding, bottom: padding, left: padding, right: padding }
    });
  }

  /**
   * Calculate bounds for coordinates
   */
  private calculateBounds(coordinates: number[][]): [[number, number], [number, number]] {
    const lngs = coordinates.map(c => c[0]);
    const lats = coordinates.map(c => c[1]);
    
    return [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    ];
  }

  /**
   * Decode polyline string to coordinates
   */
  private decodePolyline(str: string, precision: number = 5): number[][] {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates = [];
    let shift = 0;
    let result = 0;
    let byte = null;
    let latitude_change;
    let longitude_change;
    const factor = Math.pow(10, precision);

    while (index < str.length) {
      byte = null;
      shift = 0;
      result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

      shift = result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

      lat += latitude_change;
      lng += longitude_change;

      coordinates.push([lng / factor, lat / factor]);
    }

    return coordinates;
  }

  /**
   * Clean up map resources
   */
  destroy(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();
    
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

// Export singleton instance
export const mapService = MapService.getInstance();
