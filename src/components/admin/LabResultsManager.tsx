import React, { useState, useEffect } from 'react';
import { FileText, QrCode, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (LabResultsManager):', query, values);
    
    if (query.includes('lab_results')) {
      return Promise.resolve([{
        id: 'mock-lab-result-1',
        product_id: 'PROD-001',
        batch_id: 'BATCH-2024-001',
        test_date: '2024-01-15',
        expiration_date: '2025-01-15',
        thca_percentage: 22.5,
        delta9_thc_percentage: 0.8,
        cbd_percentage: 1.2,
        pesticides_passed: true,
        heavy_metals_passed: true,
        microbials_passed: true,
        terpene_profile: { myrcene: 0.5, limonene: 0.3 },
        coa_url: 'https://storage.risevia.com/coa/mock-coa.pdf',
        qr_code: '{"batch_id":"BATCH-2024-001","certificate_number":"COA-001"}',
        lab_name: 'Cannabis Testing Lab',
        certificate_number: 'COA-001'
      }]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

interface LabResult {
  id?: string;
  product_id: string;
  batch_id: string;
  test_date: string;
  expiration_date: string;
  thca_percentage: number;
  delta9_thc_percentage: number;
  cbd_percentage: number;
  pesticides_passed: boolean;
  heavy_metals_passed: boolean;
  microbials_passed: boolean;
  terpene_profile: Record<string, number>;
  coa_url?: string;
  qr_code?: string;
  lab_name: string;
  certificate_number: string;
}

export const LabResultsManager: React.FC = () => {
  const [labResults, setLabResults] = useState<Array<{ id?: string; product_id: string; batch_id: string; test_date: string; expiration_date: string; thca_percentage: number; delta9_thc_percentage: number; cbd_percentage: number; pesticides_passed: boolean; heavy_metals_passed: boolean; microbials_passed: boolean; terpene_profile: Record<string, number>; coa_url?: string; qr_code?: string; lab_name: string; certificate_number: string }>>([]);
  const [formData, setFormData] = useState<Partial<LabResult>>({
    test_date: new Date().toISOString().split('T')[0],
    expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [showQRModal, setShowQRModal] = useState<string | null>(null);

  useEffect(() => {
    fetchLabResults();
  }, []);

  const fetchLabResults = async () => {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty lab results');
        setLabResults([]);
        return;
      }

      const data = await sql`
        SELECT * FROM lab_results 
        ORDER BY created_at DESC
      `;
      setLabResults((data as Array<{ id?: string; product_id: string; batch_id: string; test_date: string; expiration_date: string; thca_percentage: number; delta9_thc_percentage: number; cbd_percentage: number; pesticides_passed: boolean; heavy_metals_passed: boolean; microbials_passed: boolean; terpene_profile: Record<string, number>; coa_url?: string; qr_code?: string; lab_name: string; certificate_number: string }>) || []);
    } catch (error) {
      console.error('Failed to fetch lab results:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const mockUrl = `https://storage.risevia.com/coa/${file.name}`;
    setFormData(prev => ({ ...prev, coa_url: mockUrl }));
  };

  const generateQRCode = (labResult: LabResult): string => {
    const qrData = {
      batch_id: labResult.batch_id,
      certificate_number: labResult.certificate_number,
      coa_url: labResult.coa_url,
      lab_name: labResult.lab_name,
      test_date: labResult.test_date
    };
    return JSON.stringify(qrData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.batch_id) {
      alert('Please fill in required fields');
      return;
    }

    const qrCode = generateQRCode(formData as LabResult);
    
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, cannot add lab result');
        alert('Database not available');
        return;
      }

      await sql`
        INSERT INTO lab_results (
          product_id, batch_id, test_date, expiration_date, thca_percentage, 
          delta9_thc_percentage, cbd_percentage, pesticides_passed, heavy_metals_passed, 
          microbials_passed, terpene_profile, coa_url, qr_code, lab_name, certificate_number
        ) VALUES (
          ${formData.product_id}, ${formData.batch_id}, ${formData.test_date}, 
          ${formData.expiration_date}, ${formData.thca_percentage}, ${formData.delta9_thc_percentage}, 
          ${formData.cbd_percentage}, ${formData.pesticides_passed || false}, 
          ${formData.heavy_metals_passed || false}, ${formData.microbials_passed || false}, 
          ${JSON.stringify(formData.terpene_profile || {})}, ${formData.coa_url}, 
          ${qrCode}, ${formData.lab_name}, ${formData.certificate_number}
        )
      `;
      alert('Lab result saved successfully');
      setFormData({
        test_date: new Date().toISOString().split('T')[0],
        expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      fetchLabResults();
    } catch (error) {
      console.error('Failed to save lab result:', error);
      alert('Failed to save lab result');
    }
  };

  const isExpiringSoon = (expirationDate: string): boolean => {
    const expiry = new Date(expirationDate);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lab Results Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_id">Product ID</Label>
                <Input
                  id="product_id"
                  value={formData.product_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="batch_id">Batch ID</Label>
                <Input
                  id="batch_id"
                  value={formData.batch_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, batch_id: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lab_name">Lab Name</Label>
                <Input
                  id="lab_name"
                  value={formData.lab_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, lab_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="certificate_number">Certificate Number</Label>
                <Input
                  id="certificate_number"
                  value={formData.certificate_number || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, certificate_number: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="thca_percentage">THCa %</Label>
                <Input
                  id="thca_percentage"
                  type="number"
                  step="0.01"
                  value={formData.thca_percentage || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, thca_percentage: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="delta9_thc_percentage">Delta-9 THC %</Label>
                <Input
                  id="delta9_thc_percentage"
                  type="number"
                  step="0.01"
                  value={formData.delta9_thc_percentage || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, delta9_thc_percentage: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="cbd_percentage">CBD %</Label>
                <Input
                  id="cbd_percentage"
                  type="number"
                  step="0.01"
                  value={formData.cbd_percentage || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, cbd_percentage: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="coa_file">Upload COA PDF</Label>
              <Input
                id="coa_file"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>

            <Button type="submit" className="bg-gradient-to-r from-risevia-purple to-risevia-teal">
              Save Lab Result
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Lab Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Batch ID</th>
                  <th className="text-left p-3">Lab</th>
                  <th className="text-left p-3">THCa %</th>
                  <th className="text-left p-3">Test Date</th>
                  <th className="text-left p-3">Expiry</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {labResults.map((result) => (
                  <tr key={result.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{result.batch_id}</td>
                    <td className="p-3">{result.lab_name}</td>
                    <td className="p-3">{result.thca_percentage}%</td>
                    <td className="p-3">{new Date(result.test_date).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {new Date(result.expiration_date).toLocaleDateString()}
                        {isExpiringSoon(result.expiration_date) && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowQRModal(result.qr_code || '')}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">COA QR Code</h3>
            <div className="flex justify-center mb-4">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                QR Code: {showQRModal.substring(0, 20)}...
              </div>
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => setShowQRModal(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
