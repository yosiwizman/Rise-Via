import { sql } from '../../lib/neon';
import { mapService, MapLocation } from '../maps/MapService';
import { locationTrackingService, GeofenceEvent } from './LocationTrackingService';

export interface GeofenceZone {
  id: string;
  zoneName: string;
  zoneType: 'school' | 'federal_property' | 'restricted' | 'delivery_zone' | 'competitor';
  centerLocation?: MapLocation;
  radiusMeters?: number;
  polygonCoordinates?: number[][];
  restrictions?: {
    noDelivery?: boolean;
    noSales?: boolean;
    timeRestrictions?: {
      start: string;
      end: string;
      days?: string[];
    }[];
    speedLimit?: number;
    requiresNotification?: boolean;
  };
  alertEnabled: boolean;
  alertMessage?: string;
  active: boolean;
}

export interface GeofenceAlert {
  id: string;
  zoneId: string;
  zoneName: string;
  zoneType: string;
  userId: string;
  eventType: 'enter' | 'exit' | 'dwell' | 'speed_violation';
  timestamp: Date;
  location: MapLocation;
  duration?: number;
  resolved: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  notes?: string;
}

export interface ComplianceViolation {
  id: string;
  userId: string;
  zoneId: string;
  violationType: string;
  violationDetails: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
  resolutionNotes?: string;
}

class GeofenceService {
  private static instance: GeofenceService;
  private activeZones: Map<string, GeofenceZone> = new Map();
  private userZoneStatus: Map<string, Set<string>> = new Map(); // Track which zones users are in
  private monitoringInterval: NodeJS.Timeout | null = null;

  public static getInstance(): GeofenceService {
    if (!GeofenceService.instance) {
      GeofenceService.instance = new GeofenceService();
    }
    return GeofenceService.instance;
  }

  /**
   * Initialize geofence monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Load active geofence zones
      await this.loadActiveZones();

      // Start monitoring
      this.startMonitoring();
    } catch (error) {
      console.error('Error initializing geofence service:', error);
    }
  }

  /**
   * Load active geofence zones from database
   */
  private async loadActiveZones(): Promise<void> {
    try {
      const result = await sql`
        SELECT * FROM geofence_zones
        WHERE active = true
      `;

      this.activeZones.clear();
      
      for (const row of result) {
        const zone = this.mapZoneFromDb(row);
        this.activeZones.set(zone.id, zone);
      }

      console.log(`Loaded ${this.activeZones.size} active geofence zones`);
    } catch (error) {
      console.error('Error loading geofence zones:', error);
    }
  }

  /**
   * Create a new geofence zone
   */
  async createZone(zone: Partial<GeofenceZone>): Promise<GeofenceZone> {
    try {
      const result = await sql`
        INSERT INTO geofence_zones (
          zone_name, zone_type,
          center_latitude, center_longitude,
          radius_meters, polygon_coordinates,
          restrictions, alert_enabled,
          alert_message, active
        ) VALUES (
          ${zone.zoneName},
          ${zone.zoneType},
          ${zone.centerLocation?.latitude || null},
          ${zone.centerLocation?.longitude || null},
          ${zone.radiusMeters || null},
          ${zone.polygonCoordinates ? JSON.stringify(zone.polygonCoordinates) : null},
          ${zone.restrictions ? JSON.stringify(zone.restrictions) : null},
          ${zone.alertEnabled !== false},
          ${zone.alertMessage || null},
          ${zone.active !== false}
        )
        RETURNING *
      `;

      const newZone = this.mapZoneFromDb(result[0]);
      
      // Add to active zones if active
      if (newZone.active) {
        this.activeZones.set(newZone.id, newZone);
      }

      return newZone;
    } catch (error) {
      console.error('Error creating geofence zone:', error);
      throw error;
    }
  }

  /**
   * Update geofence zone
   */
  async updateZone(zoneId: string, updates: Partial<GeofenceZone>): Promise<void> {
    try {
      await sql`
        UPDATE geofence_zones
        SET
          zone_name = COALESCE(${updates.zoneName}, zone_name),
          zone_type = COALESCE(${updates.zoneType}, zone_type),
          center_latitude = COALESCE(${updates.centerLocation?.latitude}, center_latitude),
          center_longitude = COALESCE(${updates.centerLocation?.longitude}, center_longitude),
          radius_meters = COALESCE(${updates.radiusMeters}, radius_meters),
          polygon_coordinates = COALESCE(${updates.polygonCoordinates ? JSON.stringify(updates.polygonCoordinates) : null}, polygon_coordinates),
          restrictions = COALESCE(${updates.restrictions ? JSON.stringify(updates.restrictions) : null}, restrictions),
          alert_enabled = COALESCE(${updates.alertEnabled}, alert_enabled),
          alert_message = COALESCE(${updates.alertMessage}, alert_message),
          active = COALESCE(${updates.active}, active),
          updated_at = NOW()
        WHERE id = ${zoneId}
      `;

      // Reload zones
      await this.loadActiveZones();
    } catch (error) {
      console.error('Error updating geofence zone:', error);
      throw error;
    }
  }

  /**
   * Delete geofence zone
   */
  async deleteZone(zoneId: string): Promise<void> {
    try {
      await sql`
        DELETE FROM geofence_zones
        WHERE id = ${zoneId}
      `;

      this.activeZones.delete(zoneId);
    } catch (error) {
      console.error('Error deleting geofence zone:', error);
      throw error;
    }
  }

  /**
   * Check if location is within zone
   */
  isLocationInZone(location: MapLocation, zone: GeofenceZone): boolean {
    if (zone.polygonCoordinates && zone.polygonCoordinates.length > 0) {
      // Check polygon containment
      return this.isPointInPolygon(location, zone.polygonCoordinates);
    } else if (zone.centerLocation && zone.radiusMeters) {
      // Check circular zone
      return mapService.isLocationInGeofence(
        location,
        zone.centerLocation,
        zone.radiusMeters
      );
    }

    return false;
  }

  /**
   * Check if point is inside polygon
   */
  private isPointInPolygon(point: MapLocation, polygon: number[][]): boolean {
    let inside = false;
    const x = point.longitude;
    const y = point.latitude;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Monitor user locations for geofence events
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.checkAllUserLocations();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Check all active user locations
   */
  private async checkAllUserLocations(): Promise<void> {
    try {
      // Get all active tracking sessions
      const result = await sql`
        SELECT DISTINCT user_id, user_type
        FROM location_tracking
        WHERE recorded_at > NOW() - INTERVAL '5 minutes'
      `;

      for (const user of result) {
        await this.checkUserGeofences(user.user_id, user.user_type);
      }
    } catch (error) {
      console.error('Error checking user locations:', error);
    }
  }

  /**
   * Check geofences for a specific user
   */
  async checkUserGeofences(userId: string, userType: string): Promise<void> {
    try {
      // Get user's current location
      const location = await locationTrackingService.getCurrentLocation(userId);
      if (!location) return;

      const currentLocation: MapLocation = {
        latitude: location.latitude,
        longitude: location.longitude
      };

      // Get or create user's zone status
      if (!this.userZoneStatus.has(userId)) {
        this.userZoneStatus.set(userId, new Set());
      }
      const userZones = this.userZoneStatus.get(userId)!;

      // Check each active zone
      for (const [zoneId, zone] of this.activeZones) {
        const isInZone = this.isLocationInZone(currentLocation, zone);
        const wasInZone = userZones.has(zoneId);

        // Detect enter event
        if (isInZone && !wasInZone) {
          userZones.add(zoneId);
          await this.handleGeofenceEvent({
            userId,
            zoneId,
            zoneName: zone.zoneName,
            zoneType: zone.zoneType,
            eventType: 'enter',
            timestamp: new Date(),
            location: currentLocation
          });
        }

        // Detect exit event
        if (!isInZone && wasInZone) {
          userZones.delete(zoneId);
          await this.handleGeofenceEvent({
            userId,
            zoneId,
            zoneName: zone.zoneName,
            zoneType: zone.zoneType,
            eventType: 'exit',
            timestamp: new Date(),
            location: currentLocation
          });
        }

        // Check for violations while in zone
        if (isInZone) {
          await this.checkZoneViolations(userId, zone, location);
        }
      }
    } catch (error) {
      console.error(`Error checking geofences for user ${userId}:`, error);
    }
  }

  /**
   * Handle geofence event
   */
  private async handleGeofenceEvent(event: GeofenceEvent): Promise<void> {
    try {
      // Store event in database
      await sql`
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
      `;

      // Get zone details
      const zone = this.activeZones.get(event.zoneId);
      if (!zone) return;

      // Create alert if enabled
      if (zone.alertEnabled) {
        await this.createGeofenceAlert({
          zoneId: event.zoneId,
          zoneName: zone.zoneName,
          zoneType: zone.zoneType,
          userId: event.userId,
          eventType: event.eventType,
          timestamp: event.timestamp,
          location: event.location,
          resolved: false
        });
      }

      // Check for compliance violations
      if (zone.zoneType === 'school' && event.eventType === 'enter') {
        await this.createComplianceViolation({
          userId: event.userId,
          zoneId: event.zoneId,
          violationType: 'school_zone_entry',
          violationDetails: {
            message: 'Entered school zone - 1000ft buffer violation',
            location: event.location
          },
          severity: 'high',
          timestamp: event.timestamp,
          resolved: false
        });
      }
    } catch (error) {
      console.error('Error handling geofence event:', error);
    }
  }

  /**
   * Check for zone-specific violations
   */
  private async checkZoneViolations(
    userId: string,
    zone: GeofenceZone,
    location: any
  ): Promise<void> {
    // Check speed violations
    if (zone.restrictions?.speedLimit && location.speed) {
      if (location.speed > zone.restrictions.speedLimit) {
        await this.createComplianceViolation({
          userId,
          zoneId: zone.id,
          violationType: 'speed_violation',
          violationDetails: {
            speedLimit: zone.restrictions.speedLimit,
            actualSpeed: location.speed,
            location: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          },
          severity: 'medium',
          timestamp: new Date(),
          resolved: false
        });
      }
    }

    // Check time restrictions
    if (zone.restrictions?.timeRestrictions) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

      for (const restriction of zone.restrictions.timeRestrictions) {
        const inTimeWindow = currentTime >= restriction.start && currentTime <= restriction.end;
        const inDayWindow = !restriction.days || restriction.days.includes(currentDay);

        if (inTimeWindow && inDayWindow) {
          await this.createComplianceViolation({
            userId,
            zoneId: zone.id,
            violationType: 'time_restriction_violation',
            violationDetails: {
              restriction,
              currentTime,
              currentDay
            },
            severity: 'medium',
            timestamp: new Date(),
            resolved: false
          });
        }
      }
    }
  }

  /**
   * Create geofence alert
   */
  private async createGeofenceAlert(alert: Omit<GeofenceAlert, 'id'>): Promise<void> {
    try {
      await sql`
        INSERT INTO geofence_alerts (
          zone_id, zone_name, zone_type,
          user_id, event_type, timestamp,
          latitude, longitude, resolved
        ) VALUES (
          ${alert.zoneId},
          ${alert.zoneName},
          ${alert.zoneType},
          ${alert.userId},
          ${alert.eventType},
          ${alert.timestamp},
          ${alert.location.latitude},
          ${alert.location.longitude},
          false
        )
      `;

      // Send real-time notification
      // This would integrate with your notification service
      console.log(`Geofence Alert: User ${alert.userId} ${alert.eventType} zone ${alert.zoneName}`);
    } catch (error) {
      console.error('Error creating geofence alert:', error);
    }
  }

  /**
   * Create compliance violation
   */
  private async createComplianceViolation(violation: Omit<ComplianceViolation, 'id'>): Promise<void> {
    try {
      await sql`
        INSERT INTO compliance_violations (
          user_id, zone_id, violation_type,
          violation_details, severity,
          timestamp, resolved
        ) VALUES (
          ${violation.userId},
          ${violation.zoneId},
          ${violation.violationType},
          ${JSON.stringify(violation.violationDetails)},
          ${violation.severity},
          ${violation.timestamp},
          false
        )
      `;

      // Send compliance alert
      console.log(`Compliance Violation: ${violation.violationType} for user ${violation.userId}`);
    } catch (error) {
      console.error('Error creating compliance violation:', error);
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<GeofenceAlert[]> {
    try {
      const result = await sql`
        SELECT * FROM geofence_alerts
        WHERE resolved = false
        ORDER BY timestamp DESC
      `;

      return result.map(row => ({
        id: row.id,
        zoneId: row.zone_id,
        zoneName: row.zone_name,
        zoneType: row.zone_type,
        userId: row.user_id,
        eventType: row.event_type,
        timestamp: new Date(row.timestamp),
        location: {
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude)
        },
        duration: row.duration,
        resolved: row.resolved,
        acknowledgedBy: row.acknowledged_by,
        acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
        notes: row.notes
      }));
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return [];
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, userId: string, notes?: string): Promise<void> {
    try {
      await sql`
        UPDATE geofence_alerts
        SET
          resolved = true,
          acknowledged_by = ${userId},
          acknowledged_at = NOW(),
          notes = ${notes || null}
        WHERE id = ${alertId}
      `;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  /**
   * Get compliance violations
   */
  async getComplianceViolations(
    filters?: {
      userId?: string;
      zoneId?: string;
      startDate?: Date;
      endDate?: Date;
      resolved?: boolean;
    }
  ): Promise<ComplianceViolation[]> {
    try {
      let query = sql`
        SELECT * FROM compliance_violations
        WHERE 1=1
      `;

      if (filters?.userId) {
        query = sql`${query} AND user_id = ${filters.userId}`;
      }
      if (filters?.zoneId) {
        query = sql`${query} AND zone_id = ${filters.zoneId}`;
      }
      if (filters?.startDate) {
        query = sql`${query} AND timestamp >= ${filters.startDate}`;
      }
      if (filters?.endDate) {
        query = sql`${query} AND timestamp <= ${filters.endDate}`;
      }
      if (filters?.resolved !== undefined) {
        query = sql`${query} AND resolved = ${filters.resolved}`;
      }

      query = sql`${query} ORDER BY timestamp DESC`;

      const result = await query;

      return result.map(row => ({
        id: row.id,
        userId: row.user_id,
        zoneId: row.zone_id,
        violationType: row.violation_type,
        violationDetails: row.violation_details,
        severity: row.severity,
        timestamp: new Date(row.timestamp),
        resolved: row.resolved,
        resolutionNotes: row.resolution_notes
      }));
    } catch (error) {
      console.error('Error getting compliance violations:', error);
      return [];
    }
  }

  /**
   * Map zone from database
   */
  private mapZoneFromDb(row: any): GeofenceZone {
    return {
      id: row.id,
      zoneName: row.zone_name,
      zoneType: row.zone_type,
      centerLocation: row.center_latitude && row.center_longitude ? {
        latitude: parseFloat(row.center_latitude),
        longitude: parseFloat(row.center_longitude)
      } : undefined,
      radiusMeters: row.radius_meters,
      polygonCoordinates: row.polygon_coordinates,
      restrictions: row.restrictions,
      alertEnabled: row.alert_enabled,
      alertMessage: row.alert_message,
      active: row.active
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.activeZones.clear();
    this.userZoneStatus.clear();
  }
}

// Export singleton instance
export const geofenceService = GeofenceService.getInstance();
