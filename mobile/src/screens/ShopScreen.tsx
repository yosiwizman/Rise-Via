import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../types/navigation';
import type { Product } from '../types/shared';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { api } from '../services/api';

type SortOption = 'name' | 'price-low' | 'price-high' | 'thca-high' | 'thca-low';

export default function ShopScreen({ navigation }: { navigation: NavigationProp<MainTabParamList> }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const { addItem } = useCartStore();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'indica', label: 'Indica' },
    { id: 'sativa', label: 'Sativa' },
    { id: 'hybrid', label: 'Hybrid' },
  ];

  const filterProducts = () => {
    let filtered = [...products];

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(product => product.type === selectedFilter);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.strain.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'thca-high':
          return b.thca_percentage - a.thca_percentage;
        case 'thca-low':
          return a.thca_percentage - b.thca_percentage;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedFilter, searchQuery, sortBy]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product, 1);
      Alert.alert('Success', `${product.name} added to cart!`);
    } catch (error) {
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
      Alert.alert('Error', 'Failed to update wishlist. Please try again.');
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isInWishlist = wishlistItems.some(wishlistItem => wishlistItem.id === item.id);
    const isOutOfStock = item.inventory_status === 'out_of_stock';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: item.image_url }} style={styles.productImage} />
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => handleWishlistToggle(item)}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={isInWishlist ? '#ef4444' : '#ffffff'}
            />
          </TouchableOpacity>
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productStrain}>{item.strain}</Text>
          <Text style={styles.productType}>
            {item.type} • {item.thca_percentage}% THCA
          </Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            <TouchableOpacity
              style={[styles.addToCartButton, isOutOfStock && styles.addToCartButtonDisabled]}
              onPress={() => handleAddToCart(item)}
              disabled={isOutOfStock}
            >
              <Ionicons name="bag-add" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilter = ({ item }: { item: typeof filters[0] }) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === item.id && styles.filterButtonActive]}
      onPress={() => setSelectedFilter(item.id)}
    >
      <Text style={[styles.filterButtonText, selectedFilter === item.id && styles.filterButtonTextActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="funnel-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          data={filters}
          renderItem={renderFilter}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProducts.length} products found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortButtonText}>Sort</Text>
          <Ionicons name="chevron-down" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  sortButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    marginRight: 4,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  filtersList: {
    paddingRight: 20,
  },
  filterButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#10b981',
  },
  filterButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsCount: {
    color: '#9ca3af',
    fontSize: 14,
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
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#374151',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 6,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  productStrain: {
    fontSize: 12,
    color: '#10b981',
    marginBottom: 4,
  },
  productType: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
  },
  addToCartButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 6,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#6b7280',
  },
});
