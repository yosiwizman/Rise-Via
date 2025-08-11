import React from 'react';
import { CheckCircle, Mail } from 'lucide-react';

interface RegistrationSuccessProps {
  onNavigate: (page: string) => void;
  email?: string;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ onNavigate, email }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-purple-600 mb-2">Welcome to Rise Via!</h2>
            <p className="text-gray-600">Your account has been created successfully.</p>
          </div>

          {email && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <Mail className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-blue-700">
                We've sent a verification email to <strong>{email}</strong>. 
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <button
              onClick={() => onNavigate('account')}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
            >
              Go to My Account
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="w-full border border-purple-600 text-purple-600 py-3 rounded-lg hover:bg-purple-50 font-semibold transition-colors"
            >
              Start Shopping
            </button>
          </div>

          <div className="text-sm text-gray-500">
            <p>🎉 You've earned 100 welcome bonus loyalty points!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
