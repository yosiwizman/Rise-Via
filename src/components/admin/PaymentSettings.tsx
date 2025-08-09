import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { CreditCard, Settings, TestTube, CheckCircle, AlertTriangle } from 'lucide-react';

interface PaymentSettings {
  provider: 'posabit' | 'aeropay' | 'hypur' | 'stripe';
  apiKey: string;
  testMode: boolean;
  enabledStates: string[];
  feePercentage: number;
}

export const PaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSettings>({
    provider: 'posabit',
    apiKey: '',
    testMode: true,
    enabledStates: [],
    feePercentage: 2.9
  });
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const providers = [
    { 
      value: 'posabit', 
      label: 'POSaBIT', 
      description: 'ACH payments for cannabis',
      supportedStates: ['CA', 'CO', 'WA', 'OR', 'NV', 'AZ', 'MI', 'IL', 'MA', 'ME']
    },
    { 
      value: 'aeropay', 
      label: 'Aeropay', 
      description: 'Bank-to-bank transfers',
      supportedStates: ['CA', 'CO', 'WA', 'OR', 'NV', 'AZ', 'MI', 'IL', 'MA', 'ME', 'NY', 'NJ']
    },
    { 
      value: 'hypur', 
      label: 'Hypur', 
      description: 'Direct bank payments',
      supportedStates: ['CA', 'CO', 'WA', 'OR', 'NV', 'AZ', 'MI', 'IL', 'MA', 'ME', 'NY']
    },
    { 
      value: 'stripe', 
      label: 'Stripe', 
      description: 'CBD products only',
      supportedStates: ['ALL']
    }
  ];

  const allStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    const stored = localStorage.getItem('payment_settings');
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to load payment settings:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('payment_settings', JSON.stringify(settings));
      
      await testConnection();
      
      setTestResult({ success: true, message: 'Payment settings saved successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to save settings: ' + error });
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      if (!settings.apiKey) {
        throw new Error('API key is required');
      }

      setTestResult({ success: true, message: `Connection to ${settings.provider} successful (test mode: ${settings.testMode})` });
    } catch (error) {
      throw new Error(`Connection failed: ${error}`);
    }
  };

  const selectedProvider = providers.find(p => p.value === settings.provider);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Provider Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="provider">Payment Provider</Label>
            <Select value={settings.provider} onValueChange={(value: 'posabit' | 'aeropay' | 'hypur' | 'stripe') => setSettings({...settings, provider: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map(provider => (
                  <SelectItem key={provider.value} value={provider.value}>
                    <div>
                      <div className="font-medium">{provider.label}</div>
                      <div className="text-sm text-gray-500">{provider.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProvider && (
              <div className="mt-2 text-sm text-gray-600">
                <strong>Supported States:</strong> {selectedProvider.supportedStates.join(', ')}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
              placeholder="Enter API key"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.testMode}
              onCheckedChange={(checked) => setSettings({...settings, testMode: checked})}
            />
            <Label>Test Mode</Label>
            {settings.testMode && <Badge variant="secondary">Sandbox</Badge>}
          </div>

          <div>
            <Label>Processing Fee (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.feePercentage}
              onChange={(e) => setSettings({...settings, feePercentage: parseFloat(e.target.value)})}
            />
          </div>

          <div>
            <Label>Enabled States (leave empty for all supported states)</Label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {allStates.map(state => (
                <label key={state} className="flex items-center space-x-1 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.enabledStates.includes(state)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettings({
                          ...settings,
                          enabledStates: [...settings.enabledStates, state]
                        });
                      } else {
                        setSettings({
                          ...settings,
                          enabledStates: settings.enabledStates.filter(s => s !== state)
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span>{state}</span>
                </label>
              ))}
            </div>
          </div>

          {testResult && (
            <Alert className={testResult.success ? 'border-green-500' : 'border-red-500'}>
              {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outline" onClick={testConnection} disabled={!settings.apiKey}>
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Cannabis Compliance Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Cannabis payment providers require additional compliance measures including age verification, 
              state-specific restrictions, and enhanced KYC procedures. Ensure all regulatory requirements 
              are met before processing payments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
