import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../types/navigation';
import type { Product, Review } from '../types/shared';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { api } from '../services/api';

const { width } = Dimensions.get('window');

interface ProductDetailScreenProps {
  route: RouteProp<MainTabParamList, 'ProductDetail'>;
  navigation: NavigationProp<MainTabParamList>;
}

export default function ProductDetailScreen({ route, navigation }: ProductDetailScreenProps) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const { addItem } = useCartStore();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    loadProductDetails();
    loadProductReviews();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      const response = await api.getProductDetails(productId);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Failed to load product details:', error);
      Alert.alert('Error', 'Failed to load product details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductReviews = async () => {
    try {
      const response = await api.getProductReviews(productId);
      if (response.success && response.data) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      if (product.inventory_status === 'out_of_stock') {
        Alert.alert('Out of Stock', `${product.name} is currently out of stock.`);
        return;
      }
      await addItem(product, quantity);
      Alert.alert('Success', `${product.name} (${quantity}) added to cart!`);
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
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

  const renderImageCarousel = () => {
    const images = product?.images || [product?.image_url || 'https://via.placeholder.com/400'];
    
    return (
      <View style={styles.imageCarouselContainer}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setSelectedImageIndex(index);
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.productImage} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        
        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.imageIndicator,
                  selectedImageIndex === index && styles.imageIndicatorActive
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewAuthor}>{item.author_name}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? "star" : "star-outline"}
              size={14}
              color="#fbbf24"
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewText}>{item.comment}</Text>
      <Text style={styles.reviewDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isInWishlist = wishlistItems.some(item => item.id === product.id);
  const isOutOfStock = product.inventory_status === 'out_of_stock';
  const isLowStock = product.inventory_status === 'low_stock';
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleWishlistToggle}>
          <Ionicons 
            name={isInWishlist ? "heart" : "heart-outline"} 
            size={24} 
            color={isInWishlist ? "#ef4444" : "#ffffff"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderImageCarousel()}

        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleContainer}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productStrain}>{product.strain}</Text>
            </View>
            <Text style={styles.productPrice}>${product.price}</Text>
          </View>

          <View style={styles.productMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Type</Text>
              <Text style={[styles.metaValue, styles.typeValue]}>{product.type}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>THCA</Text>
              <Text style={[styles.metaValue, styles.thcaValue]}>{product.thca_percentage}%</Text>
            </View>
            {product.brand && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Brand</Text>
                <Text style={styles.metaValue}>{product.brand}</Text>
              </View>
            )}
          </View>

          {(isOutOfStock || isLowStock) && (
            <View style={styles.stockStatus}>
              <Ionicons 
                name={isOutOfStock ? "alert-circle" : "warning"} 
                size={16} 
                color={isOutOfStock ? "#ef4444" : "#f59e0b"} 
              />
              <Text style={[styles.stockText, isOutOfStock ? styles.outOfStockText : styles.lowStockText]}>
                {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
              </Text>
              {product.restock_date && (
                <Text style={styles.restockText}>
                  Expected: {new Date(product.restock_date).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}

          {product.effects && product.effects.length > 0 && (
            <View style={styles.effectsSection}>
              <Text style={styles.sectionTitle}>Effects</Text>
              <View style={styles.effectsContainer}>
                {product.effects.map((effect, index) => (
                  <View key={index} style={styles.effectTag}>
                    <Text style={styles.effectText}>{effect}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {product.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= averageRating ? "star" : "star-outline"}
                      size={16}
                      color="#fbbf24"
                    />
                  ))}
                  <Text style={styles.ratingText}>
                    {averageRating.toFixed(1)} ({reviews.length})
                  </Text>
                </View>
              </View>
              
              {reviews.slice(0, 3).map((review) => (
                <View key={review.id}>
                  {renderReview({ item: review })}
                </View>
              ))}
              
              {reviews.length > 3 && (
                <TouchableOpacity style={styles.viewAllReviewsButton}>
                  <Text style={styles.viewAllReviewsText}>View All Reviews</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.addToCartButton, isOutOfStock && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Text style={styles.addToCartButtonText}>
            {isOutOfStock ? 'Out of Stock' : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  imageCarouselContainer: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: 300,
    backgroundColor: '#374151',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  imageIndicatorActive: {
    backgroundColor: '#ffffff',
  },
  productInfo: {
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  productStrain: {
    fontSize: 16,
    color: '#9ca3af',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  typeValue: {
    color: '#10b981',
    textTransform: 'capitalize',
  },
  thcaValue: {
    color: '#fbbf24',
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
  },
  outOfStockText: {
    color: '#ef4444',
  },
  lowStockText: {
    color: '#f59e0b',
  },
  restockText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  effectsSection: {
    marginBottom: 24,
  },
  effectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effectTag: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  effectText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  reviewsSection: {
    marginBottom: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 4,
  },
  reviewItem: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  reviewText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  viewAllReviewsButton: {
    alignItems: 'center',
    padding: 12,
  },
  viewAllReviewsText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#374151',
    gap: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4b5563',
    borderRadius: 8,
    gap: 16,
  },
  quantityButton: {
    padding: 12,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
