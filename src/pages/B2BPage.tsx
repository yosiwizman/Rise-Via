import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SEOHead } from '../components/SEOHead';
import { Building, FileText, DollarSign } from 'lucide-react';
import { customerService } from '../services/customerService';
const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (B2BPage):', query, values);
    
    if (query.includes('customer_profiles')) {
      return Promise.resolve([{
        customer_id: 'mock-customer-id',
        is_b2b: true,
        business_name: values[0] || 'Mock Business',
        business_license: values[1] || 'MOCK-LICENSE-123',
        membership_tier: 'SILVER',
        segment: 'B2B'
      }]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

export const B2BPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
    businessName: '',
    businessLicense: '',
    taxExemptId: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customerData = await customerService.create({
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone
      });

      if (customerData) {
        await sql`
          UPDATE customer_profiles 
          SET 
            is_b2b = true,
            business_name = ${formData.businessName},
            business_license = ${formData.businessLicense},
            membership_tier = 'SILVER',
            segment = 'B2B'
          WHERE customer_id = ${customerData.id}
        `;
      }

      if (customerData) {
        setSubmitted(true);
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('B2B registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Building className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <CardTitle className="text-2xl text-green-600">Application Submitted!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Thank you for your B2B application. Our team will review your submission and contact you within 2-3 business days.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 p-4">
      <SEOHead
        title="B2B Wholesale Registration - RiseViA"
        description="Apply for wholesale pricing and B2B access to RiseViA products"
      />
      
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <Building className="w-16 h-16 mx-auto text-risevia-purple mb-4" />
          <h1 className="text-4xl font-bold mb-4">B2B Wholesale Program</h1>
          <p className="text-xl text-gray-600">
            Join our wholesale program for exclusive pricing and business benefits
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardHeader className="text-center">
              <DollarSign className="w-12 h-12 mx-auto text-risevia-purple mb-2" />
              <CardTitle>Wholesale Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 30% off retail prices</li>
                <li>• Volume discounts available</li>
                <li>• Minimum order quantities</li>
                <li>• Net 30 payment terms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 mx-auto text-risevia-purple mb-2" />
              <CardTitle>Business Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Dedicated account manager</li>
                <li>• Priority customer support</li>
                <li>• Custom product requests</li>
                <li>• Marketing support materials</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Building className="w-12 h-12 mx-auto text-risevia-purple mb-2" />
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Valid business license</li>
                <li>• Cannabis retail license</li>
                <li>• Tax exemption certificate</li>
                <li>• Minimum order commitment</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>B2B Registration Application</CardTitle>
            <p className="text-gray-600">Complete the form below to apply for wholesale access</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Account Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessLicense">Business License Number *</Label>
                  <Input
                    id="businessLicense"
                    type="text"
                    value={formData.businessLicense}
                    onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="taxExemptId">Tax Exempt ID</Label>
                  <Input
                    id="taxExemptId"
                    type="text"
                    value={formData.taxExemptId}
                    onChange={(e) => handleInputChange('taxExemptId', e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Application Process:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Submit this application form</li>
                  <li>Our team will verify your business credentials</li>
                  <li>You'll receive approval notification within 2-3 business days</li>
                  <li>Access wholesale pricing and place your first order</li>
                </ol>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal"
                disabled={loading}
              >
                {loading ? 'Submitting Application...' : 'Submit B2B Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
