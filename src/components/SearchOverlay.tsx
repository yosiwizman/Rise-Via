import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  recentSearches?: string[];
  popularSearches?: string[];
  searchResults?: any[];
}

export const SearchOverlay = ({
  isOpen,
  onClose,
  onSearch,
  recentSearches = [],
  popularSearches = ['Blue Dream', 'Gelato', 'Girl Scout Cookies', 'Gorilla Glue'],
  searchResults = []
}: SearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setIsSearching(false);
    }
  }, [isOpen]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      await onSearch(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className="bg-white dark:bg-risevia-charcoal rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Search strains, effects, or categories..."
                  className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-risevia-teal focus:ring-risevia-teal"
                  autoFocus
                />
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
          </div>

          {/* Search Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {!query && !isSearching && (
              <div className="space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Recent Searches
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickSearch(search)}
                          className="text-sm border-gray-300 hover:border-risevia-teal hover:text-risevia-teal"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Popular Searches
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch(search)}
                        className="text-sm border-gray-300 hover:border-risevia-teal hover:text-risevia-teal"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Search Tips */}
                <div className="bg-gray-50 dark:bg-risevia-black/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Tips
                  </h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Search by strain name (e.g., "Blue Dream")</li>
                    <li>• Search by effects (e.g., "relaxing", "energizing")</li>
                    <li>• Search by category (e.g., "Indica", "Sativa")</li>
                    <li>• Search by THCA potency (e.g., "high potency")</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-risevia-teal"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Searching...</span>
              </div>
            )}

            {/* Search Results */}
            {query && !isSearching && searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-risevia-black dark:text-white">
                    Search Results
                  </h3>
                  <Badge variant="secondary" className="bg-risevia-teal text-white">
                    {searchResults.length} results
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:border-risevia-teal/40 transition-colors"
                      onClick={() => {
                        onClose();
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={result.image_url}
                              alt={result.strain_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-risevia-black dark:text-white truncate">
                              {result.strain_name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                              <span>{result.category}</span>
                              <span>•</span>
                              <span>{result.volume}</span>
                              <Badge className="bg-risevia-teal text-white text-xs">
                                {result.thca_potency}% THCA
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {result.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-risevia-purple">
                              ${result.price}
                            </div>
                            {!result.in_stock && (
                              <Badge variant="destructive" className="text-xs">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try searching for different terms or browse our popular strains
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularSearches.slice(0, 3).map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSearch(search)}
                      className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
