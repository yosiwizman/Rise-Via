import { geocodeService } from '../services/GeocodeService';
import { territoryService } from '../services/TerritoryService';

export interface TerritoryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ZipCodeValidation {
  zipCode: string;
  isValid: boolean;
  state?: string;
  conflictingTerritoryId?: string;
  conflictingTerritoryName?: string;
}

/**
 * Validate territory data before creation or update
 */
export async function validateTerritory(
  name: string,
  zipCodes: string[],
  state: string,
  excludeTerritoryId?: string
): Promise<TerritoryValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate name
  if (!name || name.trim().length < 3) {
    errors.push('Territory name must be at least 3 characters long');
  }

  // Validate state
  const validStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  if (!validStates.includes(state)) {
    errors.push('Invalid state code');
  }

  // Validate ZIP codes
  if (!zipCodes || zipCodes.length === 0) {
    errors.push('Territory must have at least one ZIP code');
  } else {
    const zipValidations = await validateZipCodes(zipCodes, state, excludeTerritoryId);
    
    zipValidations.forEach(validation => {
      if (!validation.isValid) {
        errors.push(`Invalid ZIP code format: ${validation.zipCode}`);
      }
      
      if (validation.state && validation.state !== state) {
        warnings.push(`ZIP code ${validation.zipCode} typically belongs to ${validation.state}, not ${state}`);
      }
      
      if (validation.conflictingTerritoryId) {
        errors.push(`ZIP code ${validation.zipCode} is already assigned to territory: ${validation.conflictingTerritoryName}`);
      }
    });
  }

  // Check for non-contiguous territories
  if (zipCodes.length > 1) {
    const isContiguous = await checkTerritoryContiguity(zipCodes);
    if (!isContiguous) {
      warnings.push('Territory ZIP codes may not be contiguous. Consider splitting into multiple territories.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate individual ZIP codes
 */
export async function validateZipCodes(
  zipCodes: string[],
  expectedState?: string,
  excludeTerritoryId?: string
): Promise<ZipCodeValidation[]> {
  const validations: ZipCodeValidation[] = [];

  for (const zipCode of zipCodes) {
    const validation: ZipCodeValidation = {
      zipCode,
      isValid: geocodeService.isValidZipCode(zipCode)
    };

    if (validation.isValid) {
      // Check state match
      const state = geocodeService.getStateFromZipCode(zipCode);
      if (state) {
        validation.state = state;
      }

      // Check for conflicts
      const conflicts = await territoryService.checkZipCodeConflicts([zipCode], excludeTerritoryId);
      if (conflicts.length > 0) {
        const conflictingTerritory = await territoryService.findTerritoryByZipCode(zipCode);
        if (conflictingTerritory) {
          validation.conflictingTerritoryId = conflictingTerritory.id;
          validation.conflictingTerritoryName = conflictingTerritory.name;
        }
      }
    }

    validations.push(validation);
  }

  return validations;
}

/**
 * Check if ZIP codes form a contiguous territory
 */
export async function checkTerritoryContiguity(zipCodes: string[]): Promise<boolean> {
  if (zipCodes.length <= 1) return true;

  // Simple check based on ZIP code proximity
  // In production, this would use actual geographic data
  const sortedZips = zipCodes.map(z => parseInt(z)).sort((a, b) => a - b);
  
  for (let i = 1; i < sortedZips.length; i++) {
    const diff = sortedZips[i] - sortedZips[i - 1];
    // If ZIP codes differ by more than 100, they might not be contiguous
    if (diff > 100) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate territory overlap percentage
 */
export function calculateTerritoryOverlap(
  territory1ZipCodes: string[],
  territory2ZipCodes: string[]
): number {
  const set1 = new Set(territory1ZipCodes);
  const set2 = new Set(territory2ZipCodes);
  
  let overlapCount = 0;
  for (const zip of set1) {
    if (set2.has(zip)) {
      overlapCount++;
    }
  }

  const totalUnique = new Set([...territory1ZipCodes, ...territory2ZipCodes]).size;
  return totalUnique > 0 ? (overlapCount / totalUnique) * 100 : 0;
}

/**
 * Suggest territory boundaries based on geographic data
 */
export async function suggestTerritoryBoundaries(
  centerZipCode: string,
  radiusKm: number = 50
): Promise<string[]> {
  try {
    const suggestedZips = await geocodeService.getZipCodesInRadius(centerZipCode, radiusKm);
    
    // Filter out already assigned ZIP codes
    const availableZips: string[] = [];
    for (const zip of suggestedZips) {
      const conflicts = await territoryService.checkZipCodeConflicts([zip]);
      if (conflicts.length === 0) {
        availableZips.push(zip);
      }
    }

    return availableZips;
  } catch (error) {
    console.error('Error suggesting territory boundaries:', error);
    return [];
  }
}

/**
 * Validate territory assignment rules
 */
export async function validateTerritoryAssignment(
  territoryId: string,
  repId: string
): Promise<TerritoryValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check if territory exists
    const territory = await territoryService.getTerritoryById(territoryId);
    if (!territory) {
      errors.push('Territory not found');
      return { isValid: false, errors, warnings };
    }

    // Check if territory is already assigned
    if (territory.assigned_rep_id && territory.status === 'protected') {
      errors.push('Territory is already protected and cannot be reassigned without admin approval');
    }

    // Check rep's current territory count
    const repTerritories = await territoryService.getRepTerritories(repId);
    if (repTerritories.length >= 10) {
      warnings.push('Sales rep already manages 10 or more territories. Consider load balancing.');
    }

    // Check for adjacent territories
    const hasAdjacentTerritory = repTerritories.some(t => {
      const overlap = calculateTerritoryOverlap(t.zip_codes, territory.zip_codes);
      return overlap > 0;
    });

    if (!hasAdjacentTerritory && repTerritories.length > 0) {
      warnings.push('This territory is not adjacent to rep\'s existing territories. Consider assigning contiguous areas.');
    }

  } catch (error) {
    errors.push('Error validating territory assignment');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate optimal territory size based on market data
 */
export function calculateOptimalTerritorySize(
  populationDensity: number,
  marketPotential: number,
  competitionLevel: number
): { minZipCodes: number; maxZipCodes: number; recommended: number } {
  // Base calculation on market factors
  const baseSizeMultiplier = 1 / (populationDensity / 1000);
  const marketMultiplier = marketPotential / 100;
  const competitionMultiplier = 1 + (competitionLevel / 100);

  const recommended = Math.round(10 * baseSizeMultiplier * marketMultiplier * competitionMultiplier);
  
  return {
    minZipCodes: Math.max(3, Math.round(recommended * 0.7)),
    maxZipCodes: Math.round(recommended * 1.5),
    recommended: recommended
  };
}
