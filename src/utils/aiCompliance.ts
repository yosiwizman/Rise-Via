export const COMPLIANCE_RULES = {
  REQUIRED_DISCLAIMERS: [
    "This product has not been evaluated by the FDA.",
    "Not for use by minors, pregnant or nursing women.",
    "Keep out of reach of children and pets.",
    "Educational information only, not medical advice."
  ],
  
  FORBIDDEN_TERMS: [
    'cure', 'treat', 'medicine', 'medical', 'therapy', 'therapeutic',
    'heal', 'disease', 'illness', 'prescription', 'doctor recommends'
  ],
  
  AGE_RESTRICTIONS: {
    minimumAge: 21,
    warningText: "For use by adults 21 years of age and older only."
  },
  
  STATE_RESTRICTIONS: [
    'ID', 'KS', 'NE', 'NC', 'SC', 'TN', 'WY'
  ]
};

export const validateContent = (content: string): {
  isCompliant: boolean;
  violations: string[];
  suggestions: string[];
} => {
  const violations: string[] = [];
  const suggestions: string[] = [];
  const lowerContent = content.toLowerCase();

  COMPLIANCE_RULES.FORBIDDEN_TERMS.forEach(term => {
    if (lowerContent.includes(term)) {
      violations.push(`Contains forbidden term: "${term}"`);
      suggestions.push(`Replace "${term}" with educational language`);
    }
  });

  const hasDisclaimer = COMPLIANCE_RULES.REQUIRED_DISCLAIMERS.some(disclaimer => 
    content.includes(disclaimer)
  );

  if (!hasDisclaimer) {
    violations.push('Missing required compliance disclaimer');
    suggestions.push('Add FDA disclaimer and age restriction notice');
  }

  if (lowerContent.includes('medical') && !lowerContent.includes('not medical advice')) {
    violations.push('Medical claims without proper disclaimer');
    suggestions.push('Add "not medical advice" disclaimer');
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    suggestions
  };
};

export const addComplianceDisclaimer = (content: string): string => {
  const disclaimer = `

${COMPLIANCE_RULES.REQUIRED_DISCLAIMERS.join(' ')} ${COMPLIANCE_RULES.AGE_RESTRICTIONS.warningText}`;

  if (content.includes('This product has not been evaluated')) {
    return content;
  }

  return content + disclaimer;
};

export const sanitizeAIResponse = (response: string): string => {
  let sanitized = response;

  COMPLIANCE_RULES.FORBIDDEN_TERMS.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    sanitized = sanitized.replace(regex, (match) => {
      switch (match.toLowerCase()) {
        case 'cure': return 'support';
        case 'treat': return 'may help with';
        case 'medicine': return 'wellness product';
        case 'medical': return 'wellness';
        case 'therapy': return 'wellness routine';
        case 'therapeutic': return 'beneficial';
        case 'heal': return 'support';
        default: return 'wellness';
      }
    });
  });

  return addComplianceDisclaimer(sanitized);
};
