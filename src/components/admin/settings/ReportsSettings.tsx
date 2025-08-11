import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Badge } from '../../ui/badge';
import { BarChart3, Download, Calendar, TrendingUp, Users, Package } from 'lucide-react';

const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (ReportsSettings):', query, values);
    
    if (query.includes('system_settings')) {
      return Promise.resolve([
        { key: 'sales_analytics_enabled', value: true, category: 'reports' },
        { key: 'customer_analytics_enabled', value: true, category: 'reports' },
        { key: 'inventory_reports_enabled', value: true, category: 'reports' },
        { key: 'compliance_reports_enabled', value: true, category: 'reports' }
      ]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

const ReportsSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [, setLoading] = useState(false);

  const reportTypes = [
    {
      id: 'sales_analytics',
      name: 'Sales Analytics',
      description: 'Revenue tracking, product performance, conversion rates',
      icon: TrendingUp,
      enabled: true,
      frequency: 'daily',
      metrics: ['Revenue', 'Orders', 'Conversion Rate', 'Average Order Value']
    },
    {
      id: 'customer_analytics',
      name: 'Customer Analytics',
      description: 'Customer behavior, retention, lifetime value',
      icon: Users,
      enabled: true,
      frequency: 'weekly',
      metrics: ['New Customers', 'Retention Rate', 'CLV', 'Segmentation']
    },
    {
      id: 'inventory_reports',
      name: 'Inventory Reports',
      description: 'Stock levels, reorder alerts, product movement',
      icon: Package,
      enabled: true,
      frequency: 'daily',
      metrics: ['Stock Levels', 'Low Stock Alerts', 'Product Movement', 'Waste Tracking']
    },
    {
      id: 'compliance_reports',
      name: 'Compliance Reports',
      description: 'Regulatory tracking, lab testing, age verification',
      icon: BarChart3,
      enabled: true,
      frequency: 'monthly',
      metrics: ['Age Verification', 'Lab Testing', 'State Compliance', 'Audit Trail']
    }
  ];

  const scheduledReports = [
    {
      id: 'daily_sales',
      name: 'Daily Sales Summary',
      type: 'sales_analytics',
      schedule: 'Daily at 9:00 AM',
      recipients: ['admin@rise-via.com', 'manager@rise-via.com'],
      lastSent: '2025-01-11 09:00:00',
      status: 'active'
    },
    {
      id: 'weekly_inventory',
      name: 'Weekly Inventory Report',
      type: 'inventory_reports',
      schedule: 'Monday at 8:00 AM',
      recipients: ['inventory@rise-via.com'],
      lastSent: '2025-01-06 08:00:00',
      status: 'active'
    },
    {
      id: 'monthly_compliance',
      name: 'Monthly Compliance Report',
      type: 'compliance_reports',
      schedule: '1st of month at 10:00 AM',
      recipients: ['compliance@rise-via.com', 'legal@rise-via.com'],
      lastSent: '2025-01-01 10:00:00',
      status: 'active'
    }
  ];

  useEffect(() => {
    loadReportSettings();
  }, []);

  const loadReportSettings = async () => {
    try {
      const data = await sql`
        SELECT * FROM system_settings 
        WHERE category = 'reports'
      `;
      
      const settingsMap: Record<string, unknown> = {};
      data.forEach((setting: { key: string; value: unknown }) => {
        settingsMap[setting.key] = setting.value;
      });
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load report settings:', error);
    }
  };

  const saveReportSetting = async (key: string, value: unknown) => {
    setLoading(true);
    try {
      await sql`
        INSERT INTO system_settings (key, value, category, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, 'reports', NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = EXCLUDED.updated_at
      `;
      
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to save report setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    console.log(`Generating ${reportType} report...`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reports & Analytics</h3>
          <p className="text-sm text-gray-600">Configure reporting settings and analytics dashboards</p>
        </div>
        <Button onClick={loadReportSettings} variant="outline" className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <report.icon className="h-5 w-5 text-risevia-purple" />
                  <span>{report.name}</span>
                </div>
                <Switch
                  checked={settings[`${report.id}_enabled`] !== false}
                  onCheckedChange={(checked) => saveReportSetting(`${report.id}_enabled`, checked)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{report.description}</p>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Key Metrics:</div>
                <div className="flex flex-wrap gap-1">
                  {report.metrics.map((metric) => (
                    <Badge key={metric} variant="outline" className="text-xs">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-gray-600">
                  Updates: {report.frequency}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateReport(report.id)}
                  className="flex items-center space-x-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Generate</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-risevia-purple" />
            <span>Scheduled Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{report.name}</span>
                    {getStatusBadge(report.status)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Schedule: {report.schedule}</div>
                    <div>Recipients: {report.recipients.join(', ')}</div>
                    <div>Last sent: {new Date(report.lastSent).toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Switch
                    checked={report.status === 'active'}
                    onCheckedChange={(checked) => {
                      console.log(`Toggle report ${report.id}: ${checked}`);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-risevia-purple">$12,345</div>
              <div className="text-sm text-gray-600">Today's Revenue</div>
              <div className="text-xs text-green-600">+15% vs yesterday</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">89</div>
              <div className="text-sm text-gray-600">Orders Today</div>
              <div className="text-xs text-green-600">+8% vs yesterday</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">234</div>
              <div className="text-sm text-gray-600">Products in Stock</div>
              <div className="text-xs text-yellow-600">12 low stock</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1,456</div>
              <div className="text-sm text-gray-600">Active Customers</div>
              <div className="text-xs text-green-600">+23 this week</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsSettings;
