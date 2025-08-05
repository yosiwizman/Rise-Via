import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Shield, Award, ChevronRight, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { SEOHead } from '../components/SEOHead';
import strainsData from '../data/strains.json';

export const HomePage = () => {
  const navigate = useNavigate();
  const featuredStrains = strainsData.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-teal-50">
      <SEOHead
        title="Premium THCA Cannabis Products"
        description="Discover RiseViA's premium THCA cannabis products. Lab-tested, federally compliant, and naturally elevated wellness solutions. Explore our curated selection of high-potency strains."
        canonical="https://risevia.com"
      />
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-white to-teal-50">
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl mx-auto px-4"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-4">
              RiseViA
            </h1>
          </motion.div>
        </motion.div>

        {/* Move text and button to bottom */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-2xl md:text-3xl text-white mb-8 font-light"
          >
            Wellness, Naturally Elevated
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              onClick={() => navigate('/shop')}
              size="lg"
              className="neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold px-8 py-4 text-lg rounded-2xl"
            >
              Explore Strains
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-risevia-teal rounded-full flex justify-center">
            <div className="w-1 h-3 bg-risevia-teal rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* About Us Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              About RiseViA
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're dedicated to providing premium THCA products that elevate your wellness journey. 
              Every strain is carefully cultivated, lab-tested for purity, and delivered with complete 
              transparency and compliance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Lab Tested",
                description: "Every batch is third-party tested for potency, pesticides, and heavy metals"
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Premium Quality",
                description: "Hand-selected strains with exceptional THCA potency and terpene profiles"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Compliant",
                description: "Fully compliant with federal regulations, containing less than 0.3% Delta-9 THC"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <Card className="card-light border-gray-200 hover:border-risevia-teal/40 transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl text-risevia-black dark:text-gray-100">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-risevia-charcoal dark:text-gray-300 text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What is THCA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                What is THCA?
              </h2>
              <div className="space-y-4 text-risevia-charcoal dark:text-gray-300">
                <p className="text-lg leading-relaxed">
                  THCA (Tetrahydrocannabinolic Acid) is the non-psychoactive precursor to THC found in raw cannabis. 
                  Unlike THC, THCA doesn't produce intoxicating effects in its natural state.
                </p>
                <p className="text-lg leading-relaxed">
                  When heated through smoking, vaping, or cooking, THCA converts to THC through a process called 
                  decarboxylation. This makes THCA products federally compliant while maintaining potency potential.
                </p>
                <p className="text-lg leading-relaxed">
                  Our THCA products contain less than 0.3% Delta-9 THC, meeting federal compliance standards 
                  while offering high THCA percentages for those seeking premium cannabis experiences.
                </p>
              </div>
              <Button
                onClick={() => navigate('/learn')}
                variant="outline"
                className="mt-6 border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
              >
                Learn More
              </Button>
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
                  <div className="text-6xl font-bold gradient-text mb-4">THCA</div>
                  <div className="text-2xl text-risevia-charcoal dark:text-gray-300 mb-2">Non-Psychoactive</div>
                  <div className="text-lg text-risevia-charcoal/70">Until Heated</div>
                  <div className="mt-6 flex justify-center">
                    <Play className="w-16 h-16 text-risevia-teal" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lab-Tested Compliance Badge */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-risevia-purple to-risevia-teal p-1 rounded-3xl"
          >
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <Badge className="mb-4 bg-risevia-teal text-white text-lg px-4 py-2">
                🔬 Lab Certified
              </Badge>
              <h3 className="text-3xl font-bold text-risevia-black dark:text-gray-100 mb-4">
                Third-Party Lab Tested
              </h3>
              <p className="text-risevia-charcoal dark:text-gray-300 text-lg mb-6">
                Every batch comes with a Certificate of Analysis (COA) showing exact potency, 
                pesticide screening, and heavy metal testing results.
              </p>
              <Button
                onClick={() => navigate('/legal')}
                variant="outline"
                className="border-risevia-purple text-risevia-purple hover:bg-risevia-purple hover:text-white"
              >
                View Lab Results
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Strains Carousel */}
      <section className="py-20 px-4 bg-risevia-light-gray">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Featured Strains
            </h2>
            <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-2xl mx-auto">
              Discover our premium selection of high-potency THCA strains, 
              each carefully cultivated and lab-tested for exceptional quality.
            </p>
          </motion.div>

          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {featuredStrains.map((strain, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <Card className="card-light border-gray-200 hover:border-risevia-teal/40 transition-all duration-300 overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 relative">
                        <img
                          src={strain.image_url}
                          alt={strain.strain_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-risevia-teal text-white">
                            {strain.thca_potency}% THCA
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-risevia-black dark:text-gray-100 text-xl">{strain.strain_name}</CardTitle>
                        <div className="flex justify-between text-sm text-risevia-charcoal dark:text-gray-300/70">
                          <span>Volume: {strain.volume}</span>
                          <span>{strain.category}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-risevia-charcoal dark:text-gray-300 text-sm mb-4">{strain.description}</p>
                        <Button
                          onClick={() => navigate('/shop')}
                          className="w-full neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-risevia-purple border-risevia-purple hover:bg-risevia-purple hover:text-white" />
            <CarouselNext className="text-risevia-purple border-risevia-purple hover:bg-risevia-purple hover:text-white" />
          </Carousel>

          <div className="text-center mt-8">
            <Button
              onClick={() => navigate('/shop')}
              size="lg"
              variant="outline"
              className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
            >
              View All Strains
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
