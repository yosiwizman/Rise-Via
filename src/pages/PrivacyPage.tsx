import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { LEGAL_TEXT } from '../utils/constants';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-risevia-black text-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-risevia-purple to-risevia-green rounded-full">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Privacy Policy</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your privacy and data protection are our top priorities. Learn how we collect, use, and protect your information.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800"
        >
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gray-800/50 rounded-xl">
              <Lock className="w-8 h-8 text-risevia-purple mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Data Security</h3>
              <p className="text-sm text-gray-400">Your information is encrypted and securely stored</p>
            </div>
            <div className="text-center p-6 bg-gray-800/50 rounded-xl">
              <Eye className="w-8 h-8 text-risevia-green mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Transparency</h3>
              <p className="text-sm text-gray-400">Clear information about data collection and use</p>
            </div>
            <div className="text-center p-6 bg-gray-800/50 rounded-xl">
              <FileText className="w-8 h-8 text-risevia-purple mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Your Rights</h3>
              <p className="text-sm text-gray-400">Control over your personal information</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-line text-gray-300 leading-relaxed">
              {LEGAL_TEXT.PRIVACY_POLICY}
            </div>
          </div>

          <div className="mt-8 p-6 bg-risevia-purple/10 border border-risevia-purple/20 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 text-risevia-purple">Contact Us About Privacy</h3>
            <p className="text-gray-300 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Email: privacy@risevia.com</p>
              <p>Phone: 1-800-RISEVIA</p>
              <p>Address: 123 Cannabis St, Denver, CO 80202</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
