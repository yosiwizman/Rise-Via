import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Shield, Zap, Database, Code, Lightbulb, Lock, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SEOHead } from '../components/SEOHead';

export const TechIPPage = () => {
  const technologies = [
    {
      name: 'Cultivation Analytics Platform',
      description: 'AI-powered cultivation monitoring and optimization system',
      icon: <Database className="w-8 h-8" />,
      category: 'Agriculture Tech',
      status: 'Active',
      features: ['Real-time monitoring', 'Predictive analytics', 'Yield optimization', 'Quality control']
    },
    {
      name: 'Compliance Management System',
      description: 'Automated compliance tracking and reporting platform',
      icon: <Shield className="w-8 h-8" />,
      category: 'RegTech',
      status: 'Active',
      features: ['Regulatory tracking', 'Automated reporting', 'Audit trails', 'Multi-state compliance']
    },
    {
      name: 'Supply Chain Optimization',
      description: 'End-to-end supply chain visibility and optimization',
      icon: <Zap className="w-8 h-8" />,
      category: 'Logistics Tech',
      status: 'Development',
      features: ['Inventory management', 'Route optimization', 'Demand forecasting', 'Quality tracking']
    },
    {
      name: 'Customer Experience Platform',
      description: 'Personalized customer journey and recommendation engine',
      icon: <Smartphone className="w-8 h-8" />,
      category: 'Customer Tech',
      status: 'Active',
      features: ['Personalization', 'Recommendation engine', 'Customer analytics', 'Loyalty programs']
    }
  ];

  const patents = [
    {
      title: 'Cannabis Cultivation Monitoring System',
      number: 'US Patent Pending',
      description: 'IoT-based environmental monitoring and control system for cannabis cultivation',
      status: 'Pending'
    },
    {
      title: 'Automated Compliance Reporting Method',
      number: 'US Patent Pending',
      description: 'Machine learning approach to automated cannabis regulatory compliance',
      status: 'Pending'
    },
    {
      title: 'Cannabis Quality Assessment Algorithm',
      number: 'US Patent Pending',
      description: 'Computer vision and AI system for automated cannabis quality grading',
      status: 'Pending'
    }
  ];

  const innovations = [
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'AI & Machine Learning',
      description: 'Advanced algorithms for cultivation optimization and quality prediction'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Blockchain Integration',
      description: 'Immutable tracking and verification throughout the supply chain'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'API-First Architecture',
      description: 'Scalable, modular systems designed for integration and growth'
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'Innovation Labs',
      description: 'Continuous R&D for next-generation cannabis technology solutions'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 dark:from-risevia-black dark:via-risevia-charcoal dark:to-risevia-black">
      <SEOHead
        title="RiseViA Tech & IP - Cannabis Technology Innovation"
        description="Discover RiseViA's cutting-edge technology solutions and intellectual property portfolio, including AI-powered cultivation systems, compliance platforms, and supply chain optimization."
        canonical="https://risevia.com/tech-ip"
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
              Technology & Innovation
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
              RiseViA Tech & IP
            </h1>
            <p className="text-xl md:text-2xl text-risevia-charcoal dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Pioneering the future of cannabis through cutting-edge technology, 
              artificial intelligence, and innovative intellectual property solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Innovation Highlights */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {innovations.map((innovation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-purple/40 transition-all duration-300 text-center h-full">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                      {innovation.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-risevia-black dark:text-gray-100 mb-2">
                      {innovation.title}
                    </h3>
                    <p className="text-sm text-risevia-charcoal dark:text-gray-300">
                      {innovation.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Portfolio */}
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
              Technology Portfolio
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive suite of proprietary technologies covers every aspect 
              of the cannabis value chain, from cultivation to customer experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-purple/40 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                        {tech.icon}
                      </div>
                      <div className="text-right">
                        <Badge className="bg-risevia-teal text-white mb-2">
                          {tech.category}
                        </Badge>
                        <div>
                          <Badge 
                            className={tech.status === 'Active' ? 
                              'bg-green-100 text-green-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {tech.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-risevia-black dark:text-gray-100">
                      {tech.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-risevia-charcoal dark:text-gray-300 mb-6">
                      {tech.description}
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-risevia-black dark:text-gray-100">
                        Key Features:
                      </h4>
                      <ul className="space-y-1">
                        {tech.features.map((feature, featureIndex) => (
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

      {/* Intellectual Property */}
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
              Intellectual Property
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              Our growing patent portfolio protects innovative solutions that advance 
              the cannabis industry through technology and process improvements.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {patents.map((patent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-purple/40 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-risevia-purple text-white">
                        {patent.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-risevia-black dark:text-gray-100">
                      {patent.title}
                    </CardTitle>
                    <div className="text-sm text-risevia-teal font-medium">
                      {patent.number}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-risevia-charcoal dark:text-gray-300">
                      {patent.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              Technology Partnership Opportunities
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Interested in licensing our technology or exploring joint development opportunities? 
              Connect with our technology team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-risevia-purple hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Technology Licensing
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-risevia-purple font-semibold px-8 py-4"
              >
                R&D Partnerships
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
