import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Calendar, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { SEOHead } from '../components/SEOHead';
import { createSecureInputHandler, FIELD_LIMITS, validateSecureInput, generateCSRFToken } from '../utils/formSecurity';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setCsrfToken(generateCSRFToken());
  }, []);

  const secureInputHandler = createSecureInputHandler(setFormData, {
    name: FIELD_LIMITS.name,
    email: FIELD_LIMITS.email,
    message: FIELD_LIMITS.message
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error');
      return;
    }

    if (!validateSecureInput(formData.email, 'email')) {
      setSubmitStatus('error');
      return;
    }

    if (formData.name.length > FIELD_LIMITS.name) {
      setSubmitStatus('error');
      return;
    }

    if (formData.message.length > FIELD_LIMITS.message) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setCsrfToken(generateCSRFToken());
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      content: "support@risevia.com",
      description: "Get help with orders, products, and general inquiries"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      content: "1-800-RISEVIA",
      description: "Monday - Friday, 9AM - 6PM EST"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Licensed Facility",
      content: "Cannabis Licensed Location",
      description: "Fully compliant cultivation and processing facility"
    }
  ];

  return (
    <div className="min-h-screen bg-risevia-light py-8">
      <SEOHead
        title="Contact Us"
        description="Get in touch with RiseViA for product questions, support, or general inquiries. We're here to help with your cannabis wellness journey."
        canonical="https://risevia.com/contact"
      />
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Contact RiseViA
          </h1>
          <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Have questions about our products, need support, or want to learn more about THCA? 
            We're here to help you on your wellness journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-light border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl text-risevia-black dark:text-gray-100 flex items-center">
                  <Send className="w-6 h-6 mr-2" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input type="hidden" name="csrfToken" value={csrfToken} />
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-risevia-black dark:text-gray-100">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={secureInputHandler}
                      maxLength={FIELD_LIMITS.name}
                      required
                      className="bg-white border-gray-200 text-risevia-black dark:text-gray-100 placeholder-risevia-charcoal"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-risevia-black dark:text-gray-100">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={secureInputHandler}
                      maxLength={FIELD_LIMITS.email}
                      required
                      className="bg-white border-gray-200 text-risevia-black dark:text-gray-100 placeholder-risevia-charcoal"
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-risevia-black dark:text-gray-100">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={secureInputHandler}
                      maxLength={FIELD_LIMITS.message}
                      required
                      rows={6}
                      className="bg-white border-gray-200 text-risevia-black placeholder-risevia-charcoal resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <Alert className="bg-green-950/20 border-green-500/50">
                      <AlertDescription className="text-green-400">
                        ✅ Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold py-3"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {contactInfo.map((info, index) => (
              <Card key={index} className="card-light border-gray-200 hover:border-risevia-purple/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-risevia-black dark:text-gray-100 mb-1">{info.title}</h3>
                      <p className="text-risevia-teal font-medium mb-2">{info.content}</p>
                      <p className="text-risevia-charcoal dark:text-gray-300 text-sm">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="card-light border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-risevia-black dark:text-gray-100 mb-1">WhatsApp Support</h3>
                    <p className="text-risevia-teal font-medium mb-2">Coming Soon</p>
                    <p className="text-risevia-charcoal dark:text-gray-300 text-sm">Direct messaging support for quick questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-light border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-risevia-black dark:text-gray-100 mb-1">Schedule Consultation</h3>
                    <p className="text-risevia-teal font-medium mb-2">Calendly Integration Ready</p>
                    <p className="text-risevia-charcoal dark:text-gray-300 text-sm">Book a personalized consultation with our cannabis experts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="card-light border-gray-200 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-risevia-black dark:text-gray-100 text-center flex items-center justify-center">
                <MapPin className="w-6 h-6 mr-2" />
                Our Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-risevia-teal" />
                  <h3 className="text-2xl font-bold text-risevia-black dark:text-gray-100 mb-2">Google Maps Integration</h3>
                  <p className="text-risevia-charcoal dark:text-gray-300 mb-4">Interactive map showing our licensed facility location</p>
                  <div className="bg-white/80 rounded-lg p-4 max-w-md mx-auto border border-gray-200">
                    <p className="text-risevia-charcoal dark:text-gray-300 text-sm">
                      Licensed Cannabis Cultivation & Processing Facility<br />
                      Fully compliant with state and federal regulations<br />
                      Visitor access by appointment only
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-risevia-purple/10 to-risevia-teal/10 border-gray-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold gradient-text mb-4">
                Business Hours
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div>
                  <h4 className="text-risevia-black dark:text-gray-100 font-semibold mb-2">Customer Support</h4>
                  <p className="text-risevia-charcoal dark:text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                  <p className="text-risevia-charcoal dark:text-gray-300">Saturday: 10:00 AM - 4:00 PM EST</p>
                  <p className="text-risevia-charcoal dark:text-gray-300">Sunday: Closed</p>
                </div>
                <div>
                  <h4 className="text-risevia-black dark:text-gray-100 font-semibold mb-2">Order Processing</h4>
                  <p className="text-risevia-charcoal dark:text-gray-300">Monday - Friday: 8:00 AM - 5:00 PM EST</p>
                  <p className="text-risevia-charcoal dark:text-gray-300">Same-day processing for orders placed before 2:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};
