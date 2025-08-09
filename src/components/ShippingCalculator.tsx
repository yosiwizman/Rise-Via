import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Clock, DollarSign } from 'lucide-react';
import { getStateRestriction, canShipToState } from '../utils/stateRestrictions';

interface ShippingCalculatorProps {
  cartItems: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    weight?: number;
  }>;
  destinationState: string;
  destinationZip?: string;
  onShippingCalculated?: (shippingCost: number, method: ShippingMethod | null) => void;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
  carrier: string;
  trackingIncluded: boolean;
  insuranceIncluded: boolean;
}

export const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  cartItems,
  destinationState,
  destinationZip,
  onShippingCalculated
}) => {
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [shippingRestrictions, setShippingRestrictions] = useState<string[]>([]);

  const calculateWeight = useCallback((): number => {
    return cartItems.reduce((total, item) => {
      const itemWeight = item.weight || 0.5;
      return total + (itemWeight * item.quantity);
    }, 0);
  }, [cartItems]);

  const calculateDistance = (zipCode: string): number => {
    if (!zipCode) return 1000;
    
    const zip = parseInt(zipCode);
    if (zip >= 10000 && zip <= 19999) return 500;
    if (zip >= 20000 && zip <= 39999) return 800;
    if (zip >= 40000 && zip <= 59999) return 600;
    if (zip >= 60000 && zip <= 79999) return 1200;
    if (zip >= 80000 && zip <= 99999) return 1800;
    return 1000;
  };

  const getShippingMethods = (weight: number, distance: number, state: string): ShippingMethod[] => {
    const stateRestriction = getStateRestriction(state);
    const baseRate = 8.99;
    const weightMultiplier = Math.max(1, Math.ceil(weight / 2));
    const distanceMultiplier = distance > 1000 ? 1.5 : 1.2;

    const methods: ShippingMethod[] = [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Reliable delivery with tracking',
        cost: baseRate * weightMultiplier * distanceMultiplier,
        estimatedDays: distance > 1500 ? '5-7 business days' : '3-5 business days',
        carrier: 'USPS',
        trackingIncluded: true,
        insuranceIncluded: false
      },
      {
        id: 'expedited',
        name: 'Expedited Shipping',
        description: 'Faster delivery with priority handling',
        cost: (baseRate * 2.2) * weightMultiplier * distanceMultiplier,
        estimatedDays: distance > 1500 ? '3-4 business days' : '2-3 business days',
        carrier: 'UPS',
        trackingIncluded: true,
        insuranceIncluded: true
      },
      {
        id: 'overnight',
        name: 'Overnight Express',
        description: 'Next business day delivery',
        cost: (baseRate * 4.5) * weightMultiplier * distanceMultiplier,
        estimatedDays: '1 business day',
        carrier: 'FedEx',
        trackingIncluded: true,
        insuranceIncluded: true
      }
    ];

    if (stateRestriction?.isRestricted) {
      return methods.map(method => ({
        ...method,
        cost: method.cost * 1.3,
        description: `${method.description} (Restricted state surcharge applied)`
      }));
    }

    return methods;
  };

  const checkShippingRestrictions = useCallback((): string[] => {
    const restrictions: string[] = [];
    const stateRestriction = getStateRestriction(destinationState);

    if (!stateRestriction) {
      restrictions.push('Unable to verify shipping restrictions for this state');
      return restrictions;
    }

    if (stateRestriction.isRestricted) {
      restrictions.push(`${stateRestriction.name} has shipping restrictions for certain products`);
    }

    cartItems.forEach(item => {
      const category = item.category.toLowerCase();
      if (!canShipToState(destinationState, category as keyof typeof stateRestriction.shippingRestrictions)) {
        restrictions.push(`${item.name} cannot be shipped to ${stateRestriction.name}`);
      }
    });

    return restrictions;
  }, [cartItems, destinationState]);

  const calculateShippingWithDeps = useCallback(() => {
    const weight = calculateWeight();
    const restrictions = checkShippingRestrictions();
    
    if (restrictions.length > 0) {
      setShippingRestrictions(restrictions);
      setShippingMethods([]);
      setSelectedMethod(null);
      onShippingCalculated?.(0, null);
      return;
    }

    const distance = calculateDistance(destinationZip || '');
    const methods = getShippingMethods(weight, distance, destinationState);
    setShippingMethods(methods);
    setShippingRestrictions([]);
    
    if (methods.length > 0 && !selectedMethod) {
      setSelectedMethod(methods[0]);
      onShippingCalculated?.(methods[0].cost, methods[0]);
    }
  }, [destinationState, destinationZip, calculateWeight, checkShippingRestrictions, onShippingCalculated, selectedMethod]);

  useEffect(() => {
    if (!destinationState) return;

    setIsCalculating(true);
    
    setTimeout(() => {
      calculateShippingWithDeps();
      setIsCalculating(false);
    }, 1500);
  }, [destinationState, destinationZip, cartItems, calculateShippingWithDeps]);

  const handleMethodSelect = (method: ShippingMethod) => {
    setSelectedMethod(method);
    onShippingCalculated?.(method.cost, method);
  };

  if (isCalculating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center mb-4">
          <Truck className="w-6 h-6 text-green-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Calculating Shipping
          </h3>
        </div>
        
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Calculating shipping options for {destinationState}...
          </span>
        </div>
      </motion.div>
    );
  }

  if (shippingRestrictions.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
      >
        <div className="flex items-center mb-4">
          <MapPin className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Shipping Restrictions
          </h3>
        </div>
        
        <div className="space-y-2">
          {shippingRestrictions.map((restriction, index) => (
            <p key={index} className="text-sm text-red-600 dark:text-red-400">
              • {restriction}
            </p>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            Please review your cart items or contact customer support for assistance with shipping to your location.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center mb-6">
        <Truck className="w-6 h-6 text-green-500 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Shipping Options
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Shipping to {destinationState} {destinationZip && `(${destinationZip})`}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {shippingMethods.map((method) => (
          <motion.div
            key={method.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedMethod?.id === method.id
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700'
            }`}
            onClick={() => handleMethodSelect(method)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    checked={selectedMethod?.id === method.id}
                    onChange={() => handleMethodSelect(method)}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </p>
                  </div>
                </div>
                
                <div className="ml-7 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {method.estimatedDays}
                  </div>
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-1" />
                    {method.carrier}
                  </div>
                  {method.trackingIncluded && (
                    <span className="text-green-600 dark:text-green-400 text-xs">
                      Tracking included
                    </span>
                  )}
                  {method.insuranceIncluded && (
                    <span className="text-blue-600 dark:text-blue-400 text-xs">
                      Insurance included
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <DollarSign className="w-5 h-5" />
                  {method.cost.toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>{selectedMethod.name}</strong> selected - ${selectedMethod.cost.toFixed(2)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Estimated delivery: {selectedMethod.estimatedDays}
          </p>
        </motion.div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          Shipping costs are calculated based on package weight ({calculateWeight().toFixed(1)} lbs), 
          destination, and selected service level. All shipments include tracking information.
        </p>
      </div>
    </motion.div>
  );
};
