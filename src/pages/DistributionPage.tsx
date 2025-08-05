import React from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Clock, Shield, Package, Route, BarChart3, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SEOHead } from '../components/SEOHead';

export const DistributionPage = () => {
  const services = [
    {
      name: 'Nationwide Logistics',
      description: 'Comprehensive distribution network covering all legal cannabis markets',
      icon: <Truck className="w-8 h-8" />,
      features: ['Multi-state coverage', 'Temperature controlled', 'Real-time tracking', 'Compliance verified']
    },
    {
      name: 'Inventory Management',
      description: 'Advanced inventory tracking and optimization systems',
      icon: <Package className="w-8 h-8" />,
      features: ['Real-time inventory', 'Automated reordering', 'Demand forecasting', 'Quality control']
    },
    {
      name: 'Route Optimization',
      description: 'AI-powered route planning for maximum efficiency',
      icon: <Route className="w-8 h-8" />,
      features: ['Dynamic routing', 'Cost optimization', 'Delivery windows', 'Carbon footprint reduction']
    },
    {
      name: 'Compliance Tracking',
      description: 'End-to-end compliance monitoring and documentation',
      icon: <Shield className="w-8 h-8" />,
      features: ['Seed-to-sale tracking', 'Regulatory reporting', 'Audit trails', 'State compliance']
    }
  ];

  const stats = [
    { label: 'Distribution Centers', value: '8', icon: <MapPin className="w-6 h-6" /> },
    { label: 'States Served', value: '12+', icon: <Truck className="w-6 h-6" /> },
    { label: 'Average Delivery Time', value: '24h', icon: <Clock className="w-6 h-6" /> },
    { label: 'Partner Retailers', value: '200+', icon: <Users className="w-6 h-6" /> }
  ];

  const coverage = [
    { state: 'California', status: 'Active', centers: 3 },
    { state: 'Colorado', status: 'Active', centers: 2 },
    { state: 'Nevada', status: 'Active', centers: 1 },
    { state: 'Arizona', status: 'Active', centers: 1 },
    { state: 'Oregon', status: 'Active', centers: 1 },
    { state: 'Washington', status: 'Expanding', centers: 0 },
    { state: 'New York', status: 'Planning', centers: 0 },
    { state: 'Florida', status: 'Planning', centers: 0 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 dark:from-risevia-black dark:via-risevia-charcoal dark:to-risevia-black">
      <SEOHead
        title="RiseViA Distribution - Cannabis Supply Chain & Logistics"
        description="RiseViA Distribution provides comprehensive cannabis supply chain solutions including nationwide logistics, inventory management, route optimization, and compliance tracking."
        canonical="https://risevia.com/distribution"
      />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-risevia-teal text-white text-lg px-6 py-2">
              Supply Chain Excellence
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
              RiseViA Distribution
            </h1>
            <p className="text-xl md:text-2xl text-risevia-charcoal dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Powering the cannabis supply chain with advanced logistics, 
              real-time tracking, and seamless compliance across all legal markets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-teal/40 transition-all duration-300 text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-risevia-purple mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-risevia-charcoal dark:text-gray-300">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
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
              Distribution Services
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive supply chain solutions designed for the unique requirements 
              of the cannabis industry, ensuring quality, compliance, and efficiency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-teal/40 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white mb-4">
                      {service.icon}
                    </div>
                    <CardTitle className="text-xl text-risevia-black dark:text-gray-100">
                      {service.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-risevia-charcoal dark:text-gray-300 mb-6">
                      {service.description}
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-risevia-black dark:text-gray-100">
                        Key Features:
                      </h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="text-sm text-risevia-charcoal dark:text-gray-300 flex items-center">
                            <div className="w-2 h-2 bg-risevia-teal rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Map Section */}
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
              Distribution Coverage
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              Our expanding network of distribution centers ensures fast, reliable delivery 
              across all legal cannabis markets.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coverage.map((location, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-teal/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-risevia-black dark:text-gray-100">
                        {location.state}
                      </h3>
                      <Badge 
                        className={
                          location.status === 'Active' ? 'bg-green-100 text-green-800' :
                          location.status === 'Expanding' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {location.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-risevia-charcoal dark:text-gray-300">
                      {location.centers > 0 ? (
                        <span>{location.centers} Distribution Center{location.centers > 1 ? 's' : ''}</span>
                      ) : (
                        <span>Coming Soon</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
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
                Technology-Driven Logistics
              </h2>
              <div className="space-y-4 text-risevia-charcoal dark:text-gray-300">
                <p className="text-lg leading-relaxed">
                  Our proprietary logistics platform combines AI-powered route optimization, 
                  real-time inventory tracking, and automated compliance monitoring.
                </p>
                <p className="text-lg leading-relaxed">
                  Advanced analytics provide insights into demand patterns, delivery performance, 
                  and supply chain efficiency, enabling continuous optimization.
                </p>
                <p className="text-lg leading-relaxed">
                  Integration with state tracking systems ensures seamless compliance 
                  across all jurisdictions while maintaining complete transparency.
                </p>
              </div>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold px-8 py-4"
                >
                  Learn About Our Technology
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 rounded-3xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-24 h-24 text-risevia-teal mx-auto mb-6" />
                  <div className="text-3xl font-bold gradient-text mb-4">
                    99.8% On-Time Delivery
                  </div>
                  <div className="text-lg text-risevia-charcoal dark:text-gray-300">
                    Industry-leading performance metrics
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-risevia-purple to-risevia-teal">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Partner with RiseViA Distribution
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Ready to optimize your cannabis supply chain? Connect with our distribution team 
              to explore partnership opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-risevia-purple hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Request Distribution Services
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-risevia-purple font-semibold px-8 py-4"
              >
                View Coverage Map
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
