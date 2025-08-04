import { motion } from 'framer-motion';
import { Shield, FileText, AlertTriangle, Lock, Scale, Cookie } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { SEOHead } from '../components/SEOHead';
import { LEGAL_TEXT, COMPLIANCE_WARNINGS } from '../utils/constants';

export const LegalPage = () => {
  const legalSections = [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "THC Disclaimer",
      content: COMPLIANCE_WARNINGS.THC_DISCLAIMER,
      type: "warning"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "FDA Disclaimer", 
      content: COMPLIANCE_WARNINGS.FDA_DISCLAIMER,
      type: "warning"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Privacy Policy",
      content: LEGAL_TEXT.PRIVACY_POLICY,
      type: "info"
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Terms & Conditions",
      content: LEGAL_TEXT.TERMS_CONDITIONS,
      type: "info"
    }
  ];

  return (
    <div className="min-h-screen bg-risevia-black py-8">
      <SEOHead
        title="Legal Information & Compliance"
        description="Review RiseViA's legal disclaimers, privacy policy, terms of service, and compliance information for cannabis products."
        canonical="https://risevia.com/legal"
      />
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Legal & Compliance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            RiseViA is committed to full legal compliance and transparency. Please review all legal information and disclaimers before using our products.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <Card className="bg-risevia-charcoal border-risevia-purple/20 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Quick Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {legalSections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left p-3 rounded-lg bg-risevia-black/50 hover:bg-risevia-purple/20 transition-colors text-gray-300 hover:text-white"
                  >
                    <div className="flex items-center">
                      {section.icon}
                      <span className="ml-2">{section.title}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <div className="lg:col-span-2 space-y-12">
            {legalSections.map((section, index) => (
              <motion.div
                key={index}
                id={`section-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-2 ${
                  section.type === 'warning' 
                    ? 'bg-red-950/20 border-red-500/50' 
                    : 'bg-risevia-charcoal border-risevia-purple/20'
                }`}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        section.type === 'warning'
                          ? 'bg-red-500 text-white'
                          : 'bg-gradient-to-r from-risevia-purple to-risevia-teal text-white'
                      }`}>
                        {section.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white">{section.title}</CardTitle>
                        {section.type === 'warning' && (
                          <Badge className="mt-1 bg-red-500 text-white">Required Reading</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed font-sans">
                        {section.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <Separator className="my-16 bg-risevia-purple/20" />

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold gradient-text mb-8 text-center">
            Product Warnings & Safety Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(COMPLIANCE_WARNINGS).map(([key, warning], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Alert className="compliance-warning border-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-white font-medium">
                    ⚠️ {warning}
                  </AlertDescription>
                </Alert>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="bg-risevia-charcoal border-risevia-purple/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                  <Cookie className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl text-white">Cookie Consent & Data Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                This website uses cookies to enhance your browsing experience, analyze site traffic, and ensure compliance with age verification requirements.
              </p>
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Types of Cookies We Use:</h4>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• <strong>Essential Cookies:</strong> Required for age verification and site functionality</li>
                  <li>• <strong>Preference Cookies:</strong> Remember your state selection and preferences</li>
                  <li>• <strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                </ul>
              </div>
              <Alert className="bg-risevia-black/50 border-risevia-teal/50">
                <AlertDescription className="text-gray-300">
                  By continuing to use this website, you consent to our use of cookies as described in our Privacy Policy.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-risevia-purple/10 to-risevia-teal/10 border-risevia-purple/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold gradient-text mb-4">
                SSL Security & HTTPS Enabled
              </h3>
              <p className="text-gray-300 mb-4">
                Your data is protected with industry-standard SSL encryption. All communications between your browser and our servers are secure.
              </p>
              <div className="flex justify-center items-center space-x-2">
                <Lock className="w-5 h-5 text-risevia-teal" />
                <span className="text-risevia-teal font-semibold">Secure Connection Verified</span>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};
