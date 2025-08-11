import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface SearchFiltersProps {
  onSearch: (term: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onSort: (sortBy: string) => void;
}

interface FilterOptions {
  strainType?: string;
  thcaRange?: { min: number; max: number };
  effects?: string[];
  priceRange?: { min: number; max: number };
  category?: string;
  sortBy?: string;
}

const STRAIN_TYPES = ['all', 'indica', 'sativa', 'hybrid'];
const EFFECTS = ['relaxation', 'energy', 'creativity', 'focus', 'pain-relief', 'sleep', 'appetite', 'mood-boost', 'stress-relief', 'euphoria'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'thca', label: 'THCA %' },
  { value: 'popularity', label: 'Popularity' }
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  onFilter,
  onSort
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    strainType: 'all',
    thcaRange: { min: 0, max: 40 },
    effects: [],
    priceRange: { min: 0, max: 100 },
    category: 'all'
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string | number[] | { min: number; max: number } | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleEffectToggle = (effect: string) => {
    const currentEffects = filters.effects || [];
    const newEffects = currentEffects.includes(effect)
      ? currentEffects.filter((e: string) => e !== effect)
      : [...currentEffects, effect];
    
    handleFilterChange('effects', newEffects);
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      strainType: 'all',
      thcaRange: { min: 0, max: 40 },
      effects: [],
      priceRange: { min: 0, max: 100 },
      category: 'all'
    };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return false;
    return value !== 'all' && value !== '';
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search strains by name, effects, or description..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          <Select onValueChange={(value: string) => onSort(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Filters</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Strain Type</label>
                  <Select
                    value={filters.strainType}
                    onValueChange={(value: string) => handleFilterChange('strainType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STRAIN_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type && typeof type === 'string' ? type.charAt(0).toUpperCase() + type.slice(1) : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    THCA Range: {filters.thcaRange?.min}% - {filters.thcaRange?.max}%
                  </label>
                  <Slider
                    value={[filters.thcaRange?.min || 0, filters.thcaRange?.max || 40]}
                    onValueChange={([min, max]: number[]) => handleFilterChange('thcaRange', { min, max })}
                    max={40}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price Range: ${filters.priceRange?.min} - ${filters.priceRange?.max}
                  </label>
                  <Slider
                    value={[filters.priceRange?.min || 0, filters.priceRange?.max || 100]}
                    onValueChange={([min, max]: number[]) => handleFilterChange('priceRange', { min, max })}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Effects</label>
                <div className="flex flex-wrap gap-2">
                  {EFFECTS.map(effect => (
                    <Badge
                      key={effect}
                      variant={filters.effects?.includes(effect) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => handleEffectToggle(effect)}
                    >
                      {effect}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
