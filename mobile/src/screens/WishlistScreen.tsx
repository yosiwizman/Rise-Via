import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../types/navigation';
import type { Product } from '../types/shared';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useCartStore } from '../stores/useCartStore';

export default function WishlistScreen({ navigation }: { navigation: NavigationProp<MainTabParamList> }) {
  const { wishlistItems, isLoading, removeFromWishlist, loadWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      Alert.alert('Error', 'Failed to remove item from wishlist. Please try again.');
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

  const renderWishlistItem = ({ item }: { item: Product }) => {
    const isOutOfStock = item.inventory_status === 'out_of_stock';
    const isLowStock = item.inventory_status === 'low_stock';

    return (
      <TouchableOpacity 
        style={styles.wishlistItem}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
          />
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
              {item.effects.slice(0, 3).map((effect, index) => (
                <Text key={index} style={styles.effectTag}>{effect}</Text>
              ))}
            </View>
          )}
          <Text style={styles.productPrice}>${item.price}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFromWishlist(item.id)}
          >
            <Ionicons name="heart" size={20} color="#ef4444" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.addToCartButton, isOutOfStock && styles.addToCartButtonDisabled]}
            onPress={() => handleAddToCart(item)}
            disabled={isOutOfStock}
          >
            <Ionicons name="bag-add-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyWishlist = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#6b7280" />
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Save your favorite products to easily find them later
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('Shop')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.itemCount}>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading wishlist...</Text>
        </View>
      ) : wishlistItems.length === 0 ? (
        renderEmptyWishlist()
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item: Product) => item.id}
          contentContainerStyle={styles.wishlistList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  itemCount: {
    fontSize: 14,
    color: '#9ca3af',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  wishlistList: {
    padding: 20,
  },
  wishlistItem: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#4b5563',
  },
  stockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockOverlayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowStockBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
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
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actions: {
    alignItems: 'center',
    gap: 12,
  },
  removeButton: {
    padding: 8,
  },
  addToCartButton: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#6b7280',
  },
});
