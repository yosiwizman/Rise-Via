import React from 'react';
import { motion } from 'framer-motion';
import { Package, Users, TrendingUp, Shield, Award, CheckCircle, DollarSign, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SEOHead } from '../components/SEOHead';

export const WholesalePage = () => {
  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Competitive Pricing',
      description: 'Volume-based pricing tiers with attractive margins for wholesale partners'
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Premium Products',
      description: 'Access to our full catalog of lab-tested, premium THCA products'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Fast Fulfillment',
      description: 'Quick turnaround times with reliable shipping and tracking'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Compliance Support',
      description: 'Complete documentation and compliance assistance for all orders'
    }
  ];

  const requirements = [
    'Valid business license and cannabis retail authorization',
    'Minimum order quantities (MOQ) vary by product category',
    'Established retail location or verified online presence',
    'Compliance with all local and state cannabis regulations',
    'Credit application and approval process',
    'Agreement to RiseViA wholesale terms and conditions'
  ];

  const productCategories = [
    {
      name: 'THCA Flower',
      description: 'Premium indoor and outdoor THCA flower strains',
      minOrder: '1 lb',
      pricing: 'Starting at $800/lb'
    },
    {
      name: 'Pre-Rolls',
      description: 'Ready-to-sell pre-rolled THCA products',
      minOrder: '100 units',
      pricing: 'Starting at $3.50/unit'
    },
    {
      name: 'Concentrates',
      description: 'High-potency THCA concentrates and extracts',
      minOrder: '10 grams',
      pricing: 'Starting at $25/gram'
    },
    {
      name: 'Edibles',
      description: 'THCA-infused gummies and baked goods',
      minOrder: '50 units',
      pricing: 'Starting at $8/unit'
    }
  ];

  const tiers = [
    {
      name: 'Bronze Partner',
      minOrder: '$2,500',
      discount: '15%',
      benefits: ['Standard pricing', 'Basic support', 'Monthly ordering']
    },
    {
      name: 'Silver Partner',
      minOrder: '$5,000',
      discount: '20%',
      benefits: ['Enhanced pricing', 'Priority support', 'Bi-weekly ordering', 'Marketing materials']
    },
    {
      name: 'Gold Partner',
      minOrder: '$10,000',
      discount: '25%',
      benefits: ['Premium pricing', 'Dedicated account manager', 'Weekly ordering', 'Co-marketing opportunities', 'Exclusive products']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 dark:from-risevia-black dark:via-risevia-charcoal dark:to-risevia-black">
      <SEOHead
        title="RiseViA Wholesale - Cannabis B2B Distribution"
        description="Partner with RiseViA for wholesale cannabis distribution. Premium THCA products, competitive pricing, compliance support, and fast fulfillment for licensed retailers."
        canonical="https://risevia.com/wholesale"
      />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-risevia-purple text-white text-lg px-6 py-2">
              B2B Distribution
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
              Wholesale Partners
            </h1>
            <p className="text-xl md:text-2xl text-risevia-charcoal dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Join our network of licensed retailers and distributors. Access premium THCA products 
              with competitive wholesale pricing and comprehensive support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Why Choose RiseViA Wholesale?
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              We provide everything you need to succeed in the cannabis retail market, 
              from premium products to ongoing support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-purple/40 transition-all duration-300 h-full text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-risevia-black dark:text-gray-100 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-risevia-charcoal dark:text-gray-300">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-risevia-black/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Partnership Tiers
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              Choose the partnership level that fits your business needs. 
              Higher tiers unlock better pricing and exclusive benefits.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`card-light border-gray-200 hover:border-risevia-purple/40 transition-all duration-300 h-full ${
                  index === 2 ? 'ring-2 ring-risevia-purple' : ''
                }`}>
                  <CardHeader className="text-center">
                    {index === 2 && (
                      <Badge className="mb-4 bg-risevia-purple text-white mx-auto">
                        Most Popular
                      </Badge>
                    )}
                    <CardTitle className="text-2xl text-risevia-black dark:text-gray-100">
                      {tier.name}
                    </CardTitle>
                    <div className="text-3xl font-bold text-risevia-purple">
                      {tier.discount} Off
                    </div>
                    <div className="text-sm text-risevia-charcoal dark:text-gray-300">
                      Minimum Order: {tier.minOrder}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-risevia-teal mr-2 flex-shrink-0" />
                          <span className="text-risevia-charcoal dark:text-gray-300">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-6 ${
                        index === 2 
                          ? 'neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white'
                          : 'border-risevia-purple text-risevia-purple hover:bg-risevia-purple hover:text-white'
                      }`}
                      variant={index === 2 ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Product Categories
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              Explore our comprehensive catalog of premium THCA products 
              available for wholesale distribution.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {productCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-teal/40 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl text-risevia-black dark:text-gray-100">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-risevia-charcoal dark:text-gray-300 mb-4">
                      {category.description}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium text-risevia-black dark:text-gray-100">
                          Min Order: 
                        </span>
                        <span className="text-risevia-charcoal dark:text-gray-300 ml-1">
                          {category.minOrder}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-risevia-purple">
                          {category.pricing}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-risevia-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                Partnership Requirements
              </h2>
              <p className="text-lg text-risevia-charcoal dark:text-gray-300 mb-8">
                To ensure compliance and maintain our quality standards, 
                we have specific requirements for wholesale partners.
              </p>
              <ul className="space-y-4">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-risevia-teal mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-risevia-charcoal dark:text-gray-300">
                      {requirement}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="card-light border-gray-200 p-8">
                <div className="text-center">
                  <Award className="w-16 h-16 text-risevia-teal mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-risevia-black dark:text-gray-100 mb-4">
                    Ready to Apply?
                  </h3>
                  <p className="text-risevia-charcoal dark:text-gray-300 mb-6">
                    Start your wholesale partnership application today. 
                    Our team will review your submission and contact you within 48 hours.
                  </p>
                  <Button
                    size="lg"
                    className="neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold px-8 py-4"
                  >
                    Apply for Wholesale
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-risevia-purple to-risevia-teal">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Questions About Wholesale?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Our wholesale team is here to help you succeed. 
              Contact us to discuss your specific needs and requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-risevia-purple hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Contact Wholesale Team
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-risevia-purple font-semibold px-8 py-4"
              >
                Download Catalog
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
