import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Globe, Clock, DollarSign, Shield, Save, CheckCircle, XCircle, RefreshCw, Cannabis } from 'lucide-react';
import { sql } from '../../../lib/neon';
import { flourishService } from '../../../services/flourishService';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [lastSyncTimes, setLastSyncTimes] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'EUR', name: 'Euro', symbol: '€' }
  ];

  useEffect(() => {
    if (!isInitialized) {
      loadSystemSettings();
      loadLastSyncTimes();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const loadSystemSettings = async () => {
    try {
      const data = await sql`
        SELECT * FROM system_settings 
        WHERE category = 'system' OR category = 'flourish' OR category IS NULL
      `;
      
      const settingsMap: Record<string, unknown> = {};
      (data as Array<{ key: string; value: unknown }>).forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load system settings:', error);
    }
  };

  const loadLastSyncTimes = async () => {
    try {
      const data = await sql`
        SELECT key, value FROM system_settings 
        WHERE category = 'flourish' AND key LIKE 'flourish_last_sync_%'
      `;
      
      const syncTimes: Record<string, string> = {};
      (data as Array<{ key: string; value: string }>).forEach((setting) => {
        const syncType = setting.key.replace('flourish_last_sync_', '');
        try {
          syncTimes[syncType] = JSON.parse(setting.value);
        } catch {
          syncTimes[syncType] = setting.value;
        }
      });
      
      setLastSyncTimes(syncTimes);
    } catch (error) {
      console.error('Failed to load sync times:', error);
    }
  };

  const saveSystemSettings = async (key: string, value: unknown) => {
    setLoading(true);
    try {
      await sql`
        INSERT INTO system_settings (key, value, category, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, 'system', NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = EXCLUDED.updated_at
      `;
      
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to save system settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFlourishSettings = async (key: string, value: unknown) => {
    setLoading(true);
    try {
      await sql`
        INSERT INTO system_settings (key, value, category, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, 'flourish', NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          category = 'flourish',
          updated_at = EXCLUDED.updated_at
      `;
      
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to save Flourish settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const testFlourishConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionMessage('');

    try {
      // Get current form values
      const form = document.getElementById('system-settings-form') as HTMLFormElement;
      const formData = new FormData(form);
      
      const apiKey = formData.get('flourish_api_key') as string;
      const environment = formData.get('flourish_environment') as string;
      const storeId = formData.get('flourish_store_id') as string;

      // Update service config with form values
      flourishService.updateConfig({
        apiKey,
        environment: environment as 'sandbox' | 'production',
        storeId
      });

      // Test the connection
      const result = await flourishService.testConnection();

      if (result.success && result.data) {
        setConnectionStatus('success');
        setConnectionMessage(`Connected to ${result.data.store_name || 'Flourish'}`);
        
        // Save the settings if connection is successful
        await saveFlourishSettings('flourish_api_key', apiKey);
        await saveFlourishSettings('flourish_environment', environment);
        await saveFlourishSettings('flourish_store_id', storeId);
        
        // Reload sync times
        await loadLastSyncTimes();
      } else {
        setConnectionStatus('error');
        setConnectionMessage(result.error || 'Connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage(error instanceof Error ? error.message : 'Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const syncFlourishProducts = async () => {
    setLoading(true);
    try {
      const result = await flourishService.syncProducts();
      if (result.success && result.data) {
        alert(`Sync complete: ${result.data.synced} products synced, ${result.data.failed} failed`);
        await loadLastSyncTimes();
      } else {
        alert(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      alert('Product sync failed');
    } finally {
      setLoading(false);
    }
  };

  const saveAllSettings = async () => {
    setLoading(true);
    try {
      const form = document.getElementById('system-settings-form') as HTMLFormElement;
      const formData = new FormData(form);
      
      const settingsToSave = [
        'site_name',
        'site_description',
        'contact_email',
        'contact_phone',
        'business_address',
        'timezone',
        'currency',
        'tax_rate',
        'age_verification_required',
        'maintenance_mode'
      ];

      for (const key of settingsToSave) {
        const value = formData.get(key);
        if (value !== null) {
          await saveSystemSettings(key, value);
        }
      }

      // Save Flourish settings
      const flourishSettings = [
        'flourish_api_key',
        'flourish_environment',
        'flourish_store_id'
      ];

      for (const key of flourishSettings) {
        const value = formData.get(key);
        if (value !== null && value !== '') {
          await saveFlourishSettings(key, value);
        }
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save all settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatLastSync = (syncType: string): string => {
    const timestamp = lastSyncTimes[syncType];
    if (!timestamp) return 'Never';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Never';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">System Settings</h3>
          <p className="text-sm text-gray-600">Configure general system and business settings</p>
        </div>
        <Button
          onClick={saveAllSettings}
          disabled={loading}
          className="flex items-center space-x-2 bg-risevia-purple hover:bg-risevia-purple/90"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving...' : 'Save All'}</span>
        </Button>
      </div>

      <form id="system-settings-form" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-risevia-purple" />
              <span>Site Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  name="site_name"
                  defaultValue={String(settings.site_name || 'Rise-Via Cannabis')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  defaultValue={String(settings.contact_email || 'info@rise-via.com')}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Input
                  id="site_description"
                  name="site_description"
                  defaultValue={String(settings.site_description || 'Premium cannabis products delivered to your door')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  defaultValue={String(settings.contact_phone || '(555) 123-4567')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business_address">Business Address</Label>
                <Input
                  id="business_address"
                  name="business_address"
                  defaultValue={String(settings.business_address || '123 Cannabis St, Denver, CO 80202')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-risevia-purple" />
              <span>Regional Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  name="timezone"
                  defaultValue={String(settings.timezone || 'America/Denver')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-risevia-purple"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  name="currency"
                  defaultValue={String(settings.currency || 'USD')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-risevia-purple"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-risevia-purple" />
              <span>Financial Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Default Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  name="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={String(settings.tax_rate || '8.25')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shipping_fee">Default Shipping Fee</Label>
                <Input
                  id="shipping_fee"
                  name="shipping_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={String(settings.shipping_fee || '9.99')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-risevia-green">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cannabis className="h-5 w-5 text-risevia-green" />
              <span>Flourish Integration (Required for Compliance)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Critical:</strong> Flourish integration is required for legal cannabis operation and seed-to-sale tracking compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flourish_api_key">API Key</Label>
                <Input
                  id="flourish_api_key"
                  name="flourish_api_key"
                  type="password"
                  placeholder="Enter your Flourish API key"
                  defaultValue={String(settings.flourish_api_key || '')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="flourish_environment">Environment</Label>
                <select
                  id="flourish_environment"
                  name="flourish_environment"
                  defaultValue={String(settings.flourish_environment || 'sandbox')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-risevia-purple"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="production">Production (Live)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="flourish_store_id">Store ID</Label>
                <Input
                  id="flourish_store_id"
                  name="flourish_store_id"
                  placeholder="Enter your Flourish Store ID"
                  defaultValue={String(settings.flourish_store_id || '')}
                />
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button
                  type="button"
                  onClick={testFlourishConnection}
                  disabled={testingConnection}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  {testingConnection ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      {connectionStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {connectionStatus === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      <span>Test Connection</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {connectionMessage && (
              <div className={`mt-2 p-3 rounded-lg ${
                connectionStatus === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {connectionMessage}
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Sync Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Last Connection:</span>
                  <span className="font-medium">{formatLastSync('connection')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Products Sync:</span>
                  <span className="font-medium">{formatLastSync('products')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Inventory Sync:</span>
                  <span className="font-medium">{formatLastSync('inventory')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Compliance Reports:</span>
                  <span className="font-medium">{formatLastSync('compliance_reports')}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  onClick={syncFlourishProducts}
                  disabled={loading || !settings.flourish_api_key}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Sync Products Now</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-risevia-purple" />
              <span>Compliance & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Age Verification Required</Label>
                  <p className="text-sm text-gray-600">Require age verification for all users</p>
                </div>
                <Switch
                  name="age_verification_required"
                  checked={settings.age_verification_required !== false}
                  onCheckedChange={(checked) => saveSystemSettings('age_verification_required', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Put site in maintenance mode</p>
                </div>
                <Switch
                  name="maintenance_mode"
                  checked={settings.maintenance_mode === true}
                  onCheckedChange={(checked) => saveSystemSettings('maintenance_mode', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowed_states">Allowed States (comma-separated)</Label>
                <Input
                  id="allowed_states"
                  name="allowed_states"
                  placeholder="CO, CA, WA, OR"
                  defaultValue={String(settings.allowed_states || 'CO, CA, WA, OR')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default SystemSettings;
