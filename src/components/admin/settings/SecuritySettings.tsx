import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Badge } from '../../ui/badge';
import { Shield, Lock, Eye, AlertTriangle, Activity } from 'lucide-react';

const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: unknown[]) => {
    if (!strings || !strings.length) {
      console.log('Mock SQL Query (SecuritySettings): strings is undefined or empty');
      return Promise.resolve([]);
    }
    const query = strings.join('?');
    console.log('Mock SQL Query (SecuritySettings):', query, values);
    
    if (query.includes('system_settings') && query.includes('security')) {
      return Promise.resolve([
        { key: 'two_factor_auth', value: false },
        { key: 'session_timeout', value: true },
        { key: 'ip_restrictions', value: false },
        { key: 'audit_logging', value: true },
        { key: 'failed_login_protection', value: true },
        { key: 'session_timeout_minutes', value: 60 },
        { key: 'max_failed_attempts', value: 5 },
        { key: 'lockout_duration', value: 30 },
        { key: 'allowed_ips', value: '' }
      ]);
    }
    
    if (query.includes('admin_login') || query.includes('UNION ALL')) {
      return Promise.resolve([
        {
          action: 'admin_login',
          description: 'Admin user logged in',
          user_email: 'admin@rise-via.com',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          status: 'success'
        },
        {
          action: 'settings_update',
          description: 'Updated API settings',
          user_email: 'manager@rise-via.com',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          status: 'success'
        },
        {
          action: 'failed_login',
          description: 'Failed login attempt',
          user_email: 'unknown@example.com',
          created_at: new Date(Date.now() - 10800000).toISOString(),
          status: 'failed'
        }
      ]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [auditLogs, setAuditLogs] = useState<Array<{ action: string; description: string; user_email: string; created_at: string; status: string }>>([]);
  const [, setLoading] = useState(false);

  const securityFeatures = [
    {
      id: 'two_factor_auth',
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for admin accounts',
      enabled: false,
      category: 'authentication'
    },
    {
      id: 'session_timeout',
      name: 'Session Timeout',
      description: 'Auto-logout after inactivity',
      enabled: true,
      category: 'session'
    },
    {
      id: 'ip_restrictions',
      name: 'IP Address Restrictions',
      description: 'Limit admin access to specific IPs',
      enabled: false,
      category: 'access'
    },
    {
      id: 'audit_logging',
      name: 'Audit Logging',
      description: 'Log all admin actions',
      enabled: true,
      category: 'monitoring'
    },
    {
      id: 'failed_login_protection',
      name: 'Failed Login Protection',
      description: 'Lock accounts after failed attempts',
      enabled: true,
      category: 'authentication'
    }
  ];

  useEffect(() => {
    loadSecuritySettings();
    loadAuditLogs();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const data = await sql`
        SELECT * FROM system_settings 
        WHERE category = 'security'
      `;
      
      const settingsMap: Record<string, unknown> = {};
      (data as Array<{ key: string; value: unknown }>).forEach((setting: { key: string; value: unknown }) => {
        settingsMap[setting.key] = setting.value;
      });
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const logs = await sql`
        SELECT 
          'admin_login' as action,
          'Admin user logged in' as description,
          'admin@rise-via.com' as user_email,
          NOW() - INTERVAL '1 hour' as created_at,
          'success' as status
        UNION ALL
        SELECT 
          'settings_update' as action,
          'Updated API settings' as description,
          'manager@rise-via.com' as user_email,
          NOW() - INTERVAL '2 hours' as created_at,
          'success' as status
        UNION ALL
        SELECT 
          'failed_login' as action,
          'Failed login attempt' as description,
          'unknown@example.com' as user_email,
          NOW() - INTERVAL '3 hours' as created_at,
          'failed' as status
        ORDER BY created_at DESC
        LIMIT 10
      `;
      
      setAuditLogs(logs as Array<{ action: string; description: string; user_email: string; created_at: string; status: string }>);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  };

  const saveSecuritySetting = async (key: string, value: unknown) => {
    setLoading(true);
    try {
      await sql`
        INSERT INTO system_settings (key, value, category, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, 'security', NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = EXCLUDED.updated_at
      `;
      
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to save security setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Security Settings</h3>
          <p className="text-sm text-gray-600">Configure security features and monitor system activity</p>
        </div>
        <Button onClick={loadAuditLogs} variant="outline" className="flex items-center space-x-2">
          <Activity className="h-4 w-4" />
          <span>Refresh Logs</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-risevia-purple" />
              <span>Security Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{feature.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <Switch
                  checked={settings[feature.id] !== false}
                  onCheckedChange={(checked) => saveSecuritySetting(feature.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-risevia-purple" />
              <span>Access Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session_timeout_minutes">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout_minutes"
                type="number"
                min="5"
                max="480"
                defaultValue={String(settings.session_timeout_minutes || '60')}
                onBlur={(e) => saveSecuritySetting('session_timeout_minutes', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_failed_attempts">Max Failed Login Attempts</Label>
              <Input
                id="max_failed_attempts"
                type="number"
                min="3"
                max="10"
                defaultValue={String(settings.max_failed_attempts || '5')}
                onBlur={(e) => saveSecuritySetting('max_failed_attempts', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lockout_duration">Account Lockout Duration (minutes)</Label>
              <Input
                id="lockout_duration"
                type="number"
                min="5"
                max="1440"
                defaultValue={String(settings.lockout_duration || '30')}
                onBlur={(e) => saveSecuritySetting('lockout_duration', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allowed_ips">Allowed IP Addresses (comma-separated)</Label>
              <Input
                id="allowed_ips"
                placeholder="192.168.1.1, 10.0.0.1"
                defaultValue={String(settings.allowed_ips || '')}
                onBlur={(e) => saveSecuritySetting('allowed_ips', e.target.value)}
              />
              <p className="text-xs text-gray-500">Leave empty to allow all IPs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-risevia-purple" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {log.status === 'failed' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Activity className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{log.description}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {log.user_email} • {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {auditLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recent activity found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
