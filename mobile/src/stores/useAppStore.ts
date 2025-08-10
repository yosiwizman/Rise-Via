import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, ComplianceCheck } from '../types/shared';
import { api } from '../services/api';

const asyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
    }
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAgeVerified: false,
      selectedState: '',
      complianceData: null,

      setAgeVerified: async (verified: boolean) => {
        set({ isAgeVerified: verified });
        
        const { selectedState } = get();
        if (verified && selectedState) {
          await get().checkCompliance(selectedState);
        }
      },

      setSelectedState: async (state: string) => {
        set({ selectedState: state });
        
        const { isAgeVerified } = get();
        if (isAgeVerified) {
          await get().checkCompliance(state);
        }
      },

      setComplianceData: (data: ComplianceCheck) => {
        set({ complianceData: data });
      },

      checkCompliance: async (state: string) => {
        try {
          const response: any = await api.checkStateCompliance(state);
          
          if (response.success && response.data) {
            set({ complianceData: response.data });
          }
        } catch (error) {
          console.error('Failed to check compliance:', error);
          
          set({
            complianceData: {
              age_verified: get().isAgeVerified,
              state_allowed: false,
              purchase_limits: {
                daily_limit: 0,
                monthly_limit: 0,
                current_usage: 0,
              },
              warnings: ['Unable to verify state compliance. Please contact support.'],
              restrictions: ['Purchases temporarily restricted due to compliance check failure.'],
            },
          });
        }
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        isAgeVerified: state.isAgeVerified,
        selectedState: state.selectedState,
        complianceData: state.complianceData,
      }),
    }
  )
);

export const CANNABIS_STATES = [
  { name: 'California', code: 'CA', legal: true, medical: true },
  { name: 'Colorado', code: 'CO', legal: true, medical: true },
  { name: 'Washington', code: 'WA', legal: true, medical: true },
  { name: 'Oregon', code: 'OR', legal: true, medical: true },
  { name: 'Nevada', code: 'NV', legal: true, medical: true },
  { name: 'Arizona', code: 'AZ', legal: true, medical: true },
  { name: 'New Mexico', code: 'NM', legal: true, medical: true },
  { name: 'Montana', code: 'MT', legal: true, medical: true },
  { name: 'Alaska', code: 'AK', legal: true, medical: true },
  { name: 'Illinois', code: 'IL', legal: true, medical: true },
  { name: 'Michigan', code: 'MI', legal: true, medical: true },
  { name: 'Massachusetts', code: 'MA', legal: true, medical: true },
  { name: 'Maine', code: 'ME', legal: true, medical: true },
  { name: 'Vermont', code: 'VT', legal: true, medical: true },
  { name: 'Connecticut', code: 'CT', legal: true, medical: true },
  { name: 'New York', code: 'NY', legal: true, medical: true },
  { name: 'New Jersey', code: 'NJ', legal: true, medical: true },
  { name: 'Virginia', code: 'VA', legal: true, medical: true },
  { name: 'Rhode Island', code: 'RI', legal: true, medical: true },
  { name: 'Maryland', code: 'MD', legal: true, medical: true },
  { name: 'Missouri', code: 'MO', legal: true, medical: true },
  { name: 'Delaware', code: 'DE', legal: true, medical: true },
  { name: 'Minnesota', code: 'MN', legal: true, medical: true },
  { name: 'Ohio', code: 'OH', legal: true, medical: true },
  
  { name: 'Florida', code: 'FL', legal: false, medical: true },
  { name: 'Texas', code: 'TX', legal: false, medical: true },
  { name: 'Pennsylvania', code: 'PA', legal: false, medical: true },
  { name: 'Arkansas', code: 'AR', legal: false, medical: true },
  { name: 'Louisiana', code: 'LA', legal: false, medical: true },
  { name: 'Oklahoma', code: 'OK', legal: false, medical: true },
  { name: 'Utah', code: 'UT', legal: false, medical: true },
  { name: 'West Virginia', code: 'WV', legal: false, medical: true },
  { name: 'North Dakota', code: 'ND', legal: false, medical: true },
  { name: 'South Dakota', code: 'SD', legal: false, medical: true },
  { name: 'Alabama', code: 'AL', legal: false, medical: true },
  { name: 'Mississippi', code: 'MS', legal: false, medical: true },
  { name: 'Hawaii', code: 'HI', legal: false, medical: true },
];

export const initializeApp = async () => {
  const appStore = useAppStore.getState();
  
  if (appStore.isAgeVerified && appStore.selectedState) {
    await appStore.checkCompliance(appStore.selectedState);
  }
};
