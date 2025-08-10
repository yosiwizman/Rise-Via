import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent } from './ui/dialog';
import { RecommendationEngine } from '../services/RecommendationEngine';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: UserPreferences) => void;
}

interface UserPreferences {
  preferredEffects: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  preferredTime: 'morning' | 'afternoon' | 'evening';
  medicalVsRecreational: 'medical' | 'recreational';
  flavorPreferences: string[];
}

export const OnboardingWizard = ({ isOpen, onClose, onComplete }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredEffects: [],
    experienceLevel: 'beginner',
    preferredTime: 'evening',
    medicalVsRecreational: 'recreational',
    flavorPreferences: []
  });

  const steps = [
    {
      title: "What effects are you looking for?",
      subtitle: "Select all that apply",
      type: "effects"
    },
    {
      title: "What's your experience level?",
      subtitle: "This helps us recommend appropriate potency",
      type: "experience"
    },
    {
      title: "When do you typically consume?",
      subtitle: "Different strains work better at different times",
      type: "timing"
    },
    {
      title: "What's your primary use?",
      subtitle: "Medical or recreational use",
      type: "purpose"
    },
    {
      title: "Any flavor preferences?",
      subtitle: "Optional - select flavors you enjoy",
      type: "flavors"
    }
  ];

  const effectOptions = [
    'Relaxed', 'Energetic', 'Creative', 'Focused', 'Happy', 
    'Euphoric', 'Sleepy', 'Uplifted', 'Calm', 'Motivated'
  ];

  const flavorOptions = [
    'Citrus', 'Berry', 'Pine', 'Earthy', 'Sweet', 
    'Spicy', 'Floral', 'Diesel', 'Vanilla', 'Tropical'
  ];

  const handleEffectToggle = (effect: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredEffects: prev.preferredEffects.includes(effect)
        ? prev.preferredEffects.filter(e => e !== effect)
        : [...prev.preferredEffects, effect]
    }));
  };

  const handleFlavorToggle = (flavor: string) => {
    setPreferences(prev => ({
      ...prev,
      flavorPreferences: prev.flavorPreferences.includes(flavor)
        ? prev.flavorPreferences.filter(f => f !== flavor)
        : [...prev.flavorPreferences, flavor]
    }));
  };

  const handleComplete = () => {
    localStorage.setItem('risevia-user-preferences', JSON.stringify(preferences));
    
    const recommendations = RecommendationEngine.getPersonalizedRecommendations(preferences);
    localStorage.setItem('risevia-recommendations', JSON.stringify(recommendations));
    
    onComplete(preferences);
    onClose();
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    switch (step.type) {
      case 'effects':
        return (
          <div className="grid grid-cols-2 gap-3">
            {effectOptions.map((effect) => (
              <Button
                key={effect}
                variant={preferences.preferredEffects.includes(effect) ? "default" : "outline"}
                onClick={() => handleEffectToggle(effect)}
                className={`h-12 ${preferences.preferredEffects.includes(effect) 
                  ? 'bg-gradient-to-r from-risevia-purple to-risevia-teal text-white' 
                  : 'border-risevia-purple text-risevia-purple hover:bg-risevia-purple hover:text-white'
                }`}
              >
                {preferences.preferredEffects.includes(effect) && (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {effect}
              </Button>
            ))}
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            {[
              { level: 'beginner', title: 'Beginner', desc: 'New to cannabis or prefer lower potency (under 20% THCA)' },
              { level: 'intermediate', title: 'Intermediate', desc: 'Some experience, comfortable with moderate potency (20-25% THCA)' },
              { level: 'expert', title: 'Expert', desc: 'Experienced user, comfortable with high potency (25%+ THCA)' }
            ].map((option) => (
              <Card
                key={option.level}
                className={`cursor-pointer transition-all ${
                  preferences.experienceLevel === option.level
                    ? 'border-risevia-purple bg-risevia-purple/10'
                    : 'border-gray-200 hover:border-risevia-purple/50'
                }`}
                onClick={() => setPreferences(prev => ({ ...prev, experienceLevel: option.level as UserPreferences['experienceLevel'] }))}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-risevia-black">{option.title}</h3>
                      <p className="text-sm text-risevia-charcoal">{option.desc}</p>
                    </div>
                    {preferences.experienceLevel === option.level && (
                      <Check className="w-5 h-5 text-risevia-purple" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'timing':
        return (
          <div className="grid grid-cols-1 gap-4">
            {[
              { time: 'morning', title: 'Morning', desc: 'Energizing sativas for productivity and focus' },
              { time: 'afternoon', title: 'Afternoon', desc: 'Balanced hybrids for social activities' },
              { time: 'evening', title: 'Evening', desc: 'Relaxing indicas for unwinding and sleep' }
            ].map((option) => (
              <Card
                key={option.time}
                className={`cursor-pointer transition-all ${
                  preferences.preferredTime === option.time
                    ? 'border-risevia-teal bg-risevia-teal/10'
                    : 'border-gray-200 hover:border-risevia-teal/50'
                }`}
                onClick={() => setPreferences(prev => ({ ...prev, preferredTime: option.time as UserPreferences['preferredTime'] }))}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-risevia-black">{option.title}</h3>
                      <p className="text-sm text-risevia-charcoal">{option.desc}</p>
                    </div>
                    {preferences.preferredTime === option.time && (
                      <Check className="w-5 h-5 text-risevia-teal" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'purpose':
        return (
          <div className="grid grid-cols-1 gap-4">
            {[
              { purpose: 'medical', title: 'Medical Use', desc: 'For therapeutic benefits and symptom relief' },
              { purpose: 'recreational', title: 'Recreational Use', desc: 'For relaxation and enjoyment' }
            ].map((option) => (
              <Card
                key={option.purpose}
                className={`cursor-pointer transition-all ${
                  preferences.medicalVsRecreational === option.purpose
                    ? 'border-risevia-purple bg-risevia-purple/10'
                    : 'border-gray-200 hover:border-risevia-purple/50'
                }`}
                onClick={() => setPreferences(prev => ({ ...prev, medicalVsRecreational: option.purpose as UserPreferences['medicalVsRecreational'] }))}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-risevia-black">{option.title}</h3>
                      <p className="text-sm text-risevia-charcoal">{option.desc}</p>
                    </div>
                    {preferences.medicalVsRecreational === option.purpose && (
                      <Check className="w-5 h-5 text-risevia-purple" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'flavors':
        return (
          <div className="grid grid-cols-2 gap-3">
            {flavorOptions.map((flavor) => (
              <Button
                key={flavor}
                variant={preferences.flavorPreferences.includes(flavor) ? "default" : "outline"}
                onClick={() => handleFlavorToggle(flavor)}
                className={`h-12 ${preferences.flavorPreferences.includes(flavor) 
                  ? 'bg-gradient-to-r from-risevia-purple to-risevia-teal text-white' 
                  : 'border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white'
                }`}
              >
                {preferences.flavorPreferences.includes(flavor) && (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {flavor}
              </Button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-risevia-charcoal mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-risevia-purple to-risevia-teal h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold gradient-text mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-risevia-charcoal">
                  {steps[currentStep].subtitle}
                </p>
              </div>

              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="border-risevia-purple text-risevia-purple"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white"
              >
                Complete Setup
                <Check className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
