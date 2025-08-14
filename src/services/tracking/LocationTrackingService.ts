import { sql } from '../../lib/neon';
import { mapService } from '../maps/MapService';

export interface LocationUpdate {
  userId: string;
  userType: 'driver' | 'sales_rep';
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  activity?: 'stationary' | 'walking' | 'driving';
  batteryLevel?: number;
  timestamp: Date;
}

export interface TrackingSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  totalDistance: number;
  averageSpeed: number;
  locations: LocationUpdate[];
}

export interface GeofenceEvent {
  userId: string;
  zoneId: string;
  zoneName: string;
  zoneType: string;
  eventType: 'enter' | 'exit' | 'dwell';
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
}

class LocationTrackingService {
  private static instance: LocationTrackingService;
  private watchId: number | null = null;
  private trackingInterval: NodeJS.Timeout | null = null;
  private locationBuffer: LocationUpdate[] = [];
  private websocket: WebSocket | null = null;
  private lastLocation: LocationUpdate | null = null;
  private geofenceCheckInterval: NodeJS.Timeout | null = null;

  public static getInstance(): LocationTrackingService {
    if (!LocationTrackingService.instance) {
      LocationTrackingService.instance = new LocationTrackingService();
    }
    return LocationTrackingService.instance;
  }

  /**
   * Start tracking user location
   */
  startTracking(
    userId: string,
    userType: 'driver' | 'sales_rep',
    options?: {
      highAccuracy?: boolean;
      updateInterval?: number;
      enableWebSocket?: boolean;
    }
  ): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    // Stop any existing tracking
    this.stopTracking();

    // Initialize WebSocket if enabled
    if (options?.enableWebSocket) {
      this.initializeWebSocket(userId);
    }

    // Start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationUpdate: LocationUpdate = {
          userId,
          userType,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed ? position.coords.speed * 2.237 : undefined, // Convert m/s to mph
          activity: this.detectActivity(position.coords.speed),
          batteryLevel: undefined, // Would need Battery API
          timestamp: new Date(position.timestamp)
        };

        this.handleLocationUpdate(locationUpdate);
      },
      (error) => {
        console.error('Location tracking error:', error);
        this.handleTrackingError(error);
      },
      {
        enableHighAccuracy: options?.highAccuracy !== false,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Start periodic batch upload
    const updateInterval = options?.updateInterval || 30000; // Default 30 seconds
    this.trackingInterval = setInterval(() => {
      this.uploadLocationBatch();
    }, updateInterval);

    // Start geofence checking
    this.startGeofenceMonitoring(userId);
  }

  /**
   * Stop tracking user location
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    if (this.geofenceCheckInterval) {
      clearInterval(this.geofenceCheckInterval);
      this.geofenceCheckInterval = null;
    }

    // Upload any remaining locations
    this.uploadLocationBatch();

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  /**
   * Handle location update
   */
  private handleLocationUpdate(location: LocationUpdate): void {
    // Add to buffer
    this.locationBuffer.push(location);

    // Send via WebSocket if connected
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'location_update',
        data: location
      }));
    }

    // Update last known location
    this.lastLocation = location;

    // Check if we should upload immediately (e.g., significant movement)
    if (this.shouldUploadImmediately(location)) {
      this.uploadLocationBatch();
    }
  }

  /**
   * Upload batch of locations to database
   */
  private async uploadLocationBatch(): Promise<void> {
    if (this.locationBuffer.length === 0) return;

    const batch = [...this.locationBuffer];
    this.locationBuffer = [];

    try {
      // Insert locations into database
      for (const location of batch) {
        await sql`
          INSERT INTO location_tracking (
            user_id, user_type, latitude, longitude,
            accuracy, altitude, heading, speed,
            activity, battery_level, recorded_at
          ) VALUES (
            ${location.userId},
            ${location.userType},
            ${location.latitude},
            ${location.longitude},
            ${location.accuracy || null},
            ${location.altitude || null},
            ${location.heading || null},
            ${location.speed || null},
            ${location.activity || null},
            ${location.batteryLevel || null},
            ${location.timestamp}
          )
        `;
      }

      // Store breadcrumbs for route reconstruction
      if (batch.length > 1) {
        await this.storeBreadcrumbs(batch);
      }
    } catch (error) {
      console.error('Error uploading location batch:', error);
      // Re-add to buffer for retry
      this.locationBuffer.unshift(...batch);
    }
  }

  /**
   * Store GPS breadcrumbs for historical tracking
   */
  private async storeBreadcrumbs(locations: LocationUpdate[]): Promise<void> {
    if (locations.length === 0) return;

    const breadcrumbData = locations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      time: loc.timestamp.toISOString(),
      speed: loc.speed,
      heading: loc.heading
    }));

    try {
      await sql`
        INSERT INTO gps_breadcrumbs (
          user_id, breadcrumb_data, start_time, end_time, total_points
        ) VALUES (
          ${locations[0].userId},
          ${JSON.stringify(breadcrumbData)},
          ${locations[0].timestamp},
          ${locations[locations.length - 1].timestamp},
          ${locations.length}
        )
      `;
    } catch (error) {
      console.error('Error storing breadcrumbs:', error);
    }
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(userId: string): Promise<LocationUpdate | null> {
    try {
      const result = await sql`
        SELECT * FROM location_tracking
        WHERE user_id = ${userId}
        ORDER BY recorded_at DESC
        LIMIT 1
      `;

      if (result.length > 0) {
        const row = result[0];
        return {
          userId: row.user_id,
          userType: row.user_type,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          accuracy: row.accuracy ? parseFloat(row.accuracy) : undefined,
          altitude: row.altitude ? parseFloat(row.altitude) : undefined,
          heading: row.heading ? parseFloat(row.heading) : undefined,
          speed: row.speed ? parseFloat(row.speed) : undefined,
          activity: row.activity,
          batteryLevel: row.battery_level,
          timestamp: new Date(row.recorded_at)
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Get location history for a user
   */
  async getLocationHistory(
    userId: string,
    startTime: Date,
    endTime: Date
  ): Promise<LocationUpdate[]> {
    try {
      const result = await sql`
        SELECT * FROM location_tracking
        WHERE user_id = ${userId}
          AND recorded_at BETWEEN ${startTime} AND ${endTime}
        ORDER BY recorded_at ASC
      `;

      return result.map(row => ({
        userId: row.user_id,
        userType: row.user_type,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        accuracy: row.accuracy ? parseFloat(row.accuracy) : undefined,
        altitude: row.altitude ? parseFloat(row.altitude) : undefined,
        heading: row.heading ? parseFloat(row.heading) : undefined,
        speed: row.speed ? parseFloat(row.speed) : undefined,
        activity: row.activity,
        batteryLevel: row.battery_level,
        timestamp: new Date(row.recorded_at)
      }));
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }

  /**
   * Start monitoring geofences
   */
  private startGeofenceMonitoring(userId: string): void {
    this.geofenceCheckInterval = setInterval(async () => {
      if (!this.lastLocation) return;

      try {
        // Get active geofence zones
        const zones = await sql`
          SELECT * FROM geofence_zones
          WHERE active = true
        `;

        for (const zone of zones) {
          const distance = mapService.calculateDistance(
            this.lastLocation.latitude,
            this.lastLocation.longitude,
            parseFloat(zone.center_latitude),
            parseFloat(zone.center_longitude)
          );

          const isInside = distance <= zone.radius_meters;
          
          // Check for geofence events
          await this.checkGeofenceEvent(userId, zone, isInside, distance);
        }
      } catch (error) {
        console.error('Error checking geofences:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Check and record geofence events
   */
  private async checkGeofenceEvent(
    userId: string,
    zone: any,
    isInside: boolean,
    distance: number
  ): Promise<void> {
    // This would track enter/exit events
    // Implementation would depend on maintaining state of which zones user is in
    
    if (zone.zone_type === 'school' && distance < 305) { // 1000ft = ~305m
      // Send alert for school zone proximity
      this.sendGeofenceAlert({
        userId,
        zoneId: zone.id,
        zoneName: zone.zone_name,
        zoneType: zone.zone_type,
        eventType: 'enter',
        timestamp: new Date(),
        location: {
          latitude: this.lastLocation!.latitude,
          longitude: this.lastLocation!.longitude
        }
      });
    }
  }

  /**
   * Send geofence alert
   */
  private sendGeofenceAlert(event: GeofenceEvent): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'geofence_alert',
        data: event
      }));
    }

    // Also store in database
    sql`
      INSERT INTO geofence_events (
        user_id, zone_id, event_type, 
        latitude, longitude, timestamp
      ) VALUES (
        ${event.userId},
        ${event.zoneId},
        ${event.eventType},
        ${event.location.latitude},
        ${event.location.longitude},
        ${event.timestamp}
      )
    `.catch(error => console.error('Error storing geofence event:', error));
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(userId: string): void {
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3001'}/tracking`;
    
    this.websocket = new WebSocket(wsUrl);

    this.websocket.onopen = () => {
      console.log('WebSocket connected');
      this.websocket!.send(JSON.stringify({
        type: 'register',
        userId
      }));
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.websocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt reconnection after delay
      setTimeout(() => {
        if (this.watchId !== null) {
          this.initializeWebSocket(userId);
        }
      }, 5000);
    };
  }

  /**
   * Detect activity based on speed
   */
  private detectActivity(speedMs: number | null): 'stationary' | 'walking' | 'driving' {
    if (!speedMs) return 'stationary';
    
    const speedMph = speedMs * 2.237;
    
    if (speedMph < 0.5) return 'stationary';
    if (speedMph < 4) return 'walking';
    return 'driving';
  }

  /**
   * Check if location should be uploaded immediately
   */
  private shouldUploadImmediately(location: LocationUpdate): boolean {
    if (!this.lastLocation) return false;

    // Calculate distance from last location
    const distance = mapService.calculateDistance(
      location.latitude,
      location.longitude,
      this.lastLocation.latitude,
      this.lastLocation.longitude
    );

    // Upload if moved more than 100 meters
    return distance > 100;
  }

  /**
   * Handle tracking errors
   */
  private handleTrackingError(error: GeolocationPositionError): void {
    let message = 'Unknown error';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location permission denied';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out';
        break;
    }

    console.error('Tracking error:', message);
    
    // Send error via WebSocket if connected
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'tracking_error',
        error: message
      }));
    }
  }

  /**
   * Calculate total distance traveled
   */
  calculateTotalDistance(locations: LocationUpdate[]): number {
    if (locations.length < 2) return 0;

    let totalDistance = 0;
    
    for (let i = 1; i < locations.length; i++) {
      const distance = mapService.calculateDistance(
        locations[i - 1].latitude,
        locations[i - 1].longitude,
        locations[i].latitude,
        locations[i].longitude
      );
      totalDistance += distance;
    }

    return totalDistance * 0.000621371; // Convert meters to miles
  }
}

// Export singleton instance
export const locationTrackingService = LocationTrackingService.getInstance();
