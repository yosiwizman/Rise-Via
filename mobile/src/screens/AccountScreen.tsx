import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../types/navigation';
import { useAuthStore } from '../stores/useAuthStore';

export default function AccountScreen({ navigation }: { navigation: NavigationProp<MainTabParamList> }) {
  const { user, isAuthenticated, isLoading, logout, loadUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated, loadUser]);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('Auth', { screen: 'Login' });
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { id: 'profile', icon: 'person-outline', title: 'Edit Profile', onPress: () => { /* TODO: Implement profile editing */ } },
    { id: 'orders', icon: 'receipt-outline', title: 'Order History', onPress: () => {} },
    { id: 'wishlist', icon: 'heart-outline', title: 'Wishlist', onPress: () => navigation.navigate('Wishlist') },
    { id: 'addresses', icon: 'location-outline', title: 'Addresses', onPress: () => {} },
    { id: 'payment', icon: 'card-outline', title: 'Payment Methods', onPress: () => {} },
    { id: 'notifications', icon: 'notifications-outline', title: 'Notifications', onPress: () => {} },
    { id: 'privacy', icon: 'shield-outline', title: 'Privacy Settings', onPress: () => {} },
    { id: 'help', icon: 'help-circle-outline', title: 'Help & Support', onPress: () => {} },
    { id: 'terms', icon: 'document-text-outline', title: 'Terms & Privacy', onPress: () => {} },
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <Ionicons name={item.icon as any} size={24} color="#10b981" />
      <Text style={styles.menuItemText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthenticatedContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#6b7280" />
          <Text style={styles.unauthenticatedTitle}>Sign In Required</Text>
          <Text style={styles.unauthenticatedSubtitle}>
            Please sign in to access your account
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.membership_tier && (
                <View style={styles.membershipBadge}>
                  <Text style={styles.membershipText}>
                    {user.membership_tier.toUpperCase()} MEMBER
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {user?.loyalty_points !== undefined && (
            <View style={styles.loyaltySection}>
              <Text style={styles.loyaltyTitle}>Loyalty Points</Text>
              <Text style={styles.loyaltyPoints}>{user.loyalty_points}</Text>
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
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
    padding: 20,
  },
  unauthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthenticatedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  unauthenticatedSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 30,
  },
  signInButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  header: {
    marginBottom: 30,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 10,
  },
  membershipBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  membershipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  loyaltySection: {
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loyaltyTitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 5,
  },
  loyaltyPoints: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
  },
  menuSection: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  logoutSection: {
    marginTop: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
});
