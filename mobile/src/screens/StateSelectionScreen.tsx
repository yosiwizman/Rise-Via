import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../stores/useAppStore';

interface StateSelectionScreenProps {
  navigation: any;
}

const CANNABIS_STATES = [
  { code: 'CA', name: 'California', legal: true },
  { code: 'CO', name: 'Colorado', legal: true },
  { code: 'WA', name: 'Washington', legal: true },
  { code: 'OR', name: 'Oregon', legal: true },
  { code: 'NV', name: 'Nevada', legal: true },
  { code: 'AZ', name: 'Arizona', legal: true },
  { code: 'NM', name: 'New Mexico', legal: true },
  { code: 'MT', name: 'Montana', legal: true },
  { code: 'AK', name: 'Alaska', legal: true },
  { code: 'IL', name: 'Illinois', legal: true },
  { code: 'MI', name: 'Michigan', legal: true },
  { code: 'MA', name: 'Massachusetts', legal: true },
  { code: 'ME', name: 'Maine', legal: true },
  { code: 'VT', name: 'Vermont', legal: true },
  { code: 'CT', name: 'Connecticut', legal: true },
  { code: 'RI', name: 'Rhode Island', legal: true },
  { code: 'NJ', name: 'New Jersey', legal: true },
  { code: 'NY', name: 'New York', legal: true },
  { code: 'VA', name: 'Virginia', legal: true },
  { code: 'MD', name: 'Maryland', legal: true },
  { code: 'DE', name: 'Delaware', legal: true },
  { code: 'MN', name: 'Minnesota', legal: true },
  { code: 'MO', name: 'Missouri', legal: true },
  { code: 'OH', name: 'Ohio', legal: true },
];

export default function StateSelectionScreen({ navigation }: StateSelectionScreenProps) {
  const [selectedState, setSelectedStateLocal] = useState<string>('');
  const { setSelectedState, checkCompliance } = useAppStore();

  const handleStateSelection = async (stateCode: string) => {
    setSelectedStateLocal(stateCode);
    
    const state = CANNABIS_STATES.find(s => s.code === stateCode);
    
    if (!state?.legal) {
      Alert.alert(
        'State Not Supported',
        'Cannabis delivery is not currently available in your state. You can still browse our educational content.',
        [
          {
            text: 'Continue Browsing',
            onPress: () => {
              setSelectedState(stateCode);
              navigation.replace('Auth');
            }
          }
        ]
      );
      return;
    }

    try {
      await checkCompliance(stateCode);
      setSelectedState(stateCode);
      navigation.replace('Auth');
    } catch (error) {
      console.error('Compliance check failed:', error);
      setSelectedState(stateCode);
      navigation.replace('Auth');
    }
  };

  const renderState = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.stateItem,
        selectedState === item.code && styles.stateItemSelected,
        !item.legal && styles.stateItemDisabled,
      ]}
      onPress={() => handleStateSelection(item.code)}
    >
      <Text style={[
        styles.stateName,
        selectedState === item.code && styles.stateNameSelected,
        !item.legal && styles.stateNameDisabled,
      ]}>
        {item.name}
      </Text>
      {item.legal && (
        <Text style={styles.legalIndicator}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📍</Text>
        </View>
        
        <Text style={styles.title}>Select Your State</Text>
        <Text style={styles.subtitle}>
          We need to verify your location to ensure compliance with local cannabis laws.
        </Text>
      </View>

      <View style={styles.content}>
        <FlatList
          data={CANNABIS_STATES}
          renderItem={renderState}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.statesList}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ✓ = Cannabis delivery available
        </Text>
        <Text style={styles.footerText}>
          States without checkmarks can browse educational content only.
        </Text>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statesList: {
    paddingVertical: 20,
  },
  stateItem: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  stateItemSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stateItemDisabled: {
    backgroundColor: '#2d3748',
    borderColor: '#4a5568',
  },
  stateName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  stateNameSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  stateNameDisabled: {
    color: '#9ca3af',
  },
  legalIndicator: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
});
