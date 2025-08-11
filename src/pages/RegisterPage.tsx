import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useCustomer } from '../contexts/CustomerContext';
import { createSecureInputHandler, FIELD_LIMITS, validateSecureInput, generateCSRFToken } from '../utils/formSecurity';
import { SecurityUtils } from '../utils/security';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useCustomer();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    ageVerified: false,
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    setCsrfToken(generateCSRFToken());
  }, []);

  const secureInputHandler = createSecureInputHandler(setFormData, {
    firstName: FIELD_LIMITS.firstName,
    lastName: FIELD_LIMITS.lastName,
    email: FIELD_LIMITS.email,
    password: FIELD_LIMITS.password,
    confirmPassword: FIELD_LIMITS.password,
    phone: FIELD_LIMITS.phone
  });

  const handleSecureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      secureInputHandler(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ageVerified) {
      setError('You must be 21 or older to register');
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('You must accept the Terms of Service');
      return;
    }

    if (!validateSecureInput(formData.email, 'email')) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.phone && !validateSecureInput(formData.phone, 'phone')) {
      setError('Please enter a valid phone number');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');

    const sanitizedData = {
      ...formData,
      firstName: SecurityUtils.sanitizeInput(formData.firstName),
      lastName: SecurityUtils.sanitizeInput(formData.lastName),
      email: SecurityUtils.sanitizeInput(formData.email),
      phone: SecurityUtils.sanitizeInput(formData.phone),
      csrfToken: csrfToken
    };
    
    const result = await register(sanitizedData);
    
    if (result.success) {
      onNavigate('account');
    } else {
      setError(result.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-600">Create Account</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleSecureInputChange}
                maxLength={FIELD_LIMITS.firstName}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleSecureInputChange}
                maxLength={FIELD_LIMITS.lastName}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleSecureInputChange}
              maxLength={FIELD_LIMITS.email}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={formData.phone}
              onChange={handleSecureInputChange}
              maxLength={FIELD_LIMITS.phone}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleSecureInputChange}
              maxLength={FIELD_LIMITS.password}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              minLength={6}
              required
            />
            
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleSecureInputChange}
              maxLength={FIELD_LIMITS.password}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.ageVerified}
                  onChange={handleSecureInputChange}
                  className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                  required
                />
                <span className="text-sm">I confirm I am 21 years or older and legally allowed to purchase cannabis products in my state</span>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleSecureInputChange}
                  className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                  required
                />
                <span className="text-sm">I accept the <button type="button" className="text-purple-600 underline">Terms of Service</button> and <button type="button" className="text-purple-600 underline">Privacy Policy</button></span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => onNavigate('login')}
                className="text-purple-600 hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
          
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-3 text-gray-800">Member Benefits:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                100 welcome bonus loyalty points
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Exclusive member discounts and promotions
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Early access to new product releases
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Order history and quick reorder functionality
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                VIP tier progression with increasing benefits
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
