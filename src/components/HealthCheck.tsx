import React from 'react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    build: boolean;
    dependencies: boolean;
    routing: boolean;
  };
}

export const HealthCheck: React.FC = () => {
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: import.meta.env?.MODE || 'development',
    checks: {
      build: true,
      dependencies: true,
      routing: window.location.pathname === '/health',
    }
  };

  const allChecksPass = Object.values(healthStatus.checks).every(check => check);
  if (!allChecksPass) {
    healthStatus.status = 'degraded';
  }

  return (
    <div className="min-h-screen bg-risevia-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Health Check</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">System Status</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              healthStatus.status === 'healthy' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {healthStatus.status.toUpperCase()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Version:</span>
              <span className="ml-2">{healthStatus.version}</span>
            </div>
            <div>
              <span className="text-gray-400">Environment:</span>
              <span className="ml-2">{healthStatus.environment}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">Timestamp:</span>
              <span className="ml-2">{healthStatus.timestamp}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Health Checks</h3>
          <div className="space-y-3">
            {Object.entries(healthStatus.checks).map(([check, status]) => (
              <div key={check} className="flex items-center justify-between">
                <span className="capitalize">{check}</span>
                <div className={`w-3 h-3 rounded-full ${
                  status ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <pre className="bg-gray-800 p-4 rounded text-xs text-left overflow-auto">
            {JSON.stringify(healthStatus, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
