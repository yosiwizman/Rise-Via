import React, { useState } from 'react';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useCustomer } from '../contexts/CustomerContext';
import { SecurityUtils } from '../utils/security';
import { RegistrationSuccess } from '../components/RegistrationSuccess';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const passwordValidation = SecurityUtils.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message || 'Invalid password');
      return;
    }
    
    if (!SecurityUtils.isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await register(formData);
    
    if (result.success) {
      setUserEmail(formData.email);
      setRegistrationSuccess(true);
    } else {
      setError(result.message || 'Registration failed');
      setLoading(false);
    }
  };

  const validateField = (field: string, value: string) => {
    let errorMessage = '';
    
    switch (field) {
      case 'email':
        if (value && !SecurityUtils.isValidEmail(value)) {
          errorMessage = 'Invalid email format';
        }
        break;
      case 'password':
        if (value) {
          const result = SecurityUtils.validatePassword(value);
          if (!result.isValid) {
            errorMessage = result.message || 'Invalid password';
          }
        }
        break;
      case 'confirmPassword':
        if (value && value !== formData.password) {
          errorMessage = 'Passwords do not match';
        }
        break;
      case 'phone':
        if (value && !SecurityUtils.isValidPhone(value)) {
          errorMessage = 'Invalid phone number format';
        }
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [field]: errorMessage
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  if (registrationSuccess) {
    return <RegistrationSuccess onNavigate={onNavigate} email={userEmail} />;
  }

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                {fieldErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>
                )}
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Last Name"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                {fieldErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <input
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  fieldErrors.email ? 'border-red-500' : ''
                }`}
                required
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>
            
            <div>
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  fieldErrors.phone ? 'border-red-500' : ''
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
              )}
            </div>
            
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 8 characters with complexity)"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    fieldErrors.password ? 'border-red-500' : ''
                  }`}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Must contain: 8+ characters, uppercase, lowercase, number, special character
              </div>
            </div>
            
            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    fieldErrors.confirmPassword ? 'border-red-500' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.ageVerified}
                  onChange={(e) => setFormData({...formData, ageVerified: e.target.checked})}
                  className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                  required
                />
                <span className="text-sm">I confirm I am 21 years or older and legally allowed to purchase cannabis products in my state</span>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
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
            <h3 className="font-semibold mb-3 text-gray-800 text-center md:text-left">Member Benefits:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">100 welcome bonus loyalty points</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Exclusive member discounts</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Early access to new products</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Order history &amp; quick reorder</span>
              </div>
              <div className="flex items-start sm:col-span-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">VIP tier progression with increasing benefits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
