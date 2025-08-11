import { motion } from 'framer-motion';
import { FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-risevia-light py-8">
      <SEOHead
        title="Terms of Service - RiseViA"
        description="Read our terms of service and understand your rights and responsibilities"
        canonical="https://risevia.com/terms"
      />
      
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-4">Terms of Service</h1>
            <p className="text-risevia-charcoal">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-risevia-teal mr-3" />
                <h2 className="text-2xl font-semibold text-risevia-black">Acceptance of Terms</h2>
              </div>
              <div className="prose prose-lg max-w-none text-risevia-charcoal">
                <p>
                  By accessing and using RiseViA's website and services, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-risevia-teal mr-3" />
                <h2 className="text-2xl font-semibold text-risevia-black">Age Verification</h2>
              </div>
              <div className="prose prose-lg max-w-none text-risevia-charcoal">
                <p>You must be at least 21 years of age to use our services. By using our website, you represent and warrant that:</p>
                <ul>
                  <li>You are at least 21 years old</li>
                  <li>You have the legal right to purchase hemp products in your jurisdiction</li>
                  <li>You will use our products in compliance with all applicable laws</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-risevia-teal mr-3" />
                <h2 className="text-2xl font-semibold text-risevia-black">Product Information</h2>
              </div>
              <div className="prose prose-lg max-w-none text-risevia-charcoal">
                <p>All products sold by RiseViA:</p>
                <ul>
                  <li>Contain less than 0.3% Delta-9 THC by dry weight</li>
                  <li>Are derived from hemp as defined by the 2018 Farm Bill</li>
                  <li>Have not been evaluated by the FDA</li>
                  <li>Are not intended to diagnose, treat, cure, or prevent any disease</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-risevia-black mb-4">Shipping and Returns</h2>
              <div className="prose prose-lg max-w-none text-risevia-charcoal">
                <p>We ship to states where hemp products are legal. Returns are accepted within 30 days of purchase for unopened products.</p>
              </div>
            </section>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Important Legal Notice</h3>
              <p className="text-red-700 text-sm">
                These statements have not been evaluated by the Food and Drug Administration. 
                These products are not intended to diagnose, treat, cure, or prevent any disease.
              </p>
            </div>

            <div className="bg-risevia-light rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-risevia-black mb-2">Contact Us</h3>
              <p className="text-risevia-charcoal">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-risevia-charcoal mt-2">
                Email: legal@risevia.com<br />
                Phone: 1-800-RISEVIA
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
