interface StateRestriction {
  code: string;
  name: string;
  isRestricted: boolean;
  allowedProducts: string[];
  shippingRestrictions: {
    hemp: boolean;
    cbd: boolean;
    delta8: boolean;
    delta9: boolean;
  };
  ageRequirement: number;
  taxRate: number;
}

export const STATE_RESTRICTIONS: Record<string, StateRestriction> = {
  'AL': {
    code: 'AL',
    name: 'Alabama',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.04
  },
  'AK': {
    code: 'AK',
    name: 'Alaska',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.00
  },
  'AZ': {
    code: 'AZ',
    name: 'Arizona',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.056
  },
  'AR': {
    code: 'AR',
    name: 'Arkansas',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.065
  },
  'CA': {
    code: 'CA',
    name: 'California',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.0725
  },
  'CO': {
    code: 'CO',
    name: 'Colorado',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.029
  },
  'CT': {
    code: 'CT',
    name: 'Connecticut',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.0635
  },
  'DE': {
    code: 'DE',
    name: 'Delaware',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.00
  },
  'FL': {
    code: 'FL',
    name: 'Florida',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.06
  },
  'GA': {
    code: 'GA',
    name: 'Georgia',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.04
  },
  'HI': {
    code: 'HI',
    name: 'Hawaii',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.04
  },
  'ID': {
    code: 'ID',
    name: 'Idaho',
    isRestricted: true,
    allowedProducts: [],
    shippingRestrictions: {
      hemp: false,
      cbd: false,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.06
  },
  'IL': {
    code: 'IL',
    name: 'Illinois',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.0625
  },
  'IN': {
    code: 'IN',
    name: 'Indiana',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.07
  },
  'IA': {
    code: 'IA',
    name: 'Iowa',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.06
  },
  'KS': {
    code: 'KS',
    name: 'Kansas',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.065
  },
  'KY': {
    code: 'KY',
    name: 'Kentucky',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.06
  },
  'LA': {
    code: 'LA',
    name: 'Louisiana',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.0445
  },
  'ME': {
    code: 'ME',
    name: 'Maine',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.055
  },
  'MD': {
    code: 'MD',
    name: 'Maryland',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.06
  },
  'MA': {
    code: 'MA',
    name: 'Massachusetts',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.0625
  },
  'MI': {
    code: 'MI',
    name: 'Michigan',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.06
  },
  'MN': {
    code: 'MN',
    name: 'Minnesota',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.06875
  },
  'MS': {
    code: 'MS',
    name: 'Mississippi',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.07
  },
  'MO': {
    code: 'MO',
    name: 'Missouri',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.04225
  },
  'MT': {
    code: 'MT',
    name: 'Montana',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.00
  },
  'NE': {
    code: 'NE',
    name: 'Nebraska',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.055
  },
  'NV': {
    code: 'NV',
    name: 'Nevada',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.0685
  },
  'NH': {
    code: 'NH',
    name: 'New Hampshire',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.00
  },
  'NJ': {
    code: 'NJ',
    name: 'New Jersey',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.06625
  },
  'NM': {
    code: 'NM',
    name: 'New Mexico',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.05125
  },
  'NY': {
    code: 'NY',
    name: 'New York',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.08
  },
  'NC': {
    code: 'NC',
    name: 'North Carolina',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.0475
  },
  'ND': {
    code: 'ND',
    name: 'North Dakota',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.05
  },
  'OH': {
    code: 'OH',
    name: 'Ohio',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.0575
  },
  'OK': {
    code: 'OK',
    name: 'Oklahoma',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.045
  },
  'OR': {
    code: 'OR',
    name: 'Oregon',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.00
  },
  'PA': {
    code: 'PA',
    name: 'Pennsylvania',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.06
  },
  'RI': {
    code: 'RI',
    name: 'Rhode Island',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.07
  },
  'SC': {
    code: 'SC',
    name: 'South Carolina',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.06
  },
  'SD': {
    code: 'SD',
    name: 'South Dakota',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.045
  },
  'TN': {
    code: 'TN',
    name: 'Tennessee',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.07
  },
  'TX': {
    code: 'TX',
    name: 'Texas',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.0625
  },
  'UT': {
    code: 'UT',
    name: 'Utah',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.0485
  },
  'VT': {
    code: 'VT',
    name: 'Vermont',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.06
  },
  'VA': {
    code: 'VA',
    name: 'Virginia',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.053
  },
  'WA': {
    code: 'WA',
    name: 'Washington',
    isRestricted: false,
    allowedProducts: ['hemp', 'cbd', 'delta8', 'delta9'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: true,
      delta9: true
    },
    ageRequirement: 21,
    taxRate: 0.065
  },
  'WV': {
    code: 'WV',
    name: 'West Virginia',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.06
  },
  'WI': {
    code: 'WI',
    name: 'Wisconsin',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.05
  },
  'WY': {
    code: 'WY',
    name: 'Wyoming',
    isRestricted: true,
    allowedProducts: ['hemp', 'cbd'],
    shippingRestrictions: {
      hemp: true,
      cbd: true,
      delta8: false,
      delta9: false
    },
    ageRequirement: 21,
    taxRate: 0.04
  }
};

export const getStateRestriction = (stateCode: string): StateRestriction | null => {
  return STATE_RESTRICTIONS[stateCode.toUpperCase()] || null;
};

export const isProductAllowedInState = (stateCode: string, productCategory: string): boolean => {
  const restriction = getStateRestriction(stateCode);
  if (!restriction) return false;
  return restriction.allowedProducts.includes(productCategory.toLowerCase());
};

export const canShipToState = (stateCode: string, productType: keyof StateRestriction['shippingRestrictions']): boolean => {
  const restriction = getStateRestriction(stateCode);
  if (!restriction) return false;
  return restriction.shippingRestrictions[productType];
};

export const getStateTaxRate = (stateCode: string): number => {
  const restriction = getStateRestriction(stateCode);
  return restriction?.taxRate || 0;
};

export const getStateAgeRequirement = (stateCode: string): number => {
  const restriction = getStateRestriction(stateCode);
  return restriction?.ageRequirement || 21;
};

export const getRestrictedStates = (): StateRestriction[] => {
  return Object.values(STATE_RESTRICTIONS).filter(state => state.isRestricted);
};

export const getAllowedStates = (): StateRestriction[] => {
  return Object.values(STATE_RESTRICTIONS).filter(state => !state.isRestricted);
};
