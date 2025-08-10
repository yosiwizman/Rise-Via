import React from 'react';
import { Badge } from './ui/badge';
import { Crown, Star, User } from 'lucide-react';
import { safeToFixed } from '../utils/formatters';

interface TierBadgeProps {
  tier: string;
  discount?: number;
  showDiscount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TierBadge: React.FC<TierBadgeProps> = ({ 
  tier, 
  discount, 
  showDiscount = false, 
  size = 'md' 
}) => {
  const getTierIcon = (tierName: string) => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    
    switch (tierName) {
      case 'PLATINUM': return <Crown className={`${iconSize} text-purple-600`} />;
      case 'GOLD': return <Crown className={`${iconSize} text-yellow-600`} />;
      case 'SILVER': return <Star className={`${iconSize} text-gray-600`} />;
      default: return <User className={`${iconSize} text-green-600`} />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SILVER': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const badgeSize = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-base px-4 py-2' : 'text-sm px-3 py-1';

  return (
    <Badge className={`${getTierColor(tier)} ${badgeSize} flex items-center gap-1 font-medium`}>
      {getTierIcon(tier)}
      <span>{tier} Member</span>
      {showDiscount && discount && (
        <span className="ml-1 font-bold">({safeToFixed(discount * 100, 0)}% off)</span>
      )}
    </Badge>
  );
};
