import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Bell, Save, Smartphone, Mail, MessageSquare } from 'lucide-react';
import { sql } from '../../../lib/neon';

interface NotificationConfig {
  push_notifications?: {
    enabled: boolean;
    vapid_public_key?: string;
    vapid_private_key?: string;
  };
  sms_notifications?: {
    enabled: boolean;
    provider: 'twilio' | 'messagebird' | 'sns';
    account_sid?: string;
    auth_token?: string;
    from_number?: string;
  };
  email_notifications?: {
    order_placed: boolean;
    order_shipped: boolean;
    order_delivered: boolean;
    order_cancelled: boolean;
    payment_received: boolean;
    payment_failed: boolean;
    low_stock_alert: boolean;
    new_customer_signup: boolean;
    customer_birthday: boolean;
    abandoned_cart: boolean;
    review_reminder: boolean;
    loyalty_points_earned: boolean;
  };
  notification_channels?: {
    order_updates: ('email' | 'sms' | 'push')[];
    marketing: ('email' | 'sms' | 'push')[];
    security: ('email' | 'sms' | 'push')[];
    system: ('email' | 'push')[];
  };
  quiet_hours?: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
  };
}

interface SystemSetting {
  setting_key: string;
  setting_value: string;
  updated_at?: string;
}

const NotificationSettings: React.FC = () => {
  const [config, setConfig] = useState<NotificationConfig>({
    push_notifications: {
      enabled: false,
      vapid_public_key: '',
      vapid_private_key: ''
    },
    sms_notifications: {
      enabled: false,
      provider: 'twilio',
      account_sid: '',
      auth_token: '',
      from_number: ''
    },
    email_notifications: {
      order_placed: true,
      order_shipped: true,
      order_delivered: true,
      order_cancelled: true,
      payment_received: true,
      payment_failed: true,
      low_stock_alert: true,
      new_customer_signup: true,
      customer_birthday: false,
      abandoned_cart: false,
      review_reminder: false,
      loyalty_points_earned: true
    },
    notification_channels: {
      order_updates: ['email'],
      marketing: ['email'],
      security: ['email'],
      system: ['email']
    },
    quiet_hours: {
      enabled: false,
      start_time: '22:00',
      end_time: '08:00',
      timezone: 'America/Denver'
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotificationConfig();
  }, []);

  const loadNotificationConfig = async () => {
    try {
      const data = await sql<SystemSetting[]>`
        SELECT * FROM system_settings 
        WHERE setting_key = 'notification_config'
        LIMIT 1
      `;
      if (data && data[0]) {
        setConfig(JSON.parse(data[0].setting_value));
      }
    } catch (error) {
      console.error('Failed to load notification config:', error);
    }
  };

  const saveNotificationConfig = async () => {
    setLoading(true);
    try {
      await sql`
        INSERT INTO system_settings (setting_key, setting_value, updated_at)
        VALUES ('notification_config', ${JSON.stringify(config)}, NOW())
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = ${JSON.stringify(config)}, updated_at = NOW()
      `;
      alert('Notification settings saved successfully!');
    } catch (error) {
      console.error('Failed to save notification config:', error);
      alert('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = (category: keyof NonNullable<NotificationConfig['notification_channels']>, channel: string) => {
    const channels = config.notification_channels?.[category] || [];
    
    // Type guard to ensure channel is valid for the category
    if (category === 'system' && channel === 'sms') {
      return; // System category doesn't support SMS
    }
    
    const typedChannel = channel as any; // We've already validated above
    const updated = channels.includes(typedChannel)
      ? channels.filter(c => c !== typedChannel)
      : [...channels, typedChannel];
    
    setConfig({
      ...config,
      notification_channels: {
        ...config.notification_channels,
        [category]: updated
      } as NotificationConfig['notification_channels']
    });
  };

  const getAvailableChannels = (category: keyof NonNullable<NotificationConfig['notification_channels']>): string[] => {
    if (category === 'system') {
      return ['email', 'push'];
    }
    return ['email', 'sms', 'push'];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notification Settings</h3>
          <p className="text-sm text-gray-600">Configure how notifications are sent to customers and admins</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="push_enabled"
              checked={config.push_notifications?.enabled}
              onCheckedChange={(checked) => setConfig({
                ...config,
                push_notifications: {
                  ...config.push_notifications!,
                  enabled: checked
                }
              })}
            />
            <Label htmlFor="push_enabled">Enable Push Notifications</Label>
          </div>
          
          {config.push_notifications?.enabled && (
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vapid_public">VAPID Public Key</Label>
                <Input
                  id="vapid_public"
                  value={config.push_notifications.vapid_public_key}
                  onChange={(e) => setConfig({
                    ...config,
                    push_notifications: {
                      ...config.push_notifications!,
                      vapid_public_key: e.target.value
                    }
                  })}
                  placeholder="Enter VAPID public key"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vapid_private">VAPID Private Key</Label>
                <Input
                  id="vapid_private"
                  type="password"
                  value={config.push_notifications.vapid_private_key}
                  onChange={(e) => setConfig({
                    ...config,
                    push_notifications: {
                      ...config.push_notifications!,
                      vapid_private_key: e.target.value
                    }
                  })}
                  placeholder="Enter VAPID private key"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="sms_enabled"
              checked={config.sms_notifications?.enabled}
              onCheckedChange={(checked) => setConfig({
                ...config,
                sms_notifications: {
                  ...config.sms_notifications!,
                  enabled: checked
                }
              })}
            />
            <Label htmlFor="sms_enabled">Enable SMS Notifications</Label>
          </div>
          
          {config.sms_notifications?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sms_provider">SMS Provider</Label>
                <select
                  id="sms_provider"
                  value={config.sms_notifications.provider}
                  onChange={(e) => setConfig({
                    ...config,
                    sms_notifications: {
                      ...config.sms_notifications!,
                      provider: e.target.value as 'twilio' | 'messagebird' | 'sns'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-risevia-purple"
                >
                  <option value="twilio">Twilio</option>
                  <option value="messagebird">MessageBird</option>
                  <option value="sns">Amazon SNS</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from_number">From Number</Label>
                <Input
                  id="from_number"
                  value={config.sms_notifications.from_number}
                  onChange={(e) => setConfig({
                    ...config,
                    sms_notifications: {
                      ...config.sms_notifications!,
                      from_number: e.target.value
                    }
                  })}
                  placeholder="+1234567890"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account_sid">Account SID</Label>
                <Input
                  id="account_sid"
                  value={config.sms_notifications.account_sid}
                  onChange={(e) => setConfig({
                    ...config,
                    sms_notifications: {
                      ...config.sms_notifications!,
                      account_sid: e.target.value
                    }
                  })}
                  placeholder="Enter account SID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auth_token">Auth Token</Label>
                <Input
                  id="auth_token"
                  type="password"
                  value={config.sms_notifications.auth_token}
                  onChange={(e) => setConfig({
                    ...config,
                    sms_notifications: {
                      ...config.sms_notifications!,
                      auth_token: e.target.value
                    }
                  })}
                  placeholder="Enter auth token"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(config.email_notifications || {}).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={`email_${key}`} className="capitalize">
                  {key.replace(/_/g, ' ')}
                </Label>
                <Switch
                  id={`email_${key}`}
                  checked={enabled}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    email_notifications: {
                      ...config.email_notifications!,
                      [key]: checked
                    }
                  })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(config.notification_channels || {}).map(([category, channels]) => (
              <div key={category} className="space-y-2">
                <Label className="capitalize">{category.replace(/_/g, ' ')}</Label>
                <div className="flex gap-4">
                  {getAvailableChannels(category as keyof NonNullable<NotificationConfig['notification_channels']>).map((channel) => (
                    <label key={channel} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={channels.includes(channel as any)}
                        onChange={() => toggleChannel(category as keyof NonNullable<NotificationConfig['notification_channels']>, channel)}
                        className="rounded border-gray-300 text-risevia-purple focus:ring-risevia-purple"
                      />
                      <span className="capitalize">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="quiet_hours"
              checked={config.quiet_hours?.enabled}
              onCheckedChange={(checked) => setConfig({
                ...config,
                quiet_hours: {
                  ...config.quiet_hours!,
                  enabled: checked
                }
              })}
            />
            <Label htmlFor="quiet_hours">Enable Quiet Hours (No notifications during specified times)</Label>
          </div>
          
          {config.quiet_hours?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={config.quiet_hours.start_time}
                  onChange={(e) => setConfig({
                    ...config,
                    quiet_hours: {
                      ...config.quiet_hours!,
                      start_time: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={config.quiet_hours.end_time}
                  onChange={(e) => setConfig({
                    ...config,
                    quiet_hours: {
                      ...config.quiet_hours!,
                      end_time: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={config.quiet_hours.timezone}
                  onChange={(e) => setConfig({
                    ...config,
                    quiet_hours: {
                      ...config.quiet_hours!,
                      timezone: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-risevia-purple"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={saveNotificationConfig}
          disabled={loading}
          className="flex items-center gap-2 bg-risevia-purple hover:bg-risevia-purple/90"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
