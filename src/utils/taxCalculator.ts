import { getStateTaxRate } from './stateRestrictions';

export interface TaxCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  breakdown: {
    stateTax: number;
    localTax: number;
    specialTax: number;
  };
}

export interface TaxableItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  isTaxExempt?: boolean;
}

export const taxCalculator = {
  calculateTax(
    items: TaxableItem[],
    stateCode: string,
    zipCode?: string,
    shippingCost: number = 0
  ): TaxCalculation {
    const subtotal = items.reduce((total, item) => {
      if (item.isTaxExempt) return total;
      return total + (item.price * item.quantity);
    }, 0);

    const stateTaxRate = getStateTaxRate(stateCode);
    const localTaxRate = this.getLocalTaxRate(stateCode, zipCode);
    const specialTaxRate = this.getSpecialTaxRate(items, stateCode);

    const totalTaxRate = stateTaxRate + localTaxRate + specialTaxRate;

    const taxableAmount = subtotal + (this.isShippingTaxable(stateCode) ? shippingCost : 0);
    const taxAmount = taxableAmount * totalTaxRate;

    return {
      subtotal,
      taxRate: totalTaxRate,
      taxAmount,
      total: subtotal + shippingCost + taxAmount,
      breakdown: {
        stateTax: taxableAmount * stateTaxRate,
        localTax: taxableAmount * localTaxRate,
        specialTax: taxableAmount * specialTaxRate
      }
    };
  },

  getLocalTaxRate(stateCode: string, zipCode?: string): number {
    if (!zipCode) return 0;

    const localTaxRates: Record<string, Record<string, number>> = {
      'CA': {
        '90210': 0.0275,
        '94102': 0.0275,
        '90401': 0.0275,
        '91601': 0.025
      },
      'NY': {
        '10001': 0.04875,
        '10002': 0.04875,
        '11201': 0.04875,
        '10301': 0.04875
      },
      'TX': {
        '75201': 0.02,
        '77001': 0.02,
        '78701': 0.02,
        '76101': 0.0175
      },
      'FL': {
        '33101': 0.01,
        '32801': 0.0065,
        '33301': 0.01,
        '32601': 0.0075
      },
      'IL': {
        '60601': 0.0275,
        '60602': 0.0275,
        '60603': 0.0275,
        '60604': 0.0275
      }
    };

    const stateRates = localTaxRates[stateCode.toUpperCase()];
    if (!stateRates) return 0;

    const zipPrefix = zipCode.substring(0, 5);
    return stateRates[zipPrefix] || 0;
  },

  getSpecialTaxRate(items: TaxableItem[], stateCode: string): number {
    const hasHempProducts = items.some(item => 
      item.category.toLowerCase().includes('hemp') || 
      item.category.toLowerCase().includes('cbd')
    );

    if (!hasHempProducts) return 0;

    const hempTaxRates: Record<string, number> = {
      'CA': 0.15,
      'CO': 0.15,
      'WA': 0.37,
      'OR': 0.17,
      'NV': 0.10,
      'AK': 0.50,
      'MA': 0.105,
      'ME': 0.10,
      'VT': 0.14,
      'IL': 0.25,
      'MI': 0.10,
      'NJ': 0.07,
      'NY': 0.13,
      'CT': 0.0625,
      'RI': 0.20,
      'MT': 0.20,
      'AZ': 0.16,
      'NM': 0.12,
      'VA': 0.21,
      'MO': 0.04
    };

    return hempTaxRates[stateCode.toUpperCase()] || 0;
  },

  isShippingTaxable(stateCode: string): boolean {
    const shippingTaxableStates = [
      'AR', 'CT', 'DC', 'HI', 'IN', 'KS', 'KY', 'MI', 'MS', 'NE', 
      'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'PA', 'RI', 'SD', 'TN', 
      'TX', 'UT', 'VT', 'WA', 'WV', 'WI', 'WY'
    ];

    return shippingTaxableStates.includes(stateCode.toUpperCase());
  },

  formatTaxRate(rate: number): string {
    return `${(rate * 100).toFixed(2)}%`;
  },

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  },

  getTaxSummary(calculation: TaxCalculation, stateCode: string): string[] {
    const summary: string[] = [];
    
    if (calculation.breakdown.stateTax > 0) {
      summary.push(`State tax (${stateCode}): ${this.formatCurrency(calculation.breakdown.stateTax)}`);
    }
    
    if (calculation.breakdown.localTax > 0) {
      summary.push(`Local tax: ${this.formatCurrency(calculation.breakdown.localTax)}`);
    }
    
    if (calculation.breakdown.specialTax > 0) {
      summary.push(`Hemp/CBD tax: ${this.formatCurrency(calculation.breakdown.specialTax)}`);
    }

    return summary;
  },

  isItemTaxExempt(item: TaxableItem, stateCode: string): boolean {
    const exemptCategories = ['medical', 'prescription', 'food'];
    const category = item.category.toLowerCase();
    
    if (exemptCategories.some(exempt => category.includes(exempt))) {
      return true;
    }

    const taxExemptStates = ['DE', 'MT', 'NH', 'OR'];
    if (taxExemptStates.includes(stateCode.toUpperCase())) {
      return true;
    }

    return false;
  },

  calculateItemTax(item: TaxableItem, stateCode: string, zipCode?: string): number {
    if (this.isItemTaxExempt(item, stateCode)) {
      return 0;
    }

    const itemTotal = item.price * item.quantity;
    const stateTaxRate = getStateTaxRate(stateCode);
    const localTaxRate = this.getLocalTaxRate(stateCode, zipCode);
    const specialTaxRate = this.getSpecialTaxRate([item], stateCode);

    const totalTaxRate = stateTaxRate + localTaxRate + specialTaxRate;
    return itemTotal * totalTaxRate;
  }
};

export default taxCalculator;
