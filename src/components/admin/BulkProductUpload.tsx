import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';

interface UploadResult {
  success: number;
  errors: string[];
  total: number;
}

export const BulkProductUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult | null>(null);

  const handleCSVUpload = async (file: File) => {
    setUploading(true);
    setResults(null);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const products = (() => {
        if (!lines || !Array.isArray(lines)) {
          console.warn('⚠️ BulkProductUpload: lines is not an array:', typeof lines, lines);
          return [];
        }
        try {
          return lines.slice(1);
        } catch (error) {
          console.error('❌ Error in BulkProductUpload lines.slice():', error, 'Lines:', lines);
          return [];
        }
      })().map((line, lineIndex) => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const product: Record<string, unknown> = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'name':
              product.name = value;
              break;
            case 'price':
              product.price = parseFloat(value) || 0;
              break;
            case 'category':
              product.category = value;
              break;
            case 'strain_type':
            case 'straintype':
              product.strain_type = value;
              break;
            case 'thca_percentage':
            case 'thca':
              product.thca_percentage = parseFloat(value) || 0;
              break;
            case 'images':
              product.images = value ? value.split(';').map(url => url.trim()).filter(Boolean) : [];
              break;
            case 'hover_image':
            case 'hoverimage':
              product.hover_image = value || undefined;
              break;
            case 'video_url':
            case 'videourl':
              product.video_url = value || undefined;
              break;
            case 'description':
              product.description = value;
              break;
            case 'effects':
              product.effects = value ? value.split(';').map(effect => effect.trim()).filter(Boolean) : [];
              break;
            case 'inventory':
              product.inventory = parseInt(value) || 0;
              break;
            case 'featured':
              product.featured = value.toLowerCase() === 'true';
              break;
            case 'coa_document':
            case 'coadocument':
              product.coa_document = value || undefined;
              break;
          }
        });
        
        if (product.name && typeof product.name === 'string') {
          product.slug = product.name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }
        
        return { product, lineNumber: lineIndex + 2 };
      }).filter(({ product }) => product.name);

      let successCount = 0;
      const errors: string[] = [];

      for (const { product, lineNumber } of products) {
        try {
          if (!product.name || !product.category || !product.strain_type) {
            throw new Error('Missing required fields: name, category, or strain_type');
          }
          
          await productService.create(product as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
          successCount++;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (errorMessage.includes('Database not configured')) {
            errors.push(`Database not available - please configure Neon environment variables`);
            break;
          }
          errors.push(`Line ${lineNumber} (${product.name || 'Unknown'}): ${errorMessage}`);
        }
      }

      setResults({ 
        success: successCount, 
        errors: (() => {
          if (!errors || !Array.isArray(errors)) {
            console.warn('⚠️ BulkProductUpload: errors is not an array:', typeof errors, errors);
            return [];
          }
          try {
            return errors.slice(0, 10);
          } catch (error) {
            console.error('❌ Error in BulkProductUpload errors.slice():', error, 'Errors:', errors);
            return [];
          }
        })(),
        total: products.length 
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResults({ 
        success: 0, 
        errors: [`File processing error: ${errorMessage}`],
        total: 0 
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      'name,price,category,strain_type,thca_percentage,images,hover_image,video_url,description,effects,inventory,featured,coa_document',
      'Blue Dream,45.00,flower,hybrid,27.8,https://example.com/image1.jpg;https://example.com/image2.jpg,https://example.com/hover.jpg,,A balanced hybrid strain,Creative;Energetic;Relaxed,150,true,https://example.com/coa.pdf',
      'OG Kush,52.00,flower,indica,24.5,https://example.com/og1.jpg,,https://example.com/og-video.mp4,Classic indica strain,Relaxed;Sleepy;Happy,75,false,'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Bulk Product Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Required fields: name, category, strain_type, price, thca_percentage</li>
            <li>• Images: Separate multiple URLs with semicolons (;)</li>
            <li>• Effects: Separate multiple effects with semicolons (;)</li>
            <li>• Featured: Use "true" or "false"</li>
            <li>• Use the template above for proper formatting</li>
          </ul>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 mb-2">Upload CSV file with product data</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files?.[0] && handleCSVUpload(e.target.files[0])}
            className="hidden"
            id="csv-upload"
          />
          <Button 
            onClick={() => document.getElementById('csv-upload')?.click()}
            disabled={uploading}
            className="bg-gradient-to-r from-risevia-purple to-risevia-teal"
          >
            {uploading ? 'Processing...' : 'Choose CSV File'}
          </Button>
        </div>

        {results && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Upload Results
            </h4>
            <div className="space-y-2">
              <p className="text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {results.success} of {results.total} products created successfully
              </p>
              {results.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-red-600 flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    {results.errors.length} errors occurred:
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded p-3 max-h-40 overflow-y-auto">
                    <ul className="text-sm text-red-700 space-y-1">
                      {results.errors.map((error, index) => (
                        <li key={index} className="break-words">• {error}</li>
                      ))}
                      {results.errors.length >= 10 && (
                        <li className="italic">... and more errors (showing first 10)</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
