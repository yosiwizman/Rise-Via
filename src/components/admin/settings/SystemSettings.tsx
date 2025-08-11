import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Globe, Clock, DollarSign, Shield, Save } from 'lucide-react';

const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (SystemSettings):', query, values);
    
    if (query.includes('system_settings')) {
      return Promise.resolve([
        { key: 'site_name', value: 'Rise-Via Cannabis' },
        { key: 'site_description', value: 'Premium cannabis products delivered to your door' },
        { key: 'contact_email', value: 'info@rise-via.com' },
        { key: 'contact_phone', value: '(555) 123-4567' },
        { key: 'business_address', value: '123 Cannabis St, Denver, CO 80202' },
        { key: 'timezone', value: 'America/Denver' },
        { key: 'currency', value: 'USD' },
        { key: 'tax_rate', value: '8.25' },
        { key: 'age_verification_required', value: true },
        { key: 'maintenance_mode', value: false }
      ]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

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
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      const data = await sql`
        SELECT * FROM system_settings 
        WHERE category = 'system' OR category IS NULL
      `;
      
      const settingsMap: Record<string, unknown> = {};
      data.forEach((setting: { key: string; value: unknown }) => {
        settingsMap[setting.key] = setting.value;
      });
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load system settings:', error);
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
    } catch (error) {
      console.error('Failed to save all settings:', error);
    } finally {
      setLoading(false);
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
