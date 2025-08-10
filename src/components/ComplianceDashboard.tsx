import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Shield, 
  TrendingUp,
  MapPin,
  Calendar,
  Download
} from 'lucide-react';
import { complianceService, type ComplianceAlert, type StateCompliance } from '../services/ComplianceService';

interface ComplianceStats {
  totalStates: number;
  compliantStates: number;
  pendingUpdates: number;
  criticalAlerts: number;
}

export default function ComplianceDashboard() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [stateCompliance, setStateCompliance] = useState<StateCompliance[]>([]);
  const [stats, setStats] = useState<ComplianceStats>({
    totalStates: 0,
    compliantStates: 0,
    pendingUpdates: 0,
    criticalAlerts: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setIsLoading(true);
      
      const [alertsData, statesData] = await Promise.all([
        complianceService.getComplianceAlerts(),
        complianceService.getAllStateCompliance()
      ]);

      setAlerts(alertsData);
      setStateCompliance(statesData);

      const criticalAlerts = alertsData.filter(alert => alert.severity === 'critical').length;
      const compliantStates = statesData.filter(state => state.isLegal).length;
      const pendingUpdates = alertsData.filter(alert => alert.actionRequired).length;

      setStats({
        totalStates: statesData.length,
        compliantStates,
        pendingUpdates,
        criticalAlerts
      });
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await complianceService.resolveComplianceAlert(alertId);
      await loadComplianceData();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const generateReport = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const report = await complianceService.getComplianceReport(startDate, endDate);
      
      const reportData = JSON.stringify(report, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${endDate}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const getSeverityColor = (severity: ComplianceAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getComplianceStatus = (state: StateCompliance) => {
    if (!state.isLegal) return { status: 'illegal', color: 'destructive', icon: AlertTriangle };
    if (!state.retailSalesAllowed) return { status: 'limited', color: 'default', icon: Clock };
    return { status: 'compliant', color: 'default', icon: CheckCircle };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor cannabis compliance across all states</p>
        </div>
        <Button onClick={generateReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total States</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStates}</div>
            <p className="text-xs text-muted-foreground">
              {stats.compliantStates} compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalStates > 0 ? Math.round((stats.compliantStates / stats.totalStates) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all monitored states
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Updates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingUpdates}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="states">State Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Alerts
              </CardTitle>
              <CardDescription>
                Active compliance alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
                  <p className="text-gray-600">No active compliance alerts at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} className="border-l-4 border-l-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <AlertTitle className="flex items-center gap-2">
                            {alert.title}
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </AlertTitle>
                          <AlertDescription className="mt-2">
                            {alert.description}
                          </AlertDescription>
                          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                            {alert.deadline && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Due: {new Date(alert.deadline).toLocaleDateString()}
                              </span>
                            )}
                            <span>States: {alert.affectedStates.join(', ')}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="states" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                State Compliance Overview
              </CardTitle>
              <CardDescription>
                Cannabis compliance status by state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stateCompliance.map((state) => {
                  const { status, icon: Icon } = getComplianceStatus(state);
                  return (
                    <Card key={state.state} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{state.state}</CardTitle>
                          <Icon className={`h-5 w-5 ${
                            status === 'compliant' ? 'text-green-500' : 
                            status === 'limited' ? 'text-yellow-500' : 'text-red-500'
                          }`} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Legal Status:</span>
                          <Badge variant={state.isLegal ? 'default' : 'destructive'}>
                            {state.isLegal ? 'Legal' : 'Illegal'}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Age Requirement:</span>
                          <span>{state.ageRequirement}+</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Retail Sales:</span>
                          <span>{state.retailSalesAllowed ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Delivery:</span>
                          <span>{state.deliveryAllowed ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax Rate:</span>
                          <span>{(state.taxRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Updated: {new Date(state.lastUpdated).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Audit Trail
              </CardTitle>
              <CardDescription>
                Recent compliance-related activities and validations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Trail</h3>
                <p className="text-gray-600">Compliance audit logs will appear here.</p>
                <Button variant="outline" className="mt-4">
                  View Full Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
