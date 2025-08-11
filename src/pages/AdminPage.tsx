import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Package, Upload, FileText, DollarSign, BarChart3, Users, Settings, Activity, Warehouse, CreditCard, Bot, TrendingUp, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { SEOHead } from '../components/SEOHead';
import { CustomerList } from '../components/admin/CustomerList';
import { DashboardMetrics } from '../components/admin/DashboardMetrics';
import { RevenueAnalyticsDashboard } from '../components/admin/RevenueAnalyticsDashboard';
import { CustomerIntelligenceDashboard } from '../components/admin/CustomerIntelligenceDashboard';
import { InventoryManagementDashboard } from '../components/admin/InventoryManagementDashboard';
import { ProductManager } from '../components/admin/ProductManager';
import { ProductMediaManager } from '../components/admin/ProductMediaManager';
import { BulkProductUpload } from '../components/admin/BulkProductUpload';
import { OrderManager } from '../components/admin/OrderManager';
import { InventoryManager } from '../components/admin/InventoryManager';
import { ActivityLogs } from '../components/admin/ActivityLogs';
import { PaymentSettings } from '../components/admin/PaymentSettings';
import { AIContentGenerator } from '../components/admin/AIContentGenerator';
import { EmailManager } from '../components/admin/EmailManager';
import { LabResultsManager } from '../components/admin/LabResultsManager';
import { ComplianceReports } from './admin/ComplianceReports';

export const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken === 'admin123') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      localStorage.setItem('adminToken', 'admin123');
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials. Use admin/admin123 for demo.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 flex items-center justify-center">
        <SEOHead
          title="Admin Login - RiseViA"
          description="Admin access to RiseViA cannabis e-commerce platform"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        >
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 mx-auto text-risevia-purple mb-4" />
            <h1 className="text-2xl font-bold text-risevia-black">Admin Login</h1>
            <p className="text-risevia-charcoal">Access the RiseViA admin dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal">
              Login
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600">
            <strong>Demo Credentials:</strong><br />
            Username: admin<br />
            Password: admin123
          </div>
        </motion.div>
      </div>
    );
  }

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue Analytics', icon: TrendingUp },
    { id: 'customer-intelligence', label: 'Customer Intelligence', icon: Brain },
    { id: 'inventory-analytics', label: 'Inventory Analytics', icon: Warehouse },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'ai-content', label: 'AI Content', icon: Bot },
    { id: 'email', label: 'Email Management', icon: FileText },
    { id: 'uploads', label: 'Media', icon: Upload },
    { id: 'lab-results', label: 'Lab Results', icon: FileText },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'payments', label: 'Payment Settings', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardMetrics />;
      
      case 'revenue':
        return <RevenueAnalyticsDashboard />;
      
      case 'customer-intelligence':
        return <CustomerIntelligenceDashboard />;
      
      case 'inventory-analytics':
        return <InventoryManagementDashboard />;
      
      case 'orders':
        return <OrderManager />;
      
      case 'products':
        return <ProductManager />;
      
      case 'inventory':
        return <InventoryManager />;
      
      case 'customers':
        return <CustomerList />;
      
      case 'activity':
        return <ActivityLogs />;
      
      case 'payments':
        return <PaymentSettings />;
      
      case 'ai-content':
        return <AIContentGenerator />;
      
      case 'email':
        return <EmailManager />;
      
      case 'uploads':
        return (
          <div className="space-y-6">
            <ProductMediaManager />
            <BulkProductUpload />
          </div>
        );
      
      case 'lab-results':
        return <LabResultsManager />;

      case 'compliance':
        return <ComplianceReports />;
      
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">This section is under development.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50">
      <SEOHead
        title="Admin Dashboard - RiseViA"
        description="Administrative interface for RiseViA cannabis e-commerce platform"
      />
      
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-risevia-purple" />
              <h1 className="text-2xl font-bold text-risevia-black">RiseViA Admin</h1>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64">
            <nav className="space-y-2">
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-risevia-purple to-risevia-teal text-white'
                        : 'text-risevia-charcoal hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
