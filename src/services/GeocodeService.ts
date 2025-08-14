import { territoryService } from './TerritoryService';

interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

interface AddressComponents {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

class GeocodeService {
  private static instance: GeocodeService;
  private geocodeCache: Map<string, GeocodeResult> = new Map();

  public static getInstance(): GeocodeService {
    if (!GeocodeService.instance) {
      GeocodeService.instance = new GeocodeService();
    }
    return GeocodeService.instance;
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    // Check cache first
    if (this.geocodeCache.has(address)) {
      return this.geocodeCache.get(address)!;
    }

    try {
      // In production, you would use a real geocoding service like Google Maps or Mapbox
      // For now, returning mock data
      const mockResult: GeocodeResult = {
        lat: 40.7128 + Math.random() * 0.1,
        lng: -74.0060 + Math.random() * 0.1,
        formatted_address: address,
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postal_code: '10001'
      };

      this.geocodeCache.set(address, mockResult);
      return mockResult;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<AddressComponents | null> {
    try {
      // Mock implementation
      return {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA'
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Get ZIP code from coordinates
   */
  async getZipCodeFromCoordinates(lat: number, lng: number): Promise<string | null> {
    const address = await this.reverseGeocode(lat, lng);
    return address?.postal_code || null;
  }

  /**
   * Find territory for a given address
   */
  async findTerritoryForAddress(address: string): Promise<string | null> {
    const geocoded = await this.geocodeAddress(address);
    if (!geocoded || !geocoded.postal_code) {
      return null;
    }

    const territory = await territoryService.findTerritoryByZipCode(geocoded.postal_code);
    return territory?.id || null;
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if a point is within a polygon boundary
   */
  isPointInPolygon(lat: number, lng: number, polygon: number[][][]): boolean {
    let inside = false;
    const point = [lng, lat];
    const vs = polygon[0]; // Assuming simple polygon without holes

    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];

      const intersect = ((yi > point[1]) !== (yj > point[1]))
        && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Get all ZIP codes within a radius
   */
  async getZipCodesInRadius(centerZip: string, radiusKm: number): Promise<string[]> {
    // This would require a ZIP code database with coordinates
    // Mock implementation
    const basecode = parseInt(centerZip);
    const zipCodes: string[] = [];
    
    for (let i = -5; i <= 5; i++) {
      if (i !== 0) {
        zipCodes.push((basecode + i).toString().padStart(5, '0'));
      }
    }
    
    return zipCodes;
  }

  /**
   * Validate ZIP code format
   */
  isValidZipCode(zipCode: string): boolean {
    // US ZIP code validation (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  }

  /**
   * Get state from ZIP code
   */
  getStateFromZipCode(zipCode: string): string | null {
    // Simplified ZIP code to state mapping
    const firstThree = parseInt(zipCode.substring(0, 3));
    
    if (firstThree >= 10 && firstThree <= 27) return 'MA';
    if (firstThree >= 28 && firstThree <= 29) return 'RI';
    if (firstThree >= 30 && firstThree <= 38) return 'NH';
    if (firstThree >= 39 && firstThree <= 49) return 'ME';
    if (firstThree >= 50 && firstThree <= 59) return 'VT';
    if (firstThree >= 60 && firstThree <= 69) return 'CT';
    if (firstThree >= 70 && firstThree <= 89) return 'NJ';
    if (firstThree >= 100 && firstThree <= 149) return 'NY';
    if (firstThree >= 150 && firstThree <= 196) return 'PA';
    if (firstThree >= 197 && firstThree <= 199) return 'DE';
    if (firstThree >= 200 && firstThree <= 219) return 'DC';
    if (firstThree >= 220 && firstThree <= 246) return 'MD';
    if (firstThree >= 247 && firstThree <= 269) return 'WV';
    if (firstThree >= 270 && firstThree <= 289) return 'NC';
    if (firstThree >= 290 && firstThree <= 299) return 'SC';
    if (firstThree >= 300 && firstThree <= 319) return 'GA';
    if (firstThree >= 320 && firstThree <= 349) return 'FL';
    if (firstThree >= 350 && firstThree <= 369) return 'AL';
    if (firstThree >= 370 && firstThree <= 385) return 'TN';
    if (firstThree >= 386 && firstThree <= 397) return 'MS';
    if (firstThree >= 400 && firstThree <= 427) return 'KY';
    if (firstThree >= 430 && firstThree <= 458) return 'OH';
    if (firstThree >= 460 && firstThree <= 479) return 'IN';
    if (firstThree >= 480 && firstThree <= 499) return 'MI';
    if (firstThree >= 500 && firstThree <= 528) return 'IA';
    if (firstThree >= 530 && firstThree <= 549) return 'WI';
    if (firstThree >= 550 && firstThree <= 567) return 'MN';
    if (firstThree >= 570 && firstThree <= 577) return 'SD';
    if (firstThree >= 580 && firstThree <= 588) return 'ND';
    if (firstThree >= 590 && firstThree <= 599) return 'MT';
    if (firstThree >= 600 && firstThree <= 629) return 'IL';
    if (firstThree >= 630 && firstThree <= 658) return 'MO';
    if (firstThree >= 660 && firstThree <= 679) return 'KS';
    if (firstThree >= 680 && firstThree <= 693) return 'NE';
    if (firstThree >= 700 && firstThree <= 714) return 'LA';
    if (firstThree >= 716 && firstThree <= 729) return 'AR';
    if (firstThree >= 730 && firstThree <= 749) return 'OK';
    if (firstThree >= 750 && firstThree <= 799) return 'TX';
    if (firstThree >= 800 && firstThree <= 816) return 'CO';
    if (firstThree >= 820 && firstThree <= 831) return 'WY';
    if (firstThree >= 832 && firstThree <= 838) return 'ID';
    if (firstThree >= 840 && firstThree <= 847) return 'UT';
    if (firstThree >= 850 && firstThree <= 865) return 'AZ';
    if (firstThree >= 870 && firstThree <= 884) return 'NM';
    if (firstThree >= 889 && firstThree <= 898) return 'NV';
    if (firstThree >= 900 && firstThree <= 961) return 'CA';
    if (firstThree >= 967 && firstThree <= 968) return 'HI';
    if (firstThree >= 970 && firstThree <= 979) return 'OR';
    if (firstThree >= 980 && firstThree <= 994) return 'WA';
    if (firstThree >= 995 && firstThree <= 999) return 'AK';
    
    return null;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// Export singleton instance
export const geocodeService = GeocodeService.getInstance();
