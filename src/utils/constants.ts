export const BLOCKED_STATES = [
  "ID", "SD", "MS", "OR", "AK", "AR", "CO", "DE", "HI", "IN", 
  "IA", "KS", "KY", "LA", "MD", "MT", "NH", "NY", "NC", "RI", 
  "UT", "VT", "VA"
];

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" }
];

export const COMPLIANCE_WARNINGS = {
  DRUG_TEST: "May cause a positive drug test",
  CHILDREN_PETS: "Keep out of reach of children and pets",
  DRIVING: "Do not drive or operate machinery",
  PREGNANCY: "Not for use by pregnant or nursing women",
  FDA_DISCLAIMER: "This product has not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.",
  THC_DISCLAIMER: "This product contains less than 0.3% Delta-9 THC on a dry weight basis as required by federal law. THCA converts to THC when heated.",
  STORAGE: "Store in a cool, dry place away from direct sunlight",
  AGE_RESTRICTION: "For use by adults 21 years of age and older only"
};

export const LEGAL_TEXT = {
  PRIVACY_POLICY: `
    Privacy Policy for RiseViA Cannabis Products
    
    Last Updated: ${new Date().toLocaleDateString()}
    
    1. Information We Collect
    We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include your name, email address, phone number, shipping address, and payment information.
    
    2. Cannabis-Specific Data Handling
    Due to the nature of our cannabis products, we maintain strict data security protocols and comply with all applicable state and federal regulations regarding cannabis commerce.
    
    3. Data Retention
    We retain your personal information for 3-7 years as required by cannabis industry regulations and for business purposes.
    
    4. No Data Resale
    We do not sell, rent, or share your personal information with third parties for marketing purposes.
    
    5. Security
    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
    
    6. Your Rights
    You have the right to access, update, or delete your personal information. Contact us at privacy@risevia.com for any privacy-related requests.
  `,
  TERMS_CONDITIONS: `
    Terms and Conditions for RiseViA Cannabis Products
    
    Last Updated: ${new Date().toLocaleDateString()}
    
    1. Age Requirement
    You must be at least 21 years of age to purchase or use our products.
    
    2. Product Information
    All products contain less than 0.3% Delta-9 THC on a dry weight basis. THCA converts to THC when heated through decarboxylation.
    
    3. Shipping Restrictions
    We cannot ship to certain states where THCA products are prohibited. Please check your local laws before ordering.
    
    4. Medical Disclaimer
    Our products are not intended to diagnose, treat, cure, or prevent any disease. Consult with a healthcare professional before use.
    
    5. Liability
    You assume all risks associated with the use of our products. We are not liable for any adverse effects.
    
    6. Returns and Refunds
    Due to the nature of cannabis products, all sales are final. Products cannot be returned once shipped.
  `
};
