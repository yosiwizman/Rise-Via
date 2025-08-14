import { sql } from '../../lib/neon';
import { mapService, MapLocation, RouteStop, OptimizedRoute } from '../maps/MapService';
import { locationTrackingService } from './LocationTrackingService';

export interface DeliveryRoute {
  id: string;
  driverId: string;
  routeDate: Date;
  routeNumber: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  totalStops: number;
  completedStops: number;
  totalDistanceMiles?: number;
  actualDistanceMiles?: number;
  plannedStartTime?: Date;
  actualStartTime?: Date;
  plannedEndTime?: Date;
  actualEndTime?: Date;
  vehicleId?: string;
  manifestNumbers?: string[];
  notes?: string;
}

export interface DeliveryStop {
  id: string;
  routeId: string;
  businessAccountId: string;
  businessName: string;
  address: string;
  orderId?: string;
  stopNumber: number;
  plannedArrival?: Date;
  actualArrival?: Date;
  actualDeparture?: Date;
  status: 'pending' | 'arrived' | 'completed' | 'failed' | 'skipped';
  deliveryLocation?: MapLocation;
  signatureUrl?: string;
  photoUrls?: string[];
  proofOfDelivery?: any;
  temperatureAtDelivery?: number;
  notes?: string;
  failureReason?: string;
  packages?: DeliveryPackage[];
}

export interface DeliveryPackage {
  id: string;
  manifestNumber: string;
  packageTag: string;
  productName: string;
  quantity: number;
  unitOfMeasure: string;
  weight?: number;
}

export interface DeliveryManifest {
  id: string;
  manifestNumber: string;
  metrcManifestId?: string;
  routeId: string;
  driverId: string;
  vehicleId?: string;
  departureFacility: string;
  departureTime?: Date;
  arrivalTime?: Date;
  status: 'pending' | 'in_transit' | 'delivered' | 'rejected';
  totalPackages: number;
  totalWeightGrams?: number;
  temperatureReadings?: any[];
  chainOfCustody?: any[];
  complianceChecks?: any;
  sealNumber?: string;
}

export interface DeliveryNotification {
  id: string;
  deliveryStopId: string;
  recipientId: string;
  notificationType: 'sms' | 'email' | 'push';
  notificationStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  message: string;
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
}

class DeliveryService {
  private static instance: DeliveryService;
  private activeRoute: DeliveryRoute | null = null;
  private currentStopIndex: number = 0;
  private trackingInterval: NodeJS.Timeout | null = null;

  public static getInstance(): DeliveryService {
    if (!DeliveryService.instance) {
      DeliveryService.instance = new DeliveryService();
    }
    return DeliveryService.instance;
  }

  /**
   * Create a new delivery route
   */
  async createRoute(
    driverId: string,
    routeDate: Date,
    stops: Partial<DeliveryStop>[],
    manifestNumbers?: string[]
  ): Promise<DeliveryRoute> {
    try {
      // Generate route number
      const routeNumber = this.generateRouteNumber(routeDate);

      // Create route in database
      const result = await sql`
        INSERT INTO delivery_routes (
          driver_id, route_date, route_number, status,
          total_stops, manifest_numbers, created_at
        ) VALUES (
          ${driverId},
          ${routeDate},
          ${routeNumber},
          'planned',
          ${stops.length},
          ${manifestNumbers || []},
          NOW()
        )
        RETURNING *
      `;

      const route = this.mapRouteFromDb(result[0]);

      // Create delivery stops
      for (let i = 0; i < stops.length; i++) {
        await this.createDeliveryStop(route.id, {
          ...stops[i],
          stopNumber: i + 1
        });
      }

      return route;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  }

  /**
   * Create a delivery stop
   */
  private async createDeliveryStop(
    routeId: string,
    stop: Partial<DeliveryStop>
  ): Promise<DeliveryStop> {
    try {
      const result = await sql`
        INSERT INTO delivery_stops (
          route_id, business_account_id, order_id,
          stop_number, planned_arrival, status,
          delivery_latitude, delivery_longitude,
          notes, created_at
        ) VALUES (
          ${routeId},
          ${stop.businessAccountId},
          ${stop.orderId || null},
          ${stop.stopNumber},
          ${stop.plannedArrival || null},
          'pending',
          ${stop.deliveryLocation?.latitude || null},
          ${stop.deliveryLocation?.longitude || null},
          ${stop.notes || null},
          NOW()
        )
        RETURNING *
      `;

      return this.mapStopFromDb(result[0]);
    } catch (error) {
      console.error('Error creating delivery stop:', error);
      throw error;
    }
  }

  /**
   * Start a delivery route
   */
  async startRoute(routeId: string, vehicleId?: string): Promise<void> {
    try {
      // Update route status
      await sql`
        UPDATE delivery_routes
        SET 
          status = 'in_progress',
          actual_start_time = NOW(),
          vehicle_id = ${vehicleId || null}
        WHERE id = ${routeId}
      `;

      // Get route details
      this.activeRoute = await this.getRoute(routeId);
      this.currentStopIndex = 0;

      // Start location tracking
      if (this.activeRoute) {
        locationTrackingService.startTracking(
          this.activeRoute.driverId,
          'driver',
          {
            highAccuracy: true,
            updateInterval: 10000, // 10 seconds
            enableWebSocket: true
          }
        );
      }

      // Start monitoring progress
      this.startRouteMonitoring();
    } catch (error) {
      console.error('Error starting route:', error);
      throw error;
    }
  }

  /**
   * Complete a delivery stop
   */
  async completeStop(
    stopId: string,
    data: {
      signatureUrl?: string;
      photoUrls?: string[];
      proofOfDelivery?: any;
      temperatureAtDelivery?: number;
      notes?: string;
    }
  ): Promise<void> {
    try {
      // Get current location
      const location = await mapService.getCurrentLocation();

      // Update stop status
      await sql`
        UPDATE delivery_stops
        SET 
          status = 'completed',
          actual_arrival = COALESCE(actual_arrival, NOW()),
          actual_departure = NOW(),
          signature_url = ${data.signatureUrl || null},
          photo_urls = ${data.photoUrls || []},
          proof_of_delivery = ${data.proofOfDelivery || null},
          temperature_at_delivery = ${data.temperatureAtDelivery || null},
          delivery_latitude = ${location?.latitude || null},
          delivery_longitude = ${location?.longitude || null},
          notes = ${data.notes || null},
          updated_at = NOW()
        WHERE id = ${stopId}
      `;

      // Update route progress
      if (this.activeRoute) {
        await this.updateRouteProgress(this.activeRoute.id);
      }

      // Send delivery notification
      await this.sendDeliveryNotification(stopId, 'completed');

      // Move to next stop
      this.currentStopIndex++;
    } catch (error) {
      console.error('Error completing stop:', error);
      throw error;
    }
  }

  /**
   * Fail a delivery stop
   */
  async failStop(
    stopId: string,
    failureReason: string,
    notes?: string
  ): Promise<void> {
    try {
      await sql`
        UPDATE delivery_stops
        SET 
          status = 'failed',
          actual_arrival = COALESCE(actual_arrival, NOW()),
          actual_departure = NOW(),
          failure_reason = ${failureReason},
          notes = ${notes || null},
          updated_at = NOW()
        WHERE id = ${stopId}
      `;

      // Update route progress
      if (this.activeRoute) {
        await this.updateRouteProgress(this.activeRoute.id);
      }

      // Send failure notification
      await this.sendDeliveryNotification(stopId, 'failed');

      // Move to next stop
      this.currentStopIndex++;
    } catch (error) {
      console.error('Error failing stop:', error);
      throw error;
    }
  }

  /**
   * Complete a delivery route
   */
  async completeRoute(routeId: string): Promise<void> {
    try {
      // Calculate actual distance
      const locations = await locationTrackingService.getLocationHistory(
        this.activeRoute?.driverId || '',
        this.activeRoute?.actualStartTime || new Date(),
        new Date()
      );

      const totalDistance = locationTrackingService.calculateTotalDistance(locations);

      // Update route status
      await sql`
        UPDATE delivery_routes
        SET 
          status = 'completed',
          actual_end_time = NOW(),
          actual_distance_miles = ${totalDistance},
          updated_at = NOW()
        WHERE id = ${routeId}
      `;

      // Stop location tracking
      locationTrackingService.stopTracking();

      // Stop monitoring
      this.stopRouteMonitoring();

      // Clear active route
      this.activeRoute = null;
    } catch (error) {
      console.error('Error completing route:', error);
      throw error;
    }
  }

  /**
   * Get route by ID
   */
  async getRoute(routeId: string): Promise<DeliveryRoute | null> {
    try {
      const result = await sql`
        SELECT * FROM delivery_routes
        WHERE id = ${routeId}
      `;

      if (result.length > 0) {
        return this.mapRouteFromDb(result[0]);
      }

      return null;
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  }

  /**
   * Get route stops
   */
  async getRouteStops(routeId: string): Promise<DeliveryStop[]> {
    try {
      const result = await sql`
        SELECT ds.*, ba.business_name, ba.address
        FROM delivery_stops ds
        LEFT JOIN business_accounts ba ON ds.business_account_id = ba.id
        WHERE ds.route_id = ${routeId}
        ORDER BY ds.stop_number ASC
      `;

      return result.map(row => this.mapStopFromDb(row));
    } catch (error) {
      console.error('Error getting route stops:', error);
      return [];
    }
  }

  /**
   * Get active routes for driver
   */
  async getActiveRoutesForDriver(driverId: string): Promise<DeliveryRoute[]> {
    try {
      const result = await sql`
        SELECT * FROM delivery_routes
        WHERE driver_id = ${driverId}
          AND status IN ('planned', 'in_progress')
          AND route_date = CURRENT_DATE
        ORDER BY created_at DESC
      `;

      return result.map(row => this.mapRouteFromDb(row));
    } catch (error) {
      console.error('Error getting active routes:', error);
      return [];
    }
  }

  /**
   * Optimize route stops
   */
  async optimizeRoute(routeId: string): Promise<OptimizedRoute | null> {
    try {
      const stops = await this.getRouteStops(routeId);
      
      if (stops.length < 2) {
        console.error('Need at least 2 stops to optimize');
        return null;
      }

      // Get starting location (warehouse or current location)
      const startLocation = await mapService.getCurrentLocation() || {
        latitude: 40.7128,
        longitude: -74.0060
      };

      // Convert stops to RouteStop format
      const routeStops: RouteStop[] = stops.map(stop => ({
        id: stop.id,
        location: stop.deliveryLocation || {
          latitude: 0,
          longitude: 0
        },
        businessName: stop.businessName,
        address: stop.address,
        estimatedArrival: stop.plannedArrival,
        priority: stop.stopNumber,
        deliveryNotes: stop.notes
      }));

      // Optimize the route
      const optimizedRoute = await mapService.optimizeRoute(routeStops, startLocation);

      if (optimizedRoute) {
        // Update stop order in database
        for (let i = 0; i < optimizedRoute.stops.length; i++) {
          await sql`
            UPDATE delivery_stops
            SET stop_number = ${i + 1}
            WHERE id = ${optimizedRoute.stops[i].id}
          `;
        }

        // Update route with optimized distance
        await sql`
          UPDATE delivery_routes
          SET 
            total_distance_miles = ${optimizedRoute.totalDistance},
            updated_at = NOW()
          WHERE id = ${routeId}
        `;
      }

      return optimizedRoute;
    } catch (error) {
      console.error('Error optimizing route:', error);
      return null;
    }
  }

  /**
   * Send delivery notification
   */
  private async sendDeliveryNotification(
    stopId: string,
    status: 'completed' | 'failed' | 'approaching'
  ): Promise<void> {
    try {
      // Get stop details
      const stop = await sql`
        SELECT ds.*, o.customer_id
        FROM delivery_stops ds
        LEFT JOIN orders o ON ds.order_id = o.id
        WHERE ds.id = ${stopId}
      `;

      if (stop.length === 0) return;

      const customerId = stop[0].customer_id;
      if (!customerId) return;

      // Create notification message
      let message = '';
      switch (status) {
        case 'completed':
          message = 'Your delivery has been completed successfully.';
          break;
        case 'failed':
          message = `Delivery attempt failed: ${stop[0].failure_reason}`;
          break;
        case 'approaching':
          message = 'Your delivery driver is approaching. Estimated arrival in 15 minutes.';
          break;
      }

      // Create notification record
      await sql`
        INSERT INTO delivery_notifications (
          delivery_stop_id, recipient_id, notification_type,
          notification_status, message, created_at
        ) VALUES (
          ${stopId},
          ${customerId},
          'push',
          'pending',
          ${message},
          NOW()
        )
      `;

      // Here you would integrate with actual notification service
      // e.g., Firebase Cloud Messaging, Twilio, etc.
    } catch (error) {
      console.error('Error sending delivery notification:', error);
    }
  }

  /**
   * Update route progress
   */
  private async updateRouteProgress(routeId: string): Promise<void> {
    try {
      const result = await sql`
        SELECT 
          COUNT(*) as total_stops,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_stops
        FROM delivery_stops
        WHERE route_id = ${routeId}
      `;

      await sql`
        UPDATE delivery_routes
        SET 
          completed_stops = ${result[0].completed_stops},
          updated_at = NOW()
        WHERE id = ${routeId}
      `;
    } catch (error) {
      console.error('Error updating route progress:', error);
    }
  }

  /**
   * Start monitoring route progress
   */
  private startRouteMonitoring(): void {
    this.trackingInterval = setInterval(async () => {
      if (!this.activeRoute) return;

      // Check proximity to next stop
      const stops = await this.getRouteStops(this.activeRoute.id);
      if (this.currentStopIndex < stops.length) {
        const nextStop = stops[this.currentStopIndex];
        const currentLocation = await mapService.getCurrentLocation();

        if (currentLocation && nextStop.deliveryLocation) {
          const distance = mapService.calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            nextStop.deliveryLocation.latitude,
            nextStop.deliveryLocation.longitude
          );

          // If within 500 meters, mark as arrived
          if (distance < 500) {
            await sql`
              UPDATE delivery_stops
              SET 
                status = 'arrived',
                actual_arrival = NOW()
              WHERE id = ${nextStop.id}
                AND status = 'pending'
            `;

            // Send approaching notification
            await this.sendDeliveryNotification(nextStop.id, 'approaching');
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop monitoring route progress
   */
  private stopRouteMonitoring(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  /**
   * Generate route number
   */
  private generateRouteNumber(date: Date): string {
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RT-${dateStr}-${random}`;
  }

  /**
   * Map route from database
   */
  private mapRouteFromDb(row: any): DeliveryRoute {
    return {
      id: row.id,
      driverId: row.driver_id,
      routeDate: new Date(row.route_date),
      routeNumber: row.route_number,
      status: row.status,
      totalStops: row.total_stops || 0,
      completedStops: row.completed_stops || 0,
      totalDistanceMiles: row.total_distance_miles ? parseFloat(row.total_distance_miles) : undefined,
      actualDistanceMiles: row.actual_distance_miles ? parseFloat(row.actual_distance_miles) : undefined,
      plannedStartTime: row.planned_start_time ? new Date(row.planned_start_time) : undefined,
      actualStartTime: row.actual_start_time ? new Date(row.actual_start_time) : undefined,
      plannedEndTime: row.planned_end_time ? new Date(row.planned_end_time) : undefined,
      actualEndTime: row.actual_end_time ? new Date(row.actual_end_time) : undefined,
      vehicleId: row.vehicle_id,
      manifestNumbers: row.manifest_numbers,
      notes: row.notes
    };
  }

  /**
   * Map stop from database
   */
  private mapStopFromDb(row: any): DeliveryStop {
    return {
      id: row.id,
      routeId: row.route_id,
      businessAccountId: row.business_account_id,
      businessName: row.business_name || '',
      address: row.address || '',
      orderId: row.order_id,
      stopNumber: row.stop_number,
      plannedArrival: row.planned_arrival ? new Date(row.planned_arrival) : undefined,
      actualArrival: row.actual_arrival ? new Date(row.actual_arrival) : undefined,
      actualDeparture: row.actual_departure ? new Date(row.actual_departure) : undefined,
      status: row.status,
      deliveryLocation: row.delivery_latitude && row.delivery_longitude ? {
        latitude: parseFloat(row.delivery_latitude),
        longitude: parseFloat(row.delivery_longitude)
      } : undefined,
      signatureUrl: row.signature_url,
      photoUrls: row.photo_urls,
      proofOfDelivery: row.proof_of_delivery,
      temperatureAtDelivery: row.temperature_at_delivery ? parseFloat(row.temperature_at_delivery) : undefined,
      notes: row.notes,
      failureReason: row.failure_reason
    };
  }

  /**
   * Get delivery tracking info for customer
   */
  async getDeliveryTracking(orderId: string): Promise<any> {
    try {
      const result = await sql`
        SELECT 
          ds.*,
          dr.route_number,
          dr.driver_id,
          dr.status as route_status,
          dr.total_stops,
          dr.completed_stops,
          ba.business_name,
          ba.address,
          u.first_name || ' ' || u.last_name as driver_name
        FROM delivery_stops ds
        JOIN delivery_routes dr ON ds.route_id = dr.id
        LEFT JOIN business_accounts ba ON ds.business_account_id = ba.id
        LEFT JOIN users u ON dr.driver_id = u.id
        WHERE ds.order_id = ${orderId}
      `;

      if (result.length === 0) return null;

      const delivery = result[0];
      
      // Get driver's current location if route is active
      let driverLocation = null;
      if (delivery.route_status === 'in_progress') {
        driverLocation = await locationTrackingService.getCurrentLocation(delivery.driver_id);
      }

      return {
        routeNumber: delivery.route_number,
        driverName: delivery.driver_name,
        status: delivery.status,
        routeStatus: delivery.route_status,
        stopNumber: delivery.stop_number,
        totalStops: delivery.total_stops,
        completedStops: delivery.completed_stops,
        plannedArrival: delivery.planned_arrival,
        actualArrival: delivery.actual_arrival,
        deliveryAddress: delivery.address,
        driverLocation,
        deliveryLocation: delivery.delivery_latitude && delivery.delivery_longitude ? {
          latitude: parseFloat(delivery.delivery_latitude),
          longitude: parseFloat(delivery.delivery_longitude)
        } : null,
        signatureUrl: delivery.signature_url,
        photoUrls: delivery.photo_urls
      };
    } catch (error) {
      console.error('Error getting delivery tracking:', error);
      return null;
    }
  }
}

// Export singleton instance
export const deliveryService = DeliveryService.getInstance();
