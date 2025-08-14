import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const result = await authService.requestPasswordReset(
        email,
        window.location.hostname,
        navigator.userAgent
      );
      
      // Always show success to prevent email enumeration
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-risevia-black via-gray-900 to-risevia-black p-4">
      <Card className="w-full max-w-md bg-gray-900/95 border-gray-800 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">RV</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        
        {!success ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="bg-red-500/10 border-red-500/50 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-risevia-purple"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-purple/90 hover:to-risevia-teal/90 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-gray-400 hover:text-risevia-teal transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <Alert className="bg-green-500/10 border-green-500/50 text-green-400">
              <AlertDescription>
                If an account exists with the email address you provided, you will receive a password reset link shortly.
                Please check your email inbox and spam folder.
              </AlertDescription>
            </Alert>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-400">
                Didn't receive the email? Check your spam folder or try again with a different email address.
              </p>
              
              <Button
                onClick={() => setSuccess(false)}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Try Again
              </Button>
              
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-gray-400 hover:text-risevia-teal transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
