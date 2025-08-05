import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Plus, Minus, Eye, EyeOff, Type, Palette, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  colorBlindMode: string;
  textSpacing: number;
  cursorSize: number;
}

export const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    colorBlindMode: 'none',
    textSpacing: 100,
    cursorSize: 100
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('risevia-accessibility');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        applySettings(parsed);
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('risevia-accessibility', JSON.stringify(updatedSettings));
    applySettings(updatedSettings);
  };

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    root.style.setProperty('--accessibility-font-scale', `${settings.fontSize / 100}`);
    
    if (settings.highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }
    
    if (settings.reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }
    
    root.classList.remove('accessibility-protanopia', 'accessibility-deuteranopia', 'accessibility-tritanopia');
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(`accessibility-${settings.colorBlindMode}`);
    }
    
    root.style.setProperty('--accessibility-text-spacing', `${settings.textSpacing / 100}`);
    
    root.style.setProperty('--accessibility-cursor-scale', `${settings.cursorSize / 100}`);
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 100,
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      colorBlindMode: 'none',
      textSpacing: 100,
      cursorSize: 100
    };
    updateSettings(defaultSettings);
  };

  const colorBlindOptions = [
    { value: 'none', label: 'None' },
    { value: 'protanopia', label: 'Protanopia' },
    { value: 'deuteranopia', label: 'Deuteranopia' },
    { value: 'tritanopia', label: 'Tritanopia' }
  ];

  return (
    <>
      {/* Accessibility Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-risevia-purple hover:bg-risevia-purple/90 text-white shadow-lg neon-glow"
          aria-label="Open accessibility settings"
        >
          <Accessibility className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-risevia-charcoal shadow-xl z-50 overflow-y-auto"
          >
            <Card className="h-full rounded-none border-0">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-risevia-black dark:text-white">
                    <Accessibility className="w-5 h-5" />
                    Accessibility
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close accessibility settings"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Font Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Font Size
                    </Label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {settings.fontSize}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSettings({ fontSize: Math.max(50, settings.fontSize - 10) })}
                      disabled={settings.fontSize <= 50}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => updateSettings({ fontSize: value })}
                      min={50}
                      max={200}
                      step={10}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSettings({ fontSize: Math.min(200, settings.fontSize + 10) })}
                      disabled={settings.fontSize >= 200}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    High Contrast
                  </Label>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
                  />
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    Reduce Motion
                  </Label>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                  />
                </div>

                {/* Color Blind Support */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Color Blind Support
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorBlindOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={settings.colorBlindMode === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSettings({ colorBlindMode: option.value })}
                        className={settings.colorBlindMode === option.value ? 
                          "bg-risevia-teal text-white" : 
                          "border-gray-300 hover:border-risevia-teal"
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Text Spacing */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Text Spacing</Label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {settings.textSpacing}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.textSpacing]}
                    onValueChange={([value]) => updateSettings({ textSpacing: value })}
                    min={100}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Cursor Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Cursor Size</Label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {settings.cursorSize}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.cursorSize]}
                    onValueChange={([value]) => updateSettings({ cursorSize: value })}
                    min={100}
                    max={300}
                    step={25}
                    className="w-full"
                  />
                </div>

                {/* Screen Reader Support */}
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Screen Reader Mode
                  </Label>
                  <Switch
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => updateSettings({ screenReader: checked })}
                  />
                </div>

                {/* Reset Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={resetSettings}
                    variant="outline"
                    className="w-full border-gray-300 hover:border-risevia-teal hover:text-risevia-teal"
                  >
                    Reset to Default
                  </Button>
                </div>

                {/* Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Settings are automatically saved and will persist across sessions.</p>
                  <p>For additional accessibility support, contact our team.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
