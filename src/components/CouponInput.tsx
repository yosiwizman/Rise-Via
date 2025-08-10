import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check, X, AlertCircle, Loader2 } from 'lucide-react';

interface CouponInputProps {
  onCouponApply: (coupon: AppliedCoupon) => void;
  onCouponRemove: () => void;
  appliedCoupon?: AppliedCoupon | null;
  orderTotal: number;
  disabled?: boolean;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  onCouponApply,
  onCouponRemove,
  appliedCoupon,
  orderTotal,
  disabled = false
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateCoupon = async (code: string): Promise<AppliedCoupon | null> => {
    const mockCoupons = [
      {
        code: 'WELCOME10',
        discountType: 'percentage' as const,
        discountValue: 10,
        minOrderAmount: 50
      },
      {
        code: 'SAVE20',
        discountType: 'fixed' as const,
        discountValue: 20,
        minOrderAmount: 100
      },
      {
        code: 'FIRST15',
        discountType: 'percentage' as const,
        discountValue: 15,
        minOrderAmount: 75
      },
      {
        code: 'HEMP25',
        discountType: 'fixed' as const,
        discountValue: 25,
        minOrderAmount: 150
      }
    ];

    const coupon = mockCoupons.find(c => c.code.toLowerCase() === code.toLowerCase());
    
    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    if (orderTotal < coupon.minOrderAmount) {
      throw new Error(`Minimum order amount of $${coupon.minOrderAmount} required`);
    }

    const discountAmount = coupon.discountType === 'percentage' 
      ? (orderTotal * coupon.discountValue) / 100
      : coupon.discountValue;

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.min(discountAmount, orderTotal)
    };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validatedCoupon = await validateCoupon(couponCode.trim());
      
      if (validatedCoupon) {
        onCouponApply(validatedCoupon);
        setCouponCode('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemove();
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  if (appliedCoupon) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Coupon Applied: {appliedCoupon.code}
              </p>
              <p className="text-sm text-green-600 dark:text-green-300">
                {appliedCoupon.discountType === 'percentage' 
                  ? `${appliedCoupon.discountValue}% off`
                  : `$${appliedCoupon.discountValue} off`
                } - You save ${(typeof appliedCoupon.discountAmount === 'number' ? appliedCoupon.discountAmount : parseFloat(appliedCoupon.discountAmount) || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            disabled={disabled}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Tag className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Have a coupon code?
        </span>
      </div>
      
      <div className="flex space-x-2">
        <div className="flex-1">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter coupon code"
            disabled={disabled || isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <button
          onClick={handleApplyCoupon}
          disabled={disabled || isLoading || !couponCode.trim()}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>Popular codes: WELCOME10, SAVE20, FIRST15, HEMP25</p>
      </div>
    </div>
  );
};
