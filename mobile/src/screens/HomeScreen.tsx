import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../types/navigation';
import { useAuthStore } from '../stores/useAuthStore';
import { useCartStore } from '../stores/useCartStore';
import { api } from '../services/api';


export default function HomeScreen({ navigation }: { navigation: NavigationProp<MainTabParamList> }) {
  const { user } = useAuthStore();
  const { itemCount } = useCartStore();
  const [featuredProducts, setFeaturedProducts] = useState<{ id: string; name: string; strain: string; price: number; image_url?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await api.getFeaturedProducts();
      if ((response as { success: boolean; data: { id: string; name: string; strain: string; price: number; image_url?: string }[] }).success && (response as { success: boolean; data: { id: string; name: string; strain: string; price: number; image_url?: string }[] }).data) {
        setFeaturedProducts((response as { success: boolean; data: { id: string; name: string; strain: string; price: number; image_url?: string }[] }).data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load featured products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = (product: { id: string; name: string; strain: string; price: number; image_url?: string }) => {
    navigation.navigate('Shop', { productId: product.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome{user?.first_name ? `, ${user.first_name}` : ''}
            </Text>
            <Text style={styles.subtitle}>Premium THCA Cannabis</Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="bag-outline" size={24} color="#ffffff" />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Premium THCA Flower</Text>
            <Text style={styles.heroDescription}>
              Lab-tested, high-quality cannabis products delivered to your door
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Shop')}
            >
              <Text style={styles.shopButtonText}>Shop Now</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.productsScroll}
            >
              {featuredProducts.map((product: { id: string; name: string; strain: string; price: number; image_url?: string }) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleProductPress(product)}
                >
                  <Image
                    source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productStrain}>{product.strain}</Text>
                    <Text style={styles.productPrice}>${product.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose RiseViA?</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Ionicons name="shield-checkmark" size={32} color="#10b981" />
              <Text style={styles.featureTitle}>Lab Tested</Text>
              <Text style={styles.featureDescription}>
                All products are third-party lab tested for purity and potency
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="flash" size={32} color="#10b981" />
              <Text style={styles.featureTitle}>Fast Delivery</Text>
              <Text style={styles.featureDescription}>
                Same-day delivery available in select areas
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="leaf" size={32} color="#10b981" />
              <Text style={styles.featureTitle}>Premium Quality</Text>
              <Text style={styles.featureDescription}>
                Hand-selected, premium THCA flower from trusted growers
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="lock-closed" size={32} color="#10b981" />
              <Text style={styles.featureTitle}>Secure & Legal</Text>
              <Text style={styles.featureDescription}>
                Fully compliant with state and federal regulations
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educational Resources</Text>
          <TouchableOpacity style={styles.resourceCard}>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>What is THCA?</Text>
              <Text style={styles.resourceDescription}>
                Learn about the benefits and effects of THCA
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceCard}>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Dosage Guide</Text>
              <Text style={styles.resourceDescription}>
                Find the right dosage for your needs
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 4,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
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
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroSection: {
    backgroundColor: '#374151',
    margin: 20,
    borderRadius: 16,
    padding: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  shopButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  productsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  productCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    marginRight: 16,
    width: 160,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#4b5563',
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
    color: '#9ca3af',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },
  resourceCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
