import React from 'react';
import { motion } from 'framer-motion';
import { Package, Palette, Award, Users, Zap, Shield, CheckCircle, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SEOHead } from '../components/SEOHead';

export const PrivateLabelPage = () => {
  const services = [
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Product Development',
      description: 'Custom formulations and product development tailored to your brand specifications'
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: 'Custom Branding',
      description: 'Complete branding and packaging design services to make your products stand out'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Quality Assurance',
      description: 'Rigorous testing and quality control to ensure consistent, premium products'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Fast Turnaround',
      description: 'Efficient production timelines to get your products to market quickly'
    }
  ];

  const packages = [
    {
      name: 'Starter Package',
      price: 'Starting at $10K',
      description: 'Perfect for new brands entering the market',
      features: [
        '500-1000 unit minimum order',
        'Basic packaging design',
        'Standard product formulations',
        'Lab testing included',
        '30-day production timeline'
      ],
      popular: false
    },
    {
      name: 'Professional Package',
      price: 'Starting at $25K',
      description: 'Comprehensive solution for established brands',
      features: [
        '1000-5000 unit minimum order',
        'Custom packaging design',
        'Custom formulations available',
        'Premium lab testing',
        'Marketing material support',
        '21-day production timeline'
      ],
      popular: true
    },
    {
      name: 'Enterprise Package',
      price: 'Custom Pricing',
      description: 'Full-service solution for large-scale operations',
      features: [
        '5000+ unit minimum order',
        'Complete brand development',
        'Exclusive formulations',
        'Comprehensive testing suite',
        'Marketing and sales support',
        'Dedicated account management',
        '14-day production timeline'
      ],
      popular: false
    }
  ];

  const productTypes = [
    {
      name: 'THCA Flower',
      description: 'Premium indoor and outdoor flower with custom packaging',
      minOrder: '1 lb',
      customization: ['Strain selection', 'Packaging design', 'Labeling', 'COA branding']
    },
    {
      name: 'Pre-Rolls',
      description: 'Ready-to-sell pre-rolled products with custom branding',
      minOrder: '500 units',
      customization: ['Strain blends', 'Tube design', 'Label customization', 'Display boxes']
    },
    {
      name: 'Concentrates',
      description: 'High-quality extracts and concentrates',
      minOrder: '100 grams',
      customization: ['Extract types', 'Container design', 'Potency levels', 'Terpene profiles']
    },
    {
      name: 'Edibles',
      description: 'Custom gummies and baked goods',
      minOrder: '1000 units',
      customization: ['Flavors', 'Dosages', 'Shapes', 'Packaging design']
    }
  ];

  const process = [
    {
      step: '1',
      title: 'Consultation',
      description: 'Discuss your brand vision, target market, and product requirements'
    },
    {
      step: '2',
      title: 'Product Development',
      description: 'Create custom formulations and develop your unique product line'
    },
    {
      step: '3',
      title: 'Design & Branding',
      description: 'Design packaging, labels, and marketing materials for your brand'
    },
    {
      step: '4',
      title: 'Production',
      description: 'Manufacture your products with rigorous quality control standards'
    },
    {
      step: '5',
      title: 'Testing & Compliance',
      description: 'Complete lab testing and ensure all regulatory compliance requirements'
    },
    {
      step: '6',
      title: 'Delivery',
      description: 'Package and deliver your finished products ready for market'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 dark:from-risevia-black dark:via-risevia-charcoal dark:to-risevia-black">
      <SEOHead
        title="RiseViA Private Label - Custom Cannabis Product Manufacturing"
        description="Launch your cannabis brand with RiseViA's private label services. Custom formulations, branding, packaging, and manufacturing for THCA products."
        canonical="https://risevia.com/private-label"
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
              Private Label Solutions
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
              Launch Your Brand
            </h1>
            <p className="text-xl md:text-2xl text-risevia-charcoal dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Transform your vision into reality with our comprehensive private label services. 
              From custom formulations to complete branding solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
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
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-risevia-black dark:text-gray-100 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-risevia-charcoal dark:text-gray-300">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
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
              Private Label Packages
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              Choose the package that fits your brand's needs and budget. 
              All packages include full compliance and quality assurance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`card-light border-gray-200 hover:border-risevia-purple/40 transition-all duration-300 h-full ${
                  pkg.popular ? 'ring-2 ring-risevia-purple' : ''
                }`}>
                  <CardHeader className="text-center">
                    {pkg.popular && (
                      <Badge className="mb-4 bg-risevia-purple text-white mx-auto">
                        Most Popular
                      </Badge>
                    )}
                    <CardTitle className="text-2xl text-risevia-black dark:text-gray-100">
                      {pkg.name}
                    </CardTitle>
                    <div className="text-3xl font-bold text-risevia-purple">
                      {pkg.price}
                    </div>
                    <p className="text-sm text-risevia-charcoal dark:text-gray-300">
                      {pkg.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-risevia-teal mr-2 flex-shrink-0" />
                          <span className="text-risevia-charcoal dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-6 ${
                        pkg.popular 
                          ? 'neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white'
                          : 'border-risevia-purple text-risevia-purple hover:bg-risevia-purple hover:text-white'
                      }`}
                      variant={pkg.popular ? 'default' : 'outline'}
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

      {/* Product Types */}
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
              We offer private label manufacturing for a wide range of cannabis products, 
              each with extensive customization options.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {productTypes.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-teal/40 transition-all duration-300 h-full">
                  <CardHeader>
                    <CardTitle className="text-xl text-risevia-black dark:text-gray-100">
                      {product.name}
                    </CardTitle>
                    <p className="text-risevia-charcoal dark:text-gray-300">
                      {product.description}
                    </p>
                    <div className="text-sm text-risevia-teal font-medium">
                      Minimum Order: {product.minOrder}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold text-risevia-black dark:text-gray-100 mb-3">
                      Customization Options:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.customization.map((option, optionIndex) => (
                        <Badge
                          key={optionIndex}
                          variant="outline"
                          className="border-risevia-teal text-risevia-teal"
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
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
              Our Process
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              From initial consultation to final delivery, we guide you through 
              every step of bringing your cannabis brand to life.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-purple/40 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold text-risevia-black dark:text-gray-100 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-risevia-charcoal dark:text-gray-300">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-risevia-purple to-risevia-teal">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Launch Your Cannabis Brand?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Let's discuss your vision and create a custom solution that brings 
              your cannabis brand to market successfully.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-risevia-purple hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Schedule Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-risevia-purple font-semibold px-8 py-4"
              >
                Download Brochure
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
