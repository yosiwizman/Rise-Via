import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sun, Droplets, Shield, Award, MapPin, Thermometer, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SEOHead } from '../components/SEOHead';

export const FarmsPage = () => {
  const facilities = [
    {
      name: 'Northern California Facility',
      location: 'Humboldt County, CA',
      size: '50 acres',
      type: 'Outdoor & Greenhouse',
      capacity: '10,000 lbs/year',
      status: 'Active'
    },
    {
      name: 'Colorado Indoor Facility',
      location: 'Denver, CO',
      size: '25,000 sq ft',
      type: 'Indoor Hydroponic',
      capacity: '5,000 lbs/year',
      status: 'Active'
    },
    {
      name: 'Oregon Greenhouse Complex',
      location: 'Medford, OR',
      size: '15 acres',
      type: 'Climate-Controlled Greenhouse',
      capacity: '8,000 lbs/year',
      status: 'Expanding'
    }
  ];

  const practices = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Organic Cultivation',
      description: 'Certified organic growing practices with natural nutrients and pest management'
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: 'Water Conservation',
      description: 'Advanced irrigation systems and water recycling to minimize environmental impact'
    },
    {
      icon: <Sun className="w-8 h-8" />,
      title: 'Renewable Energy',
      description: 'Solar-powered facilities and energy-efficient LED lighting systems'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Integrated Pest Management',
      description: 'Natural pest control methods and beneficial insects for healthy plants'
    }
  ];

  const strains = [
    {
      name: 'Purple Haze',
      type: 'Sativa Dominant',
      thca: '28.5%',
      terpenes: ['Myrcene', 'Limonene', 'Pinene'],
      harvest: 'Indoor'
    },
    {
      name: 'OG Kush',
      type: 'Indica Dominant',
      thca: '26.8%',
      terpenes: ['Caryophyllene', 'Limonene', 'Myrcene'],
      harvest: 'Greenhouse'
    },
    {
      name: 'Blue Dream',
      type: 'Hybrid',
      thca: '24.2%',
      terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
      harvest: 'Outdoor'
    },
    {
      name: 'Gelato',
      type: 'Indica Dominant',
      thca: '29.1%',
      terpenes: ['Limonene', 'Caryophyllene', 'Linalool'],
      harvest: 'Indoor'
    }
  ];

  const stats = [
    { label: 'Total Cultivation Area', value: '90+', unit: 'acres', icon: <MapPin className="w-6 h-6" /> },
    { label: 'Annual Production', value: '23K+', unit: 'lbs', icon: <Leaf className="w-6 h-6" /> },
    { label: 'Strain Varieties', value: '50+', unit: 'strains', icon: <Award className="w-6 h-6" /> },
    { label: 'Farm Team Members', value: '75+', unit: 'people', icon: <Users className="w-6 h-6" /> }
  ];

  const certifications = [
    'USDA Organic Certified',
    'Good Agricultural Practices (GAP)',
    'Sustainable Cannabis Coalition Member',
    'Clean Green Certified',
    'State Licensed Cultivation',
    'ISO 9001 Quality Management'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50 dark:from-risevia-black dark:via-risevia-charcoal dark:to-risevia-black">
      <SEOHead
        title="RiseViA Farms - Premium Cannabis Cultivation"
        description="Discover RiseViA Farms' sustainable cannabis cultivation practices, organic growing methods, and premium THCA flower production across multiple facilities."
        canonical="https://risevia.com/farms"
      />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-green-600 text-white text-lg px-6 py-2">
              Sustainable Cultivation
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
              RiseViA Farms
            </h1>
            <p className="text-xl md:text-2xl text-risevia-charcoal dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Cultivating premium THCA cannabis with sustainable practices, 
              organic methods, and cutting-edge agricultural technology.
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
                <Card className="card-light border-gray-200 hover:border-green-500/40 transition-all duration-300 text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-green-600 to-risevia-teal rounded-full flex items-center justify-center text-white">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
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

      {/* Sustainable Practices */}
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
              Sustainable Practices
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              Our commitment to environmental stewardship drives every aspect 
              of our cultivation process, from seed to harvest.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {practices.map((practice, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className="card-light border-gray-200 hover:border-green-500/40 transition-all duration-300 h-full text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-600 to-risevia-teal rounded-full flex items-center justify-center text-white">
                      {practice.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-risevia-black dark:text-gray-100 mb-3">
                      {practice.title}
                    </h3>
                    <p className="text-risevia-charcoal dark:text-gray-300">
                      {practice.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
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
              Our Facilities
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              State-of-the-art cultivation facilities across multiple states, 
              each optimized for specific growing conditions and strain types.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className="card-light border-gray-200 hover:border-green-500/40 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        className={facility.status === 'Active' ? 
                          'bg-green-100 text-green-800' : 
                          'bg-blue-100 text-blue-800'
                        }
                      >
                        {facility.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-risevia-black dark:text-gray-100">
                      {facility.name}
                    </CardTitle>
                    <div className="text-sm text-risevia-charcoal dark:text-gray-300 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {facility.location}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-risevia-charcoal dark:text-gray-300">Size:</span>
                        <span className="text-sm font-medium text-risevia-black dark:text-gray-100">
                          {facility.size}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-risevia-charcoal dark:text-gray-300">Type:</span>
                        <span className="text-sm font-medium text-risevia-black dark:text-gray-100">
                          {facility.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-risevia-charcoal dark:text-gray-300">Capacity:</span>
                        <span className="text-sm font-medium text-green-600">
                          {facility.capacity}
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

      {/* Featured Strains */}
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
              Featured Strains
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto">
              Our master cultivators have developed exceptional strains with 
              unique terpene profiles and consistent potency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {strains.map((strain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="card-light border-gray-200 hover:border-green-500/40 transition-all duration-300 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg text-risevia-black dark:text-gray-100">
                      {strain.name}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-risevia-teal text-white">
                        {strain.thca} THCA
                      </Badge>
                      <span className="text-xs text-risevia-charcoal dark:text-gray-300">
                        {strain.harvest}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-risevia-black dark:text-gray-100">
                          Type: 
                        </span>
                        <span className="text-sm text-risevia-charcoal dark:text-gray-300 ml-1">
                          {strain.type}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-risevia-black dark:text-gray-100 block mb-1">
                          Dominant Terpenes:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {strain.terpenes.map((terpene, terpIndex) => (
                            <Badge
                              key={terpIndex}
                              variant="outline"
                              className="text-xs border-green-500 text-green-600"
                            >
                              {terpene}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
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
                Certifications & Standards
              </h2>
              <p className="text-lg text-risevia-charcoal dark:text-gray-300 mb-8">
                Our commitment to quality and compliance is reflected in our 
                comprehensive certifications and adherence to industry standards.
              </p>
              <ul className="space-y-3">
                {certifications.map((cert, index) => (
                  <li key={index} className="flex items-center">
                    <Award className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-risevia-charcoal dark:text-gray-300">
                      {cert}
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
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-green-600/20 to-risevia-teal/20 rounded-3xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <Thermometer className="w-24 h-24 text-green-600 mx-auto mb-6" />
                  <div className="text-3xl font-bold gradient-text mb-4">
                    Climate Controlled
                  </div>
                  <div className="text-lg text-risevia-charcoal dark:text-gray-300">
                    Precision environmental control for optimal plant health
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-risevia-teal">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Experience Farm-Fresh Quality
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Discover the difference that sustainable cultivation and expert craftsmanship 
              make in every product we grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Shop Farm Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8 py-4"
              >
                Schedule Farm Tour
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
