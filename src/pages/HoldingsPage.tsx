import React from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Users, Globe, Award, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SEOHead } from '../components/SEOHead';

export const HoldingsPage = () => {
  const subsidiaries = [
    {
      name: 'RiseViA Farms',
      description: 'Premium cultivation and agricultural operations',
      icon: <Globe className="w-8 h-8" />,
      focus: 'Cultivation & Agriculture',
      status: 'Active'
    },
    {
      name: 'RiseViA Tech & IP',
      description: 'Technology development and intellectual property',
      icon: <Award className="w-8 h-8" />,
      focus: 'Technology & Innovation',
      status: 'Active'
    },
    {
      name: 'RiseViA Distribution',
      description: 'Supply chain and distribution network',
      icon: <TrendingUp className="w-8 h-8" />,
      focus: 'Logistics & Distribution',
      status: 'Active'
    },
    {
      name: 'RiseViA Retail',
      description: 'Direct-to-consumer retail operations',
      icon: <Users className="w-8 h-8" />,
      focus: 'Retail & Customer Experience',
      status: 'Active'
    },
    {
      name: 'RiseViA Fulfillment',
      description: 'Order processing and fulfillment services',
      icon: <Shield className="w-8 h-8" />,
      focus: 'Operations & Fulfillment',
      status: 'Active'
    },
    {
      name: 'RiseViA REIT',
      description: 'Real estate investment and property management',
      icon: <Building2 className="w-8 h-8" />,
      focus: 'Real Estate & Investment',
      status: 'Development'
    }
  ];

  const stats = [
    { label: 'Active Subsidiaries', value: '6', icon: <Building2 className="w-6 h-6" /> },
    { label: 'States of Operation', value: '12+', icon: <Globe className="w-6 h-6" /> },
    { label: 'Team Members', value: '50+', icon: <Users className="w-6 h-6" /> },
    { label: 'Years Experience', value: '10+', icon: <Award className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 dark:from-risevia-black dark:via-risevia-charcoal dark:to-risevia-black">
      <SEOHead
        title="RiseViA Holdings - Corporate Structure & Subsidiaries"
        description="Learn about RiseViA Holdings' comprehensive business structure, including our six subsidiaries spanning cultivation, technology, distribution, retail, fulfillment, and real estate."
        canonical="https://risevia.com/holdings"
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
              Corporate Structure
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
              RiseViA Holdings
            </h1>
            <p className="text-xl md:text-2xl text-risevia-charcoal dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              A comprehensive cannabis enterprise with six specialized subsidiaries 
              covering the entire value chain from cultivation to consumer experience.
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

      {/* Subsidiaries Section */}
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
              Our Subsidiaries
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              Each subsidiary specializes in a critical aspect of the cannabis industry, 
              creating a vertically integrated ecosystem for maximum quality and efficiency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subsidiaries.map((subsidiary, index) => (
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
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                        {subsidiary.icon}
                      </div>
                      <Badge 
                        className={subsidiary.status === 'Active' ? 
                          'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {subsidiary.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-risevia-black dark:text-gray-100">
                      {subsidiary.name}
                    </CardTitle>
                    <div className="text-sm text-risevia-teal font-medium">
                      {subsidiary.focus}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-risevia-charcoal dark:text-gray-300 mb-6">
                      {subsidiary.description}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                Our Vision
              </h2>
              <div className="space-y-4 text-risevia-charcoal dark:text-gray-300">
                <p className="text-lg leading-relaxed">
                  RiseViA Holdings represents the future of cannabis business - a fully integrated 
                  ecosystem that controls every aspect of the customer experience from seed to sale.
                </p>
                <p className="text-lg leading-relaxed">
                  Our subsidiary structure allows us to maintain the highest standards of quality, 
                  compliance, and innovation while scaling efficiently across multiple markets.
                </p>
                <p className="text-lg leading-relaxed">
                  By combining traditional business excellence with cutting-edge technology and 
                  deep industry expertise, we're building the cannabis company of tomorrow.
                </p>
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
                  <Building2 className="w-24 h-24 text-risevia-teal mx-auto mb-6" />
                  <div className="text-3xl font-bold gradient-text mb-4">
                    Vertically Integrated
                  </div>
                  <div className="text-lg text-risevia-charcoal dark:text-gray-300">
                    Complete control over quality, compliance, and customer experience
                  </div>
                </div>
              </div>
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
              Interested in Partnership Opportunities?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Connect with our corporate development team to explore strategic partnerships 
              and investment opportunities.
            </p>
            <Button
              size="lg"
              className="bg-white text-risevia-purple hover:bg-gray-100 font-semibold px-8 py-4"
            >
              Contact Corporate Development
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
