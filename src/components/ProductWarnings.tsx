import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { COMPLIANCE_WARNINGS } from '../utils/constants';

interface ProductWarningsProps {
  placement: 'product' | 'cart' | 'checkout';
  compact?: boolean;
}

export const ProductWarnings = ({ placement, compact = false }: ProductWarningsProps) => {
  const getWarningsForPlacement = () => {
    const allWarnings = Object.values(COMPLIANCE_WARNINGS);
    
    switch (placement) {
      case 'product':
        return [
          COMPLIANCE_WARNINGS.AGE_RESTRICTION,
          COMPLIANCE_WARNINGS.DRUG_TEST,
          COMPLIANCE_WARNINGS.CHILDREN_PETS
        ];
      case 'cart':
        return [
          COMPLIANCE_WARNINGS.AGE_RESTRICTION,
          COMPLIANCE_WARNINGS.THC_DISCLAIMER,
          COMPLIANCE_WARNINGS.FDA_DISCLAIMER
        ];
      case 'checkout':
        return allWarnings;
      default:
        return allWarnings;
    }
  };

  const warnings = getWarningsForPlacement();

  if (compact) {
    return (
      <Alert className="compliance-warning border-red-500 mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-white text-sm">
          <div className="space-y-1">
            {(Array.isArray(warnings) ? warnings.slice(0, 2) : []).map((warning, index) => (
              <div key={index}>⚠️ {warning}</div>
            ))}
            {warnings.length > 2 && (
              <div className="text-xs text-gray-300">
                +{warnings.length - 2} more warnings apply
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2 mb-4">
      {warnings.map((warning, index) => (
        <Alert key={index} className="compliance-warning border-red-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-white text-sm">
            ⚠️ {warning}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
