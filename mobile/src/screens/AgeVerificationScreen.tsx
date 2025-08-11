import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { useAppStore } from '../stores/useAppStore';

interface AgeVerificationScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

export default function AgeVerificationScreen({ navigation }: AgeVerificationScreenProps) {
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAgeVerified } = useAppStore();

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleVerification = () => {
    setIsLoading(true);
    
    const age = calculateAge(birthDate);
    
    if (age < 21) {
      Alert.alert(
        'Age Verification Failed',
        'You must be at least 21 years old to access this application.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsLoading(false);
            }
          }
        ]
      );
      return;
    }

    setTimeout(() => {
      setAgeVerified(true);
      setIsLoading(false);
      navigation.navigate('StateSelection');
    }, 1000);
  };

  const handleDeny = () => {
    Alert.alert(
      'Access Denied',
      'You must be 21 or older to use this application.',
      [{ text: 'OK' }]
    );
  };

  const onDateChange = (event: unknown, selectedDate?: Date) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthDate(currentDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔞</Text>
          </View>
          
          <Text style={styles.title}>Age Verification Required</Text>
          <Text style={styles.subtitle}>
            You must be 21 or older to access this cannabis platform. Please verify your age to continue.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Date of Birth</Text>
          
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {birthDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
              onPress={handleVerification}
              disabled={isLoading}
            >
              <Text style={styles.verifyButtonText}>
                {isLoading ? 'Verifying...' : 'Verify Age'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.denyButton}
              onPress={handleDeny}
              disabled={isLoading}
            >
              <Text style={styles.denyButtonText}>I'm Under 21</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By verifying your age, you confirm that you are 21 years or older and agree to our terms of service.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  form: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#4b5563',
    marginBottom: 24,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  verifyButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  denyButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  denyButtonText: {
    color: '#d1d5db',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
