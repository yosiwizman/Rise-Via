import { useState, useEffect } from 'react';

interface UserPreferences {
  preferredEffects: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  preferredTime: 'morning' | 'afternoon' | 'evening';
  medicalVsRecreational: 'medical' | 'recreational';
  flavorPreferences: string[];
}

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('risevia-user-preferences');
    const hasSeenOnboarding = localStorage.getItem('risevia-onboarding-completed');
    
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
    
    if (!hasSeenOnboarding && !savedPreferences) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = (userPreferences: UserPreferences) => {
    setPreferences(userPreferences);
    localStorage.setItem('risevia-onboarding-completed', 'true');
    localStorage.setItem('risevia-user-preferences', JSON.stringify(userPreferences));
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('risevia-onboarding-completed');
    localStorage.removeItem('risevia-user-preferences');
    setPreferences(null);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    preferences,
    completeOnboarding,
    resetOnboarding,
    setShowOnboarding
  };
};
