import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Settings, Users, Key, Mail, Shield, BarChart3 } from 'lucide-react';
import APISettings from './APISettings';
import UserRoleSettings from './UserRoleSettings';
import EmailSettings from './EmailSettings';
import SystemSettings from './SystemSettings';
import SecuritySettings from './SecuritySettings';
import ReportsSettings from './ReportsSettings';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Settings, component: SystemSettings },
    { id: 'users', label: 'User Management', icon: Users, component: UserRoleSettings },
    { id: 'api', label: 'API Settings', icon: Key, component: APISettings },
    { id: 'email', label: 'Email Settings', icon: Mail, component: EmailSettings },
    { id: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
    { id: 'reports', label: 'Reports', icon: BarChart3, component: ReportsSettings }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-risevia-purple" />
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {settingsTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <tab.icon className="h-5 w-5 text-risevia-purple" />
                  <span>{tab.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <tab.component />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminSettings;
