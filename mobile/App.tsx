import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initializeAuth } from './src/stores/useAuthStore';
import { initializeApp } from './src/stores/useAppStore';
import { syncCartWithServer } from './src/stores/useCartStore';

import AgeVerificationScreen from './src/screens/AgeVerificationScreen';
import StateSelectionScreen from './src/screens/StateSelectionScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

import { useAppStore } from './src/stores/useAppStore';
import { useAuthStore } from './src/stores/useAuthStore';

const Stack = createNativeStackNavigator();

export default function App() {
  const { isAgeVerified, selectedState } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const initializeAppData = async () => {
      try {
        await initializeAuth();
        await initializeApp();
        await syncCartWithServer();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeAppData();
  }, []);

  const getInitialRouteName = () => {
    if (!isAgeVerified) {
      return 'AgeVerification';
    }
    if (!selectedState) {
      return 'StateSelection';
    }
    if (!isAuthenticated) {
      return 'Auth';
    }
    return 'Main';
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={getInitialRouteName()}
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
        >
          <Stack.Screen 
            name="AgeVerification" 
            component={AgeVerificationScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="StateSelection" 
            component={StateSelectionScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
          />
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
