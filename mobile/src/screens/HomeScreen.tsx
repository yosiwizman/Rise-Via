import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../types/navigation';
import type { Product } from '../types/shared';
import { api } from '../services/api';

export default function HomeScreen({ navigation }: { navigation: NavigationProp<MainTabParamList> }) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.getFeaturedProducts();
      if (response.success && response.data) {
        setFeaturedProducts(response.data.slice(0, 6));
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const renderFeaturedProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.featuredProduct}
      onPress={() => handleProductPress(item)}
    >
      <Image source={{ uri: item.image_url }} style={styles.featuredProductImage} />
      <View style={styles.featuredProductInfo}>
        <Text style={styles.featuredProductName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.featuredProductPrice}>${item.price.toFixed(2)}</Text>
        <Text style={styles.featuredProductType}>
          {item.type} • {item.thca_percentage}% THCA
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to RiseViA</Text>
          <Text style={styles.subtitle}>Premium THCA Cannabis Products</Text>
        </View>

        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Discover Premium Cannabis</Text>
            <Text style={styles.heroSubtitle}>Lab-tested, high-quality THCA products</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Shop')}
            >
              <Text style={styles.shopButtonText}>Shop Now</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose RiseViA?</Text>
          
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <Ionicons name="shield-checkmark" size={32} color="#10b981" />
              <Text style={styles.featureTitle}>Lab Tested</Text>
              <Text style={styles.featureDescription}>
                All products are third-party lab tested for purity and potency
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
              <Ionicons name="flash" size={32} color="#10b981" />
              <Text style={styles.featureTitle}>Fast Delivery</Text>
              <Text style={styles.featureDescription}>
                Quick and discreet shipping to your door
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Ionicons name="people" size={32} color="#10b981" />
              <Text style={styles.featureTitle}>Expert Support</Text>
              <Text style={styles.featureDescription}>
                Knowledgeable team ready to help with your questions
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : (
            <FlatList
              data={featuredProducts}
              renderItem={renderFeaturedProduct}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Experience Premium Cannabis?</Text>
          <Text style={styles.ctaSubtitle}>
            Browse our full collection of lab-tested THCA products
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.ctaButtonText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  heroSection: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 20,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
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
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuredSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAllText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  featuredProduct: {
    width: '48%',
    backgroundColor: '#374151',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  featuredProductImage: {
    width: '100%',
    height: 120,
  },
  featuredProductInfo: {
    padding: 12,
  },
  featuredProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  featuredProductPrice: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredProductType: {
    fontSize: 12,
    color: '#9ca3af',
  },
  ctaSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#374151',
    margin: 20,
    borderRadius: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
