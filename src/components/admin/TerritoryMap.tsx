import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { territoryService, type Territory } from '../../services/TerritoryService';
import { MapPin, Plus, Edit2, Trash2, Users, DollarSign, TrendingUp, Shield } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { motion } from 'framer-motion';

interface TerritoryMapProps {
  onTerritorySelect?: (territory: Territory) => void;
  selectedTerritoryId?: string;
}

export const TerritoryMap: React.FC<TerritoryMapProps> = ({
  onTerritorySelect,
  selectedTerritoryId
}) => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTerritories();
  }, [selectedState]);

  const loadTerritories = async () => {
    setLoading(true);
    try {
      const filters = selectedState !== 'all' ? { state: selectedState } : undefined;
      const data = await territoryService.getTerritories(filters);
      setTerritories(data);
    } catch (error) {
      console.error('Error loading territories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'protected':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'house':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProtectionIcon = (protectionType: string) => {
    switch (protectionType) {
      case 'first-to-sign':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'performance-based':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'time-limited':
        return <MapPin className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const filteredTerritories = territories.filter(territory =>
    territory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    territory.zip_codes.some(zip => zip.includes(searchTerm)) ||
    territory.assigned_rep_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const states = [
    'all', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Territory Management</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            <Button className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Territory
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, ZIP, or rep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {states.map(state => (
                <SelectItem key={state} value={state}>
                  {state === 'all' ? 'All States' : state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Protected</p>
                <p className="text-2xl font-bold text-purple-900">
                  {territories.filter(t => t.status === 'protected').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Assigned</p>
                <p className="text-2xl font-bold text-blue-900">
                  {territories.filter(t => t.status === 'assigned').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Available</p>
                <p className="text-2xl font-bold text-green-900">
                  {territories.filter(t => t.status === 'available').length}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${territories.reduce((sum, t) => sum + (t.metrics?.monthly_revenue || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Territory Display */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-risevia-purple"></div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTerritories.map((territory, index) => (
              <motion.div
                key={territory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedTerritoryId === territory.id ? 'border-risevia-purple' : 'border-gray-200'
                }`}
                onClick={() => onTerritorySelect?.(territory)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {territory.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {territory.city ? `${territory.city}, ` : ''}{territory.state}
                    </p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(territory.status)}>
                    {territory.status}
                  </Badge>
                </div>

                {territory.assigned_rep_name && (
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {territory.assigned_rep_name}
                    </span>
                    {getProtectionIcon(territory.protection_type)}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">ZIP Codes:</span>
                    <span className="font-medium">{territory.zip_codes.length}</span>
                  </div>
                  {territory.metrics && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Accounts:</span>
                        <span className="font-medium">{territory.metrics.total_accounts}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Monthly Revenue:</span>
                        <span className="font-medium text-green-600">
                          ${territory.metrics.monthly_revenue.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Territory</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Assigned Rep</th>
                  <th className="text-left p-2">ZIP Codes</th>
                  <th className="text-left p-2">Accounts</th>
                  <th className="text-left p-2">Revenue</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTerritories.map((territory) => (
                  <tr
                    key={territory.id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => onTerritorySelect?.(territory)}
                  >
                    <td className="p-2 font-medium">{territory.name}</td>
                    <td className="p-2">
                      {territory.city ? `${territory.city}, ` : ''}{territory.state}
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className={getStatusColor(territory.status)}>
                        {territory.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {territory.assigned_rep_name || '-'}
                    </td>
                    <td className="p-2">{territory.zip_codes.length}</td>
                    <td className="p-2">{territory.metrics?.total_accounts || 0}</td>
                    <td className="p-2 text-green-600 font-medium">
                      ${territory.metrics?.monthly_revenue.toLocaleString() || 0}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredTerritories.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No territories found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
