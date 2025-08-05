import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface ProductFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    categories: string[];
    priceRange: [number, number];
    thcaRange: [number, number];
    inStockOnly: boolean;
    effects: string[];
  };
  onFiltersChange: (filters: any) => void;
  availableCategories: string[];
  availableEffects: string[];
}

export const ProductFilters = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableCategories,
  availableEffects
}: ProductFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    thca: true,
    stock: true,
    effects: false
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      categories: [],
      priceRange: [0, 200] as [number, number],
      thcaRange: [0, 40] as [number, number],
      inStockOnly: false,
      effects: []
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const activeFiltersCount = 
    localFilters.categories.length +
    (localFilters.inStockOnly ? 1 : 0) +
    localFilters.effects.length +
    (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 200 ? 1 : 0) +
    (localFilters.thcaRange[0] > 0 || localFilters.thcaRange[1] < 40 ? 1 : 0);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-risevia-charcoal rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-risevia-charcoal border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-risevia-purple" />
            <h2 className="text-2xl font-bold text-risevia-black dark:text-white">
              Filters
            </h2>
            {activeFiltersCount > 0 && (
              <Badge className="bg-risevia-teal text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Category Filter */}
          <Collapsible open={openSections.category} onOpenChange={() => toggleSection('category')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-risevia-black dark:text-white">
                Category
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${openSections.category ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {availableCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={localFilters.categories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleFilterChange('categories', [...localFilters.categories, category]);
                      } else {
                        handleFilterChange('categories', localFilters.categories.filter(c => c !== category));
                      }
                    }}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm">
                    {category}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Price Range Filter */}
          <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-risevia-black dark:text-white">
                Price Range
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-3">
              <div className="px-2">
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>${localFilters.priceRange[0]}</span>
                <span>${localFilters.priceRange[1]}</span>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* THCA Potency Filter */}
          <Collapsible open={openSections.thca} onOpenChange={() => toggleSection('thca')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-risevia-black dark:text-white">
                THCA Potency (%)
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${openSections.thca ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-3">
              <div className="px-2">
                <Slider
                  value={localFilters.thcaRange}
                  onValueChange={(value) => handleFilterChange('thcaRange', value as [number, number])}
                  max={40}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{localFilters.thcaRange[0]}%</span>
                <span>{localFilters.thcaRange[1]}%</span>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Stock Filter */}
          <Collapsible open={openSections.stock} onOpenChange={() => toggleSection('stock')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-risevia-black dark:text-white">
                Availability
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${openSections.stock ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock-only"
                  checked={localFilters.inStockOnly}
                  onCheckedChange={(checked) => handleFilterChange('inStockOnly', checked)}
                />
                <Label htmlFor="in-stock-only" className="text-sm">
                  In stock only
                </Label>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Effects Filter */}
          {availableEffects.length > 0 && (
            <Collapsible open={openSections.effects} onOpenChange={() => toggleSection('effects')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h3 className="text-lg font-semibold text-risevia-black dark:text-white">
                  Effects
                </h3>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.effects ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {availableEffects.map((effect) => (
                  <div key={effect} className="flex items-center space-x-2">
                    <Checkbox
                      id={`effect-${effect}`}
                      checked={localFilters.effects.includes(effect)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleFilterChange('effects', [...localFilters.effects, effect]);
                        } else {
                          handleFilterChange('effects', localFilters.effects.filter(e => e !== effect));
                        }
                      }}
                    />
                    <Label htmlFor={`effect-${effect}`} className="text-sm">
                      {effect}
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-risevia-charcoal border-t p-6 space-y-3">
          <Button
            onClick={handleApplyFilters}
            className="w-full neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold"
          >
            Apply Filters
          </Button>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Reset All
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
