import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { territoryService, type Territory } from '../../services/TerritoryService';
import { salesRepService } from '../../services/b2b/SalesRepService';
import { User, MapPin, Shield, Calendar, ArrowRight, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';

interface TerritoryAssignmentProps {
  territoryId?: string;
  onAssignmentComplete?: () => void;
}

export const TerritoryAssignment: React.FC<TerritoryAssignmentProps> = ({
  territoryId,
  onAssignmentComplete
}) => {
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [protectionLevel, setProtectionLevel] = useState<'full' | 'partial' | 'none'>('full');
  const [protectionType, setProtectionType] = useState<string>('first-to-sign');
  const [loading, setLoading] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferReason, setTransferReason] = useState('');
  const [newRepId, setNewRepId] = useState('');

  useEffect(() => {
    if (territoryId) {
      loadTerritory();
    }
    loadSalesReps();
  }, [territoryId]);

  const loadTerritory = async () => {
    if (!territoryId) return;
    
    try {
      const data = await territoryService.getTerritoryById(territoryId);
      setTerritory(data);
    } catch (error) {
      console.error('Error loading territory:', error);
    }
  };

  const loadSalesReps = async () => {
    try {
      const reps = await salesRepService.getAllSalesReps();
      setSalesReps(reps);
    } catch (error) {
      console.error('Error loading sales reps:', error);
    }
  };

  const handleAssignment = async () => {
    if (!territory || !selectedRep) return;

    setLoading(true);
    try {
      await territoryService.assignTerritoryToRep(
        territory.id,
        selectedRep,
        'admin', // Would get from auth context
        protectionLevel
      );

      // Set protection rules
      await territoryService.setTerritoryProtectionRules(territory.id, {
        rule_type: protectionType as any,
        conditions: getProtectionConditions(),
        inheritance_rules: {
          allow_inheritance: protectionType === 'lifetime',
          require_approval: true
        },
        split_commission_rules: {
          enabled: false
        }
      });

      onAssignmentComplete?.();
      await loadTerritory();
    } catch (error) {
      console.error('Error assigning territory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!territory || !territory.assigned_rep_id || !newRepId || !transferReason) return;

    setLoading(true);
    try {
      await territoryService.transferTerritory(
        territory.id,
        territory.assigned_rep_id,
        newRepId,
        transferReason,
        'admin' // Would get from auth context
      );

      setShowTransferDialog(false);
      setTransferReason('');
      setNewRepId('');
      onAssignmentComplete?.();
      await loadTerritory();
    } catch (error) {
      console.error('Error transferring territory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProtectionConditions = () => {
    switch (protectionType) {
      case 'performance':
        return {
          minimum_accounts: 10,
          minimum_revenue: 50000,
          performance_threshold: 80
        };
      case 'time-based':
        return {
          time_period_months: 12
        };
      default:
        return {};
    }
  };

  const getProtectionBadge = (type: string) => {
    const badges = {
      'first-to-sign': { color: 'bg-purple-100 text-purple-800', label: 'Lifetime Protection' },
      'performance': { color: 'bg-blue-100 text-blue-800', label: 'Performance Based' },
      'time-based': { color: 'bg-orange-100 text-orange-800', label: 'Time Limited' },
      'none': { color: 'bg-gray-100 text-gray-800', label: 'No Protection' }
    };

    const badge = badges[type as keyof typeof badges] || badges.none;
    return <Badge variant="outline" className={badge.color}>{badge.label}</Badge>;
  };

  if (!territory) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">Select a territory to manage assignments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Territory Assignment</CardTitle>
            {territory.status === 'protected' && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                <Shield className="w-3 h-3 mr-1" />
                Protected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Territory Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {territory.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {territory.city ? `${territory.city}, ` : ''}{territory.state}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">ZIP Codes</p>
                <p className="text-xl font-bold">{territory.zip_codes.length}</p>
              </div>
            </div>

            {territory.assigned_rep_id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">Current Rep:</span>
                  </div>
                  <span className="font-semibold">{territory.assigned_rep_name}</span>
                </div>
                {territory.protection_start_date && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Assigned Since:</span>
                    </div>
                    <span className="text-sm">
                      {new Date(territory.protection_start_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Protection Type:</span>
                  {getProtectionBadge(territory.protection_type)}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Territory Available for Assignment</span>
              </div>
            )}

            {territory.metrics && (
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500">Total Accounts</p>
                  <p className="text-lg font-semibold">{territory.metrics.total_accounts}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Accounts</p>
                  <p className="text-lg font-semibold">{territory.metrics.active_accounts}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monthly Revenue</p>
                  <p className="text-lg font-semibold text-green-600">
                    ${territory.metrics.monthly_revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Assignment Form */}
          {!territory.assigned_rep_id ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Sales Rep
                </label>
                <Select value={selectedRep} onValueChange={setSelectedRep}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a sales rep..." />
                  </SelectTrigger>
                  <SelectContent>
                    {salesReps.map(rep => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.first_name} {rep.last_name}
                        {rep.total_accounts > 0 && (
                          <span className="text-gray-500 ml-2">
                            ({rep.total_accounts} accounts)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Protection Level
                </label>
                <Select value={protectionLevel} onValueChange={(value: any) => setProtectionLevel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Protection</SelectItem>
                    <SelectItem value="partial">Partial Protection</SelectItem>
                    <SelectItem value="none">No Protection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Protection Type
                </label>
                <Select value={protectionType} onValueChange={setProtectionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first-to-sign">First to Sign (Lifetime)</SelectItem>
                    <SelectItem value="performance">Performance Based</SelectItem>
                    <SelectItem value="time-based">Time Limited</SelectItem>
                    <SelectItem value="none">No Protection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAssignment}
                disabled={!selectedRep || loading}
                className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal text-white"
              >
                {loading ? 'Assigning...' : 'Assign Territory'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Territory Protected</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This territory is currently assigned and protected. You can transfer it to another rep with proper authorization.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowTransferDialog(true)}
                variant="outline"
                className="w-full"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Transfer Territory
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Territory</DialogTitle>
            <DialogDescription>
              Transfer {territory?.name} from {territory?.assigned_rep_name} to another sales rep.
              This action requires admin approval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Sales Rep
              </label>
              <Select value={newRepId} onValueChange={setNewRepId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new rep..." />
                </SelectTrigger>
                <SelectContent>
                  {salesReps
                    .filter(rep => rep.id !== territory?.assigned_rep_id)
                    .map(rep => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.first_name} {rep.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Reason
              </label>
              <Textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="Provide a reason for this transfer..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!newRepId || !transferReason || loading}
              className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white"
            >
              {loading ? 'Transferring...' : 'Confirm Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
