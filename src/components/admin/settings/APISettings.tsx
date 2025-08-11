import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Switch } from '../../ui/switch';
import { Eye, EyeOff, Save, TestTube } from 'lucide-react';

const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (APISettings):', query, values);
    
    if (query.includes('api_settings')) {
      return Promise.resolve([{
        id: 'mock-api-id',
        service_name: 'openai',
        api_key_encrypted: 'sk-mock-key',
        configuration: {
          api_key: 'sk-mock-key',
          model: 'gpt-4',
          max_tokens: 1000
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

interface APIConfig {
  id?: string;
  service_name: string;
  api_key_encrypted: string;
  configuration: Record<string, any>;
  is_active: boolean;
}

const APISettings: React.FC = () => {
  const [configs, setConfigs] = useState<APIConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const apiServices = [
    {
      name: 'openai',
      label: 'OpenAI API',
      description: 'AI content generation and compliance checking',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'model', label: 'Default Model', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo'], default: 'gpt-4' },
        { key: 'max_tokens', label: 'Max Tokens', type: 'number', default: 1000 }
      ]
    },
    {
      name: 'stripe',
      label: 'Stripe Payments',
      description: 'Payment processing and subscription management',
      fields: [
        { key: 'publishable_key', label: 'Publishable Key', type: 'text', required: true },
        { key: 'secret_key', label: 'Secret Key', type: 'password', required: true },
        { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: true }
      ]
    },
    {
      name: 'resend',
      label: 'Resend Email',
      description: 'Email delivery and automation',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'from_email', label: 'From Email', type: 'email', default: 'noreply@rise-via.com' }
      ]
    },
    {
      name: 'cloudinary',
      label: 'Cloudinary Media',
      description: 'Image and video management',
      fields: [
        { key: 'cloud_name', label: 'Cloud Name', type: 'text', required: true },
        { key: 'api_key', label: 'API Key', type: 'text', required: true },
        { key: 'api_secret', label: 'API Secret', type: 'password', required: true }
      ]
    }
  ];

  useEffect(() => {
    loadAPIConfigs();
  }, []);

  const loadAPIConfigs = async () => {
    try {
      const data = await sql`SELECT * FROM api_settings ORDER BY service_name`;
      setConfigs(data as APIConfig[]);
    } catch (error) {
      console.error('Failed to load API configs:', error);
    }
  };

  const saveAPIConfig = async (serviceName: string, config: Record<string, any>) => {
    setLoading(true);
    try {
      const existingConfig = configs.find(c => c.service_name === serviceName);
      
      if (existingConfig) {
        await sql`
          UPDATE api_settings 
          SET configuration = ${JSON.stringify(config)}, updated_at = NOW()
          WHERE service_name = ${serviceName}
        `;
      } else {
        await sql`
          INSERT INTO api_settings (service_name, configuration, is_active, created_at)
          VALUES (${serviceName}, ${JSON.stringify(config)}, true, NOW())
        `;
      }
      
      await loadAPIConfigs();
    } catch (error) {
      console.error('Failed to save API config:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAPIConnection = async (serviceName: string) => {
    console.log(`Testing ${serviceName} connection...`);
  };

  const toggleKeyVisibility = (serviceKey: string) => {
    setShowKeys(prev => ({
      ...prev,
      [serviceKey]: !prev[serviceKey]
    }));
  };

  const getConfigValue = (serviceName: string, key: string) => {
    const config = configs.find(c => c.service_name === serviceName);
    return config?.configuration?.[key] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Integration Settings</h3>
          <p className="text-sm text-gray-600">Configure third-party API integrations for your platform</p>
        </div>
        <Button onClick={loadAPIConfigs} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue={apiServices[0].name} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {apiServices.map((service) => (
            <TabsTrigger key={service.name} value={service.name}>
              {service.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {apiServices.map((service) => (
          <TabsContent key={service.name} value={service.name}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">{service.label}</h4>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={configs.find(c => c.service_name === service.name)?.is_active || false}
                      onCheckedChange={async (checked) => {
                        await sql`
                          UPDATE api_settings 
                          SET is_active = ${checked}
                          WHERE service_name = ${service.name}
                        `;
                        loadAPIConfigs();
                      }}
                    />
                    <span className="text-sm">Active</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const config: Record<string, any> = {};
                  
                  service.fields.forEach(field => {
                    config[field.key] = formData.get(field.key) || field.default || '';
                  });
                  
                  await saveAPIConfig(service.name, config);
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={`${service.name}-${field.key}`}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="relative">
                          {field.type === 'select' ? (
                            <select
                              id={`${service.name}-${field.key}`}
                              name={field.key}
                              defaultValue={getConfigValue(service.name, field.key)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-risevia-purple"
                              required={field.required}
                            >
                              {(field as any).options?.map((option: string) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              id={`${service.name}-${field.key}`}
                              name={field.key}
                              type={field.type === 'password' && !showKeys[`${service.name}-${field.key}`] ? 'password' : 'text'}
                              defaultValue={getConfigValue(service.name, field.key)}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              required={field.required}
                            />
                          )}
                          {field.type === 'password' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              onClick={() => toggleKeyVisibility(`${service.name}-${field.key}`)}
                            >
                              {showKeys[`${service.name}-${field.key}`] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => testAPIConnection(service.name)}
                      className="flex items-center space-x-2"
                    >
                      <TestTube className="h-4 w-4" />
                      <span>Test Connection</span>
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 bg-risevia-purple hover:bg-risevia-purple/90"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default APISettings;
