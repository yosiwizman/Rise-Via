import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../types/navigation';
import type { Product } from '../types/shared';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { api } from '../services/api';

type SortOption = 'name' | 'price-low' | 'price-high' | 'thca-high' | 'thca-low' | 'popularity';
type ViewMode = 'grid' | 'list';

export default function ShopScreen({ navigation }: { navigation: NavigationProp<MainTabParamList> }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [thcaRange, setThcaRange] = useState([0, 35]);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { addItem, itemCount } = useCartStore();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'indica', label: 'Indica' },
    { id: 'sativa', label: 'Sativa' },
    { id: 'hybrid', label: 'Hybrid' },
  ];

  const effects = [
    'Energizing', 'Relaxing', 'Creative', 'Focused', 'Happy', 'Euphoric', 'Sleepy', 'Uplifting'
  ];

  const sortOptions = [
    { id: 'popularity', label: 'Most Popular' },
    { id: 'name', label: 'Name A-Z' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'thca-high', label: 'THCA: High to Low' },
    { id: 'thca-low', label: 'THCA: Low to High' },
  ];

  const filterProducts = useCallback(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.strain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.effects && product.effects.some(effect => 
          effect.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((product: Product) =>
        product.type === selectedFilter
      );
    }

    filtered = filtered.filter((product: Product) =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    filtered = filtered.filter((product: Product) =>
      product.thca_percentage >= thcaRange[0] && product.thca_percentage <= thcaRange[1]
    );

    if (selectedEffects.length > 0) {
      filtered = filtered.filter((product: Product) =>
        product.effects && selectedEffects.some(effect => 
          product.effects.includes(effect)
        )
      );
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product: Product) =>
        selectedBrands.includes(product.brand || '')
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'thca-high':
          return b.thca_percentage - a.thca_percentage;
        case 'thca-low':
          return a.thca_percentage - b.thca_percentage;
        case 'popularity':
        default:
          return (b.popularity || 0) - (a.popularity || 0);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedFilter, priceRange, thcaRange, selectedEffects, selectedBrands, sortBy]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
      if ((response as { success: boolean; data: Product[] }).success && (response as { success: boolean; data: Product[] }).data) {
        setProducts((response as { success: boolean; data: Product[] }).data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      if (product.inventory_status === 'out_of_stock') {
        Alert.alert('Out of Stock', `${product.name} is currently out of stock.`);
        return;
      }
      await addItem(product, 1);
      Alert.alert('Success', `${product.name} added to cart!`);
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const handleWishlistToggle = async (product: Product) => {
    try {
      const isInWishlist = wishlistItems.some(item => item.id === product.id);
      if (isInWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      Alert.alert('Error', 'Failed to update wishlist. Please try again.');
    }
  };

  const toggleEffect = (effect: string) => {
    setSelectedEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 100]);
    setThcaRange([0, 35]);
    setSelectedEffects([]);
    setSelectedBrands([]);
    setSelectedFilter('all');
    setSearchQuery('');
  };

  const getUniqueValues = (key: keyof Product) => {
    return [...new Set(products.map(p => p[key]).filter(Boolean))];
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isInWishlist = wishlistItems.some(wishItem => wishItem.id === item.id);
    const isOutOfStock = item.inventory_status === 'out_of_stock';
    const isLowStock = item.inventory_status === 'low_stock';

    if (viewMode === 'list') {
      return (
        <TouchableOpacity 
          style={styles.productListItem}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
          <Image
            source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
            style={styles.productListImage}
          />
          <View style={styles.productListInfo}>
            <View style={styles.productListHeader}>
              <Text style={styles.productName}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleWishlistToggle(item)}>
                <Ionicons 
                  name={isInWishlist ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isInWishlist ? "#ef4444" : "#9ca3af"} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.productStrain}>{item.strain}</Text>
            <View style={styles.productDetails}>
              <Text style={styles.productType}>{item.type}</Text>
              <Text style={styles.productTHCA}>{item.thca_percentage}% THCA</Text>
            </View>
            {item.effects && (
              <View style={styles.effectsContainer}>
                {item.effects.slice(0, 3).map((effect, index) => (
                  <Text key={index} style={styles.effectTag}>{effect}</Text>
                ))}
              </View>
            )}
            <View style={styles.productListFooter}>
              <View>
                <Text style={styles.productPrice}>${item.price}</Text>
                {isLowStock && <Text style={styles.lowStockText}>Low Stock</Text>}
                {isOutOfStock && <Text style={styles.outOfStockText}>Out of Stock</Text>}
              </View>
              <TouchableOpacity
                style={[styles.addButton, isOutOfStock && styles.addButtonDisabled]}
                onPress={() => handleAddToCart(item)}
                disabled={isOutOfStock}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
          />
          <TouchableOpacity 
            style={styles.wishlistButton}
            onPress={() => handleWishlistToggle(item)}
          >
            <Ionicons 
              name={isInWishlist ? "heart" : "heart-outline"} 
              size={18} 
              color={isInWishlist ? "#ef4444" : "#ffffff"} 
            />
          </TouchableOpacity>
          {isOutOfStock && (
            <View style={styles.stockOverlay}>
              <Text style={styles.stockOverlayText}>Out of Stock</Text>
            </View>
          )}
          {isLowStock && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockBadgeText}>Low Stock</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productStrain}>{item.strain}</Text>
          <View style={styles.productDetails}>
            <Text style={styles.productType}>{item.type}</Text>
            <Text style={styles.productTHCA}>{item.thca_percentage}% THCA</Text>
          </View>
          {item.effects && (
            <View style={styles.effectsContainer}>
              {item.effects.slice(0, 2).map((effect, index) => (
                <Text key={index} style={styles.effectTag}>{effect}</Text>
              ))}
            </View>
          )}
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>${item.price}</Text>
            <TouchableOpacity
              style={[styles.addButton, isOutOfStock && styles.addButtonDisabled]}
              onPress={() => handleAddToCart(item)}
              disabled={isOutOfStock}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilter = ({ item }: { item: { id: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.id && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(item.id)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === item.id && styles.filterButtonTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Wishlist')}
          >
            <Ionicons name="heart-outline" size={24} color="#ffffff" />
            {wishlistItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlistItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="bag-outline" size={24} color="#ffffff" />
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, strains, effects..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <FlatList
            data={filters}
            renderItem={renderFilter}
            keyExtractor={(item: { id: string; label: string }) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </ScrollView>
        
        <View style={styles.viewControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid-outline" size={16} color={viewMode === 'grid' ? "#ffffff" : "#9ca3af"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list-outline" size={16} color={viewMode === 'list' ? "#ffffff" : "#9ca3af"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item: Product) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.filterModal}>
          <View style={styles.filterModalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.filterModalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.filterModalTitle}>Filters</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.filterModalClear}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.sortOption}
                  onPress={() => setSortBy(option.id as SortOption)}
                >
                  <Text style={[styles.sortOptionText, sortBy === option.id && styles.sortOptionTextActive]}>
                    {option.label}
                  </Text>
                  {sortBy === option.id && <Ionicons name="checkmark" size={20} color="#10b981" />}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range: ${priceRange[0]} - ${priceRange[1]}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={priceRange[1]}
                onValueChange={(value) => setPriceRange([priceRange[0], value])}
                minimumTrackTintColor="#10b981"
                maximumTrackTintColor="#4b5563"
                thumbStyle={{ backgroundColor: '#10b981' }}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>THCA Range: {thcaRange[0]}% - {thcaRange[1]}%</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={35}
                value={thcaRange[1]}
                onValueChange={(value) => setThcaRange([thcaRange[0], value])}
                minimumTrackTintColor="#10b981"
                maximumTrackTintColor="#4b5563"
                thumbStyle={{ backgroundColor: '#10b981' }}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Effects</Text>
              <View style={styles.tagContainer}>
                {effects.map((effect) => (
                  <TouchableOpacity
                    key={effect}
                    style={[styles.tag, selectedEffects.includes(effect) && styles.tagActive]}
                    onPress={() => toggleEffect(effect)}
                  >
                    <Text style={[styles.tagText, selectedEffects.includes(effect) && styles.tagTextActive]}>
                      {effect}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Brands</Text>
              <View style={styles.tagContainer}>
                {getUniqueValues('brand').map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    style={[styles.tag, selectedBrands.includes(brand as string) && styles.tagActive]}
                    onPress={() => toggleBrand(brand as string)}
                  >
                    <Text style={[styles.tagText, selectedBrands.includes(brand as string) && styles.tagTextActive]}>
                      {brand}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterModalFooter}>
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#10b981',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  filtersContainer: {
    flex: 1,
  },
  filtersList: {
    gap: 12,
  },
  filterButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  filterButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterButtonText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  viewControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    backgroundColor: '#374151',
    padding: 8,
    borderRadius: 8,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#10b981',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  productsList: {
    padding: 20,
    gap: 16,
  },
  productCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#4b5563',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 6,
  },
  stockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockOverlayText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lowStockBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  productListItem: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productListImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#4b5563',
    marginRight: 16,
  },
  productListInfo: {
    flex: 1,
  },
  productListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productListFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  productStrain: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productType: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  productTHCA: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '500',
  },
  effectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  effectTag: {
    fontSize: 10,
    color: '#9ca3af',
    backgroundColor: '#4b5563',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  lowStockText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  outOfStockText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  filterModal: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  filterModalCancel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  filterModalClear: {
    fontSize: 16,
    color: '#10b981',
  },
  filterModalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#d1d5db',
  },
  sortOptionTextActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  tagActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  tagText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  tagTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  filterModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  applyFiltersButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
