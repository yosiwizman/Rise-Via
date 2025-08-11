import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Switch } from '../../ui/switch';
import { Mail, Send, Settings, Zap } from 'lucide-react';
import { sql } from '../../../lib/neon';

const EmailSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [, setLoading] = useState(false);

  const emailTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'Sent to new customers after registration',
      subject: 'Welcome to Rise-Via Cannabis',
      enabled: true
    },
    {
      id: 'order_confirmation',
      name: 'Order Confirmation',
      description: 'Sent after successful order placement',
      subject: 'Your Rise-Via Order Confirmation',
      enabled: true
    },
    {
      id: 'abandoned_cart',
      name: 'Abandoned Cart',
      description: 'Sent when cart is abandoned for 24 hours',
      subject: 'Complete Your Rise-Via Purchase',
      enabled: false
    },
    {
      id: 'restock_notification',
      name: 'Restock Notification',
      description: 'Sent when out-of-stock items are available',
      subject: 'Your Favorite Product is Back in Stock!',
      enabled: false
    }
  ];

  const automationWorkflows = [
    {
      id: 'welcome_series',
      name: 'Welcome Series',
      description: '3-email series for new customers',
      trigger: 'Customer Registration',
      enabled: true,
      emails: ['Welcome', 'Product Guide', 'First Purchase Discount']
    },
    {
      id: 'loyalty_program',
      name: 'Loyalty Program',
      description: 'Points and rewards notifications',
      trigger: 'Points Earned/Redeemed',
      enabled: true,
      emails: ['Points Earned', 'Reward Available', 'Birthday Bonus']
    },
    {
      id: 'compliance_reminders',
      name: 'Compliance Reminders',
      description: 'Age verification and legal notices',
      trigger: 'Regulatory Requirements',
      enabled: true,
      emails: ['Age Verification', 'Legal Updates', 'State Compliance']
    }
  ];

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = async () => {
    try {
      const data = await sql`
        SELECT * FROM system_settings 
        WHERE category = 'email'
      `;
      
      const settingsMap: Record<string, any> = {};
      data.forEach((setting: any) => {
        settingsMap[setting.key] = setting.value;
      });
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load email settings:', error);
    }
  };

  const saveEmailSettings = async (key: string, value: any) => {
    setLoading(true);
    try {
      await sql`
        INSERT INTO system_settings (key, value, category, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, 'email', NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = EXCLUDED.updated_at
      `;
      
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to save email settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const testEmailDelivery = async () => {
    console.log('Testing email delivery...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Settings</h3>
          <p className="text-sm text-gray-600">Configure email delivery and automation workflows</p>
        </div>
        <Button onClick={testEmailDelivery} variant="outline" className="flex items-center space-x-2">
          <Send className="h-4 w-4" />
          <span>Test Email</span>
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-risevia-purple" />
                <span>General Email Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    defaultValue={settings.from_name || 'Rise-Via Cannabis'}
                    onBlur={(e) => saveEmailSettings('from_name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    type="email"
                    defaultValue={settings.from_email || 'noreply@rise-via.com'}
                    onBlur={(e) => saveEmailSettings('from_email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reply_to">Reply-To Email</Label>
                  <Input
                    id="reply_to"
                    type="email"
                    defaultValue={settings.reply_to || 'support@rise-via.com'}
                    onBlur={(e) => saveEmailSettings('reply_to', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    defaultValue={settings.support_email || 'support@rise-via.com'}
                    onBlur={(e) => saveEmailSettings('support_email', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Enable email notifications for customers</p>
                  </div>
                  <Switch
                    checked={settings.notifications_enabled !== false}
                    onCheckedChange={(checked) => saveEmailSettings('notifications_enabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-600">Allow marketing and promotional emails</p>
                  </div>
                  <Switch
                    checked={settings.marketing_enabled !== false}
                    onCheckedChange={(checked) => saveEmailSettings('marketing_enabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-risevia-purple" />
                <span>Email Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{template.name}</span>
                        {template.enabled && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <p className="text-xs text-gray-500">Subject: {template.subject}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={template.enabled}
                        onCheckedChange={(checked) => {
                          console.log(`Toggle ${template.id}: ${checked}`);
                        }}
                      />
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-risevia-purple" />
                <span>Email Automation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationWorkflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{workflow.name}</span>
                        {workflow.enabled && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Running</span>
                        )}
                      </div>
                      <Switch
                        checked={workflow.enabled}
                        onCheckedChange={(checked) => {
                          console.log(`Toggle workflow ${workflow.id}: ${checked}`);
                        }}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Trigger:</span> {workflow.trigger}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Emails:</span> {workflow.emails.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Email Delivery Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-risevia-purple">1,234</div>
                  <div className="text-sm text-gray-600">Emails Sent</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-gray-600">Delivery Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24.3%</div>
                  <div className="text-sm text-gray-600">Open Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">3.2%</div>
                  <div className="text-sm text-gray-600">Click Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailSettings;
