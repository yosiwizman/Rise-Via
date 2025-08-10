import React from 'react';
import { motion } from 'framer-motion';
import { Scale, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { LEGAL_TEXT } from '../utils/constants';

export const TermsPage: React.FC = () => {
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
            <div className="p-4 bg-gradient-to-r from-risevia-green to-risevia-purple rounded-full">
              <Scale className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Terms &amp; Conditions</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Please read these terms carefully before using our services. By using RiseViA, you agree to these terms.
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
              <CheckCircle className="w-8 h-8 text-risevia-green mx-auto mb-3" />
              <h3 className="font-semibold mb-2">User Rights</h3>
              <p className="text-sm text-gray-400">Your rights and responsibilities as a user</p>
            </div>
            <div className="text-center p-6 bg-gray-800/50 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Legal Compliance</h3>
              <p className="text-sm text-gray-400">Age verification and state law requirements</p>
            </div>
            <div className="text-center p-6 bg-gray-800/50 rounded-xl">
              <FileText className="w-8 h-8 text-risevia-purple mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Service Terms</h3>
              <p className="text-sm text-gray-400">How our platform operates and your obligations</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-line text-gray-300 leading-relaxed">
              {LEGAL_TEXT.TERMS_CONDITIONS}
            </div>
          </div>

          <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 text-yellow-500">Important Legal Notice</h3>
            <p className="text-gray-300 mb-4">
              By using RiseViA, you acknowledge that you have read, understood, and agree to be bound by these Terms &amp; Conditions.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• You must be 21+ years old to use this service</p>
              <p>• Cannabis products are for legal use only in compliant states</p>
              <p>• All sales are subject to state and local regulations</p>
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

export default TermsPage;
