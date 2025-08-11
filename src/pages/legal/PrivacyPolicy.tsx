import { motion } from 'framer-motion';
import { Shield, Eye, Lock, UserCheck } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-risevia-light py-8">
      <SEOHead
        title="Privacy Policy - RiseViA"
        description="Learn how RiseViA protects your privacy and handles your personal information"
        canonical="https://risevia.com/privacy"
      />
      
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-4">Privacy Policy</h1>
            <p className="text-risevia-charcoal">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center mb-4">
                <Eye className="w-6 h-6 text-risevia-teal mr-3" />
                <h2 className="text-2xl font-semibold text-risevia-black">Information We Collect</h2>
              </div>
              <div className="prose prose-lg max-w-none text-risevia-charcoal">
                <p>We collect information you provide directly to us, such as when you:</p>
                <ul>
                  <li>Create an account or make a purchase</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Contact us for customer support</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <p>This may include your name, email address, phone number, shipping address, and payment information.</p>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 text-risevia-teal mr-3" />
                <h2 className="text-2xl font-semibold text-risevia-black">How We Use Your Information</h2>
              </div>
              <div className="prose prose-lg max-w-none text-risevia-charcoal">
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Process and fulfill your orders</li>
                  <li>Communicate with you about your account and orders</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Improve our products and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <UserCheck className="w-6 h-6 text-risevia-teal mr-3" />
                <h2 className="text-2xl font-semibold text-risevia-black">Your Rights</h2>
              </div>
              <div className="prose prose-lg max-w-none text-risevia-charcoal">
                <p>You have the right to:</p>
                <ul>
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a copy of your data</li>
                </ul>
                <p>To exercise these rights, please contact us at privacy@risevia.com</p>
              </div>
            </section>

            <div className="bg-risevia-light rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-risevia-black mb-2">Contact Us</h3>
              <p className="text-risevia-charcoal">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-risevia-charcoal mt-2">
                Email: privacy@risevia.com<br />
                Phone: 1-800-RISEVIA
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
